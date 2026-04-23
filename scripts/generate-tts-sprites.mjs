#!/usr/bin/env node
// Generate locale-aware TTS sprites for nth-kids.
//
// Pipeline per spec:
//   1. Batch items in groups (default 10 per call) and synthesise each batch
//      via edge-tts-universal — each item is separated by a sentence period
//      so the TTS engine inserts a natural pause we can detect later.
//   2. Decode each batch MP3 to a 22050 Hz mono 16-bit WAV via `afconvert`.
//   3. Run silence detection on every batch WAV to recover one segment per
//      item; abort if the segment count does not match the batch size.
//   4. Concatenate all batch WAVs with a longer batch-gap and project the
//      per-batch segments into the combined timeline.
//   5. Convert the combined WAV to AAC (.m4a) via `afconvert` and record the
//      segments in src/data/audioSpriteManifest.json + audioSprites.ts.
//
// Why batching:
//   The free edge-tts tier returns "no audio received" for many short Vietnamese
//   phrases when called rapidly. Joining items into longer sentences keeps the
//   call rate low and avoids the short-token failure mode entirely.
//
// Usage:
//   node scripts/generate-tts-sprites.mjs                 # all specs
//   node scripts/generate-tts-sprites.mjs numbers-vi      # subset (topic-locale)
//   node scripts/generate-tts-sprites.mjs --skip-tts      # reuse cached MP3s
//   node scripts/generate-tts-sprites.mjs --batch 5       # smaller batches
//
// Requires: edge-tts-universal (installed), afconvert (macOS).
import { EdgeTTS } from "edge-tts-universal";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { GENERATION_SPECS, SPRITE_INDICES } from "./tts-content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const tempRoot = "/tmp/nthkids-tts";

const SAMPLE_RATE = 22050;
const BATCH_GAP_MS = 600; // silence inserted between batches in the final sprite
const ITEM_FADE_MS = 8;
const MAX_ATTEMPTS = 10;
const INTER_BATCH_MS = 4000; // long enough to dodge edge-tts free-tier throttling

// Silence detection parameters tuned for TTS sentence pauses.
const WINDOW_MS = 30;
const SILENCE_DBFS = -42;
const MIN_SEGMENT_MS = 120;
const MIN_SILENCE_MS = 220;
const PADDING_MS = 60;

const ROUND = n => Math.round(n * 1000) / 1000;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const args = process.argv.slice(2);
const skipTts = args.includes("--skip-tts");
const batchArgIndex = args.indexOf("--batch");
const BATCH_SIZE = batchArgIndex >= 0 ? Number(args[batchArgIndex + 1]) || 10 : 10;
const filters = args.filter(a => !a.startsWith("--") && !/^\d+$/.test(a));

const ensureDir = path => {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
};

const run = (cmd, argv) => {
  try {
    execFileSync(cmd, argv, { stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    const stderr = error.stderr?.toString?.() ?? "";
    throw new Error(`${cmd} ${argv.join(" ")} failed: ${error.message}\n${stderr}`);
  }
};

const synthesiseBatch = async (spec, items, mp3Path) => {
  if (skipTts && existsSync(mp3Path)) return false;
  if (existsSync(mp3Path)) return false;
  // Two periods nudge the engine into a noticeably longer pause than a single
  // sentence break, which keeps short clips from merging during silence
  // detection. Trailing period gives the last item clean trailing silence.
  const wrap = spec.wrapText ?? (text => text);
  const text =
    items
      .map(i => wrap(i.text.trim()))
      .join(".. ") + ".";
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const tts = new EdgeTTS(text, spec.voice, { rate: spec.rate });
      const result = await tts.synthesize();
      const buf = Buffer.from(await result.audio.arrayBuffer());
      if (buf.length === 0) throw new Error("empty audio buffer");
      writeFileSync(mp3Path, buf);
      return true;
    } catch (error) {
      lastError = error;
      // Linear-ish backoff capped at 30s so the longest cluster takes <5min;
      // exponential blew past sensible totals when many batches needed it.
      const wait = Math.min(3000 + 2500 * (attempt - 1), 30000) + Math.floor(Math.random() * 600);
      console.warn(
        `    warn: batch [${items[0].id}..${items[items.length - 1].id}] ` +
          `attempt ${attempt}/${MAX_ATTEMPTS} -> ${error.message}; retry in ${wait}ms`
      );
      await sleep(wait);
    }
  }
  throw new Error(
    `Failed to synthesise batch [${items[0].id}..${items[items.length - 1].id}] ` +
      `(${spec.voice}) after ${MAX_ATTEMPTS} attempts: ${lastError?.message}`
  );
};

const decodeToWav = (mp3Path, wavPath) => {
  if (existsSync(wavPath)) rmSync(wavPath); // re-decode each run; cheap
  run("afconvert", [
    "-f",
    "WAVE",
    "-d",
    `LEI16@${SAMPLE_RATE}`,
    "-c",
    "1",
    mp3Path,
    wavPath,
  ]);
};

const readWavSamples = path => {
  const buf = readFileSync(path);
  let offset = 12;
  let sampleRate = 0;
  let channels = 0;
  let bits = 0;
  let dataOffset = 0;
  let dataSize = 0;
  while (offset < buf.length - 8) {
    const id = buf.toString("ascii", offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === "fmt ") {
      channels = buf.readUInt16LE(offset + 10);
      sampleRate = buf.readUInt32LE(offset + 12);
      bits = buf.readUInt16LE(offset + 22);
    } else if (id === "data") {
      dataOffset = offset + 8;
      dataSize = size;
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (channels !== 1 || bits !== 16 || sampleRate !== SAMPLE_RATE) {
    throw new Error(
      `Unexpected WAV format in ${path}: ${channels}ch ${bits}bit @ ${sampleRate}Hz`
    );
  }
  return new Int16Array(
    buf.buffer.slice(buf.byteOffset + dataOffset, buf.byteOffset + dataOffset + dataSize)
  );
};

const detectSegments = samples => {
  const windowSize = Math.max(1, Math.round((SAMPLE_RATE * WINDOW_MS) / 1000));
  const minSilenceWindows = Math.ceil(MIN_SILENCE_MS / WINDOW_MS);
  const minSegmentWindows = Math.ceil(MIN_SEGMENT_MS / WINDOW_MS);
  const silenceThreshold = Math.pow(10, SILENCE_DBFS / 20) * 32768;

  const windowCount = Math.floor(samples.length / windowSize);
  const isVoice = new Array(windowCount);
  for (let w = 0; w < windowCount; w++) {
    let sumSq = 0;
    const base = w * windowSize;
    for (let i = 0; i < windowSize; i++) {
      const s = samples[base + i];
      sumSq += s * s;
    }
    isVoice[w] = Math.sqrt(sumSq / windowSize) > silenceThreshold;
  }

  const raw = [];
  let inVoice = false;
  let voiceStart = 0;
  let silenceRun = 0;
  for (let w = 0; w <= windowCount; w++) {
    const v = w < windowCount ? isVoice[w] : false;
    if (v) {
      if (!inVoice) {
        if (raw.length > 0 && silenceRun < minSilenceWindows) {
          inVoice = true;
          voiceStart = raw.pop().sw;
        } else {
          inVoice = true;
          voiceStart = w;
        }
      }
      silenceRun = 0;
    } else {
      if (inVoice) {
        const lengthWindows = w - voiceStart;
        if (lengthWindows >= minSegmentWindows) raw.push({ sw: voiceStart, ew: w });
        inVoice = false;
      }
      silenceRun++;
    }
  }

  const padSec = PADDING_MS / 1000;
  return raw.map(({ sw, ew }) => ({
    start: Math.max(0, (sw * windowSize) / SAMPLE_RATE - padSec),
    end: Math.min(samples.length / SAMPLE_RATE, (ew * windowSize) / SAMPLE_RATE + padSec),
  }));
};

const applyEdgeFade = samples => {
  const fadeSamples = Math.min(
    Math.round((ITEM_FADE_MS / 1000) * SAMPLE_RATE),
    Math.floor(samples.length / 4)
  );
  if (fadeSamples <= 0) return samples;
  for (let i = 0; i < fadeSamples; i++) {
    const scale = i / fadeSamples;
    samples[i] = Math.round(samples[i] * scale);
    samples[samples.length - 1 - i] = Math.round(samples[samples.length - 1 - i] * scale);
  }
  return samples;
};

const buildWav = (allChunks, totalSamples) => {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + totalSamples * 2, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(totalSamples * 2, 40);
  const body = Buffer.alloc(totalSamples * 2);
  let offset = 0;
  for (const chunk of allChunks) {
    Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength).copy(body, offset);
    offset += chunk.byteLength;
  }
  return Buffer.concat([header, body]);
};

// Synthesise a batch, decode to WAV, and silence-detect segments. If the
// detected count does not match the batch size, recursively subdivide and
// retry — this handles edge cases where two short clips merge into one
// segment despite the period separator.
const synthDetectOrSubdivide = async (spec, items, workDir, batchKey) => {
  const mp3Path = `${workDir}/${batchKey}.mp3`;
  const wavPath = `${workDir}/${batchKey}.wav`;
  const synthed = await synthesiseBatch(spec, items, mp3Path);
  decodeToWav(mp3Path, wavPath);
  const samples = readWavSamples(wavPath);
  const segments = detectSegments(samples);

  if (segments.length === items.length) {
    return { samples, segments, synthed };
  }

  if (items.length === 1) {
    throw new Error(
      `[${spec.topic}-${spec.locale}] ${batchKey}: TTS produced ${segments.length} segments ` +
        `for single item "${items[0].text}".`
    );
  }

  console.warn(
    `    warn: ${batchKey} expected ${items.length}, got ${segments.length} — subdividing.`
  );
  const mid = Math.ceil(items.length / 2);
  const left = await synthDetectOrSubdivide(spec, items.slice(0, mid), workDir, `${batchKey}a`);
  if (left.synthed) await sleep(INTER_BATCH_MS);
  const right = await synthDetectOrSubdivide(spec, items.slice(mid), workDir, `${batchKey}b`);

  // Stitch left + right with a small silence gap so segments stay disjoint
  // when projected back into the parent timeline.
  const gapSamples = Math.round((BATCH_GAP_MS / 1000) * SAMPLE_RATE);
  const stitched = new Int16Array(left.samples.length + gapSamples + right.samples.length);
  stitched.set(left.samples, 0);
  stitched.set(right.samples, left.samples.length + gapSamples);
  const offsetSec = (left.samples.length + gapSamples) / SAMPLE_RATE;
  const segments2 = [
    ...left.segments,
    ...right.segments.map(s => ({ start: s.start + offsetSec, end: s.end + offsetSec })),
  ];
  return { samples: stitched, segments: segments2, synthed: left.synthed || right.synthed };
};

const generateSpec = async spec => {
  const id = `${spec.topic}-${spec.locale}`;
  const workDir = `${tempRoot}/${id}`;
  ensureDir(workDir);

  const batches = [];
  for (let i = 0; i < spec.items.length; i += BATCH_SIZE) {
    batches.push(spec.items.slice(i, i + BATCH_SIZE));
  }
  console.log(`\n[${id}] ${spec.items.length} items in ${batches.length} batch(es) of ≤${BATCH_SIZE}`);

  const batchResults = [];
  for (let bi = 0; bi < batches.length; bi++) {
    const result = await synthDetectOrSubdivide(spec, batches[bi], workDir, `batch-${bi}`);
    batchResults.push(result);
    console.log(
      `  batch ${bi + 1}/${batches.length}: ${result.segments.length} segments, ${ROUND(result.samples.length / SAMPLE_RATE)}s`
    );
    if (result.synthed && bi < batches.length - 1) await sleep(INTER_BATCH_MS);
  }

  // Concatenate batches with extra silence between to keep batch boundaries clean.
  const batchGapSamples = Math.round((BATCH_GAP_MS / 1000) * SAMPLE_RATE);
  const batchGap = new Int16Array(batchGapSamples);

  const finalChunks = [];
  const finalSegments = [];
  let cursorSamples = 0;
  for (let bi = 0; bi < batchResults.length; bi++) {
    const { samples, segments } = batchResults[bi];
    finalChunks.push(applyEdgeFade(samples));
    const offsetSec = cursorSamples / SAMPLE_RATE;
    for (const seg of segments) {
      finalSegments.push({
        start: ROUND(offsetSec + seg.start),
        end: ROUND(offsetSec + seg.end),
      });
    }
    cursorSamples += samples.length;
    if (bi < batchResults.length - 1) {
      finalChunks.push(batchGap);
      cursorSamples += batchGapSamples;
    }
  }

  const combinedWavPath = `${workDir}/__combined.wav`;
  writeFileSync(combinedWavPath, buildWav(finalChunks, cursorSamples));

  const outputPath = resolve(repoRoot, spec.output);
  ensureDir(dirname(outputPath));
  run("afconvert", [
    "-f",
    "m4af",
    "-d",
    "aac",
    "-b",
    "96000",
    "--src-complexity",
    "bats",
    "-s",
    "3",
    combinedWavPath,
    outputPath,
  ]);

  return {
    duration: ROUND(cursorSamples / SAMPLE_RATE),
    sampleRate: SAMPLE_RATE,
    segments: finalSegments,
  };
};

const specId = spec => `${spec.topic}-${spec.locale}`;

// Existing hand-recorded English sprites. We keep them as-is but rewrite the
// `src` paths under `assets/audio/` so the runtime can find them, and embed
// them into the new locale-aware manifest shape.
const LEGACY_EN_MANIFEST = {
  alphabet: {
    src: "assets/audio/alphabet.m4a",
    duration: 22.867,
    sampleRate: 22050,
    segments: [
      { start: 0, end: 0.981 },
      { start: 1.331, end: 1.911 },
      { start: 2.112, end: 2.872 },
      { start: 3.072, end: 3.803 },
      { start: 3.973, end: 4.703 },
      { start: 4.904, end: 5.454 },
      { start: 5.594, end: 6.145 },
      { start: 6.435, end: 7.105 },
      { start: 7.276, end: 7.946 },
      { start: 8.086, end: 8.757 },
      { start: 8.957, end: 9.657 },
      { start: 9.827, end: 10.528 },
      { start: 10.698, end: 11.308 },
      { start: 11.479, end: 12.119 },
      { start: 12.289, end: 12.9 },
      { start: 13.1, end: 13.62 },
      { start: 13.79, end: 14.401 },
      { start: 14.571, end: 15.271 },
      { start: 15.472, end: 16.082 },
      { start: 16.252, end: 16.893 },
      { start: 17.063, end: 17.643 },
      { start: 17.844, end: 18.454 },
      { start: 18.654, end: 19.355 },
      { start: 19.525, end: 20.285 },
      { start: 20.516, end: 21.186 },
      { start: 21.356, end: 22.027 },
      { start: 22.197, end: 22.747 },
    ],
  },
  colors: {
    src: "assets/audio/colors.m4a",
    duration: 20.756,
    sampleRate: 22050,
    segments: [
      { start: 0, end: 0.65 },
      { start: 1.001, end: 1.611 },
      { start: 1.901, end: 2.572 },
      { start: 2.982, end: 3.623 },
      { start: 3.943, end: 4.493 },
      { start: 4.754, end: 5.214 },
      { start: 5.654, end: 6.355 },
      { start: 6.615, end: 7.436 },
      { start: 7.696, end: 8.216 },
      { start: 8.657, end: 9.357 },
      { start: 9.707, end: 10.408 },
      { start: 10.668, end: 11.399 },
      { start: 11.689, end: 12.66 },
      { start: 12.95, end: 13.92 },
      { start: 14.241, end: 14.881 },
      { start: 15.172, end: 15.842 },
      { start: 16.132, end: 17.073 },
      { start: 17.303, end: 18.184 },
      { start: 18.414, end: 19.264 },
      { start: 19.555, end: 20.315 },
    ],
  },
  numbers: {
    src: "assets/audio/numbers.m4a",
    duration: 146.32,
    sampleRate: 22050,
    segments: [],
  },
  shapes: {
    src: "assets/audio/shapes.m4a",
    duration: 13.627,
    sampleRate: 22050,
    segments: [
      { start: 0, end: 0.68 },
      { start: 1.121, end: 1.971 },
      { start: 2.352, end: 3.202 },
      { start: 3.643, end: 4.433 },
      { start: 4.784, end: 5.604 },
      { start: 5.955, end: 6.745 },
      { start: 7.095, end: 7.766 },
      { start: 8.266, end: 8.997 },
      { start: 9.347, end: 10.108 },
      { start: 10.488, end: 11.038 },
      { start: 11.479, end: 12.269 },
      { start: 12.62, end: 13.2 },
    ],
  },
};

// Pull the large `numbers` segments array from the previously-committed manifest
// to avoid inlining 100+ lines here.
const loadLegacyNumbers = () => {
  const manifestPath = resolve(repoRoot, "src/data/audioSpriteManifest.json");
  if (!existsSync(manifestPath)) return [];
  const parsed = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (Array.isArray(parsed?.numbers?.segments)) return parsed.numbers.segments;
  if (Array.isArray(parsed?.numbers?.en?.segments)) return parsed.numbers.en.segments;
  return [];
};

LEGACY_EN_MANIFEST.numbers.segments = loadLegacyNumbers();

const writeManifest = generated => {
  const manifest = {};

  for (const [topic, data] of Object.entries(LEGACY_EN_MANIFEST)) {
    manifest[topic] = { en: data };
  }

  for (const [id, { spec, result }] of generated.entries()) {
    const [topic, locale] = id.split("-");
    const entry = manifest[topic] ?? (manifest[topic] = {});
    const assetPath = spec.output.replace(/^public\//, "");
    entry[locale] = {
      src: assetPath,
      duration: result.duration,
      sampleRate: result.sampleRate,
      segments: result.segments,
    };
  }

  const outPath = resolve(repoRoot, "src/data/audioSpriteManifest.json");
  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nWrote ${outPath}`);
  return manifest;
};

const writeTypeScript = manifest => {
  const json = obj => JSON.stringify(obj);
  const topics = Object.keys(manifest);
  const entries = topics
    .map(topic => {
      const locales = Object.entries(manifest[topic])
        .map(
          ([locale, data]) => `    ${locale}: {
      src: ${JSON.stringify(data.src)},
      duration: ${data.duration},
      sampleRate: ${data.sampleRate},
      segments: ${json(data.segments)},
    }`
        )
        .join(",\n");
      return `  ${topic}: {\n${locales},\n  }`;
    })
    .join(",\n");

  const body = `// AUTO-GENERATED by scripts/generate-tts-sprites.mjs - do not hand-edit.
// Regenerate with: \`node scripts/generate-tts-sprites.mjs\`.
//
// Every sprite topic exposes one entry per supported locale. The runtime
// resolves the current locale via i18next and falls back to "en" when a
// VI asset has not been generated yet.

import type { ColorId } from "@/data/colors";
import type { ShapeId } from "@/data/shapes";

export type SpriteLocale = "en" | "vi";

export interface AudioSegment {
  start: number;
  end: number;
}

export interface AudioSpriteLocale {
  src: string;
  duration: number;
  sampleRate: number;
  segments: AudioSegment[];
}

export type AudioSprite = Partial<Record<SpriteLocale, AudioSpriteLocale>>;

export const AUDIO_SPRITES = {
${entries},
} satisfies Record<string, AudioSprite>;

export type SpriteTopic = keyof typeof AUDIO_SPRITES;

export type PromptKey =
  | "counting"
  | "alphabetGame"
  | "sequence"
  | "colorGuess"
  | "colorMatching"
  | "shapesGame"
  | "flashcardNumber"
  | "flashcardLetter"
  | "flashcardColor"
  | "flashcardShape"
  | "preview";

export const LETTER_SPRITE_INDEX: Partial<Record<string, number>> = ${json(SPRITE_INDICES.letters)};

export const NUMBER_SPRITE_INDEX: Partial<Record<number, number>> = ${json(
    Object.fromEntries(Object.entries(SPRITE_INDICES.numbers).map(([k, v]) => [Number(k), v]))
  )};

export const COLOR_SPRITE_INDEX: Partial<Record<ColorId, number>> = ${json(SPRITE_INDICES.colors)};

export const SHAPE_SPRITE_INDEX: Partial<Record<ShapeId, number>> = ${json(SPRITE_INDICES.shapes)};

export const PROMPT_SPRITE_INDEX: Record<PromptKey, number> = ${json(SPRITE_INDICES.prompts)};
`;

  const outPath = resolve(repoRoot, "src/data/audioSprites.ts");
  writeFileSync(outPath, body);
  console.log(`Wrote ${outPath}`);
};

const main = async () => {
  ensureDir(tempRoot);
  const specs = GENERATION_SPECS.filter(
    spec => filters.length === 0 || filters.includes(specId(spec))
  );
  console.log(
    `Generating ${specs.length} sprite${specs.length === 1 ? "" : "s"} ` +
      `(batch=${BATCH_SIZE}${skipTts ? ", reusing cached TTS" : ""})...`
  );

  const generated = new Map();
  for (const spec of specs) {
    const id = specId(spec);
    const result = await generateSpec(spec);
    console.log(
      `[${id}] -> ${spec.output}  duration=${result.duration}s  segments=${result.segments.length}`
    );
    generated.set(id, { spec, result });
  }

  const manifest = writeManifest(generated);
  writeTypeScript(manifest);
  console.log("\nDone.");
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
