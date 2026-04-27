#!/usr/bin/env node
// Build src/data/audioSpriteManifest.json + src/data/audioSprites.ts purely
// from the audio files already present in public/assets/audio/. The current
// pipeline produces .mp3 sprites via tools/tts-generator (browser-based);
// legacy .m4a files are still supported transparently because `afconvert`
// handles both container formats.
//
// Pipeline per file:
//   1. Decode the audio to a 22050 Hz mono 16-bit WAV via `afconvert`.
//   2. Run silence detection to recover one segment per item.
//   3. Cross-check the segment count against `spec.items.length` from
//      tts-content.mjs and emit a warning (or hard fail with --strict) when
//      they disagree, so downstream index maps in audioSprites.ts stay valid.
//   4. Emit the manifest JSON and the TypeScript module.
//
// Use this when you already have audio assets and just want to (re)build the
// manifest + TS without re-running TTS. The preferred way to regenerate the
// audio itself is now tools/tts-generator/index.html (runs in Microsoft
// Edge, avoids the intermittent "no audio received" errors that plague the
// local edge-tts CLI pipeline).
//
// Usage:
//   node scripts/build-sprite-manifest.mjs                # all audio files
//   node scripts/build-sprite-manifest.mjs numbers-vi     # subset (topic-locale)
//   node scripts/build-sprite-manifest.mjs --strict       # fail on segment-count mismatch
//   node scripts/build-sprite-manifest.mjs --no-reconcile # disable automatic count fixup
//
// By default, when the silence-detected segment count does not match
// `spec.items.length`, the script reconciles to the expected count:
//   - too many: merge the adjacent pair with the smallest silence gap;
//   - too few: split the longest segment at its quietest internal valley.
// This keeps index maps in audioSprites.ts valid without hand-editing.
//
// Requires:
//   - macOS `afconvert` (system).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { GENERATION_SPECS, SPRITE_INDICES } from "./tts-content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const tempRoot = "/tmp/nthkids-sprite-build";

const SAMPLE_RATE = 22050;

// Silence detection parameters tuned for TTS sentence pauses. Must stay in
// sync with generate-tts-sprites.mjs so segments are recovered identically
// regardless of which entry point built the manifest.
const WINDOW_MS = 30;
const SILENCE_DBFS = -42;
const MIN_SEGMENT_MS = 120;
const MIN_SILENCE_MS = 220;
const PADDING_MS = 60;

const ROUND = n => Math.round(n * 1000) / 1000;

const ensureDir = path => {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
};

const run = (cmd, argv) => {
  try {
    execFileSync(cmd, argv, { stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    const stderr = error.stderr?.toString?.() ?? "";
    throw new Error(`${cmd} ${argv.join(" ")} failed: ${error.message}\n${stderr}`, {
      cause: error,
    });
  }
};

const decodeToWav = (audioPath, wavPath) => {
  if (existsSync(wavPath)) rmSync(wavPath);
  run("afconvert", ["-f", "WAVE", "-d", `LEI16@${SAMPLE_RATE}`, "-c", "1", audioPath, wavPath]);
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
    throw new Error(`Unexpected WAV format in ${path}: ${channels}ch ${bits}bit @ ${sampleRate}Hz`);
  }
  return new Int16Array(
    buf.buffer.slice(buf.byteOffset + dataOffset, buf.byteOffset + dataOffset + dataSize)
  );
};

const computeWindowRms = samples => {
  const windowSize = Math.max(1, Math.round((SAMPLE_RATE * WINDOW_MS) / 1000));
  const windowCount = Math.floor(samples.length / windowSize);
  const rms = new Float32Array(windowCount);
  for (let w = 0; w < windowCount; w++) {
    let sumSq = 0;
    const base = w * windowSize;
    for (let i = 0; i < windowSize; i++) {
      const s = samples[base + i];
      sumSq += s * s;
    }
    rms[w] = Math.sqrt(sumSq / windowSize);
  }
  return { rms, windowSize, windowCount };
};

const findRawSegments = rms => {
  const minSilenceWindows = Math.ceil(MIN_SILENCE_MS / WINDOW_MS);
  const minSegmentWindows = Math.ceil(MIN_SEGMENT_MS / WINDOW_MS);
  const silenceThreshold = Math.pow(10, SILENCE_DBFS / 20) * 32768;

  const raw = [];
  let inVoice = false;
  let voiceStart = 0;
  let silenceRun = 0;
  for (let w = 0; w <= rms.length; w++) {
    const v = w < rms.length ? rms[w] > silenceThreshold : false;
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
  return raw;
};

// Reconcile the detected segment count against the known expected count
// from the TTS spec. Two strategies:
//   - too many: repeatedly merge the adjacent pair most likely to be an
//     over-split — the pair where the shorter side is smallest (an over-split
//     always produces at least one unusually short half), with a small gap
//     bias as a tiebreaker.
//   - too few: repeatedly split the segment most likely to contain a merged
//     item — the longest segment whose interior contains the quietest dip,
//     splitting at the centre of that valley.
// Returns { segments, mergeOps, splitOps } where segments is the adjusted
// list of { sw, ew } window ranges.
const reconcileSegmentCount = (rawSegments, rms, expected) => {
  const minSegmentWindows = Math.ceil(MIN_SEGMENT_MS / WINDOW_MS);
  const segments = rawSegments.map(s => ({ ...s }));
  let mergeOps = 0;
  let splitOps = 0;

  const segDur = s => s.ew - s.sw;

  while (segments.length > expected && segments.length > 1) {
    let bestScore = Infinity;
    let bestIdx = -1;
    for (let i = 0; i < segments.length - 1; i++) {
      const left = segments[i];
      const right = segments[i + 1];
      const gap = right.sw - left.ew;
      const shorterSide = Math.min(segDur(left), segDur(right));
      const score = shorterSide + gap * 0.25;
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) break;
    segments[bestIdx] = { sw: segments[bestIdx].sw, ew: segments[bestIdx + 1].ew };
    segments.splice(bestIdx + 1, 1);
    mergeOps++;
  }

  while (segments.length < expected) {
    const medianDur = (() => {
      const sorted = segments.map(segDur).sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)] || 1;
    })();

    let bestSegIdx = -1;
    let bestSplitW = -1;
    let bestScore = Infinity;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const dur = segDur(seg);
      if (dur < 2 * minSegmentWindows + 1) continue;
      const lo = seg.sw + minSegmentWindows;
      const hi = seg.ew - minSegmentWindows;
      const lengthBias = Math.max(1, medianDur) / Math.max(1, dur);
      for (let w = lo; w < hi; w++) {
        const score = rms[w] * lengthBias;
        if (score < bestScore) {
          bestScore = score;
          bestSplitW = w;
          bestSegIdx = i;
        }
      }
    }
    if (bestSegIdx === -1) break;

    const seg = segments[bestSegIdx];
    const splitRms = rms[bestSplitW];
    const valleyCeil = Math.max(splitRms * 1.5, splitRms + 1);
    let valleyStart = bestSplitW;
    let valleyEnd = bestSplitW;
    while (valleyStart - 1 >= seg.sw + minSegmentWindows && rms[valleyStart - 1] <= valleyCeil) {
      valleyStart--;
    }
    while (valleyEnd + 1 <= seg.ew - minSegmentWindows && rms[valleyEnd + 1] <= valleyCeil) {
      valleyEnd++;
    }
    const right = { sw: valleyEnd + 1, ew: seg.ew };
    segments[bestSegIdx] = { sw: seg.sw, ew: valleyStart };
    segments.splice(bestSegIdx + 1, 0, right);
    splitOps++;
  }

  return { segments, mergeOps, splitOps };
};

const toSecondSegments = (windowSegments, samples, windowSize) => {
  const padSec = PADDING_MS / 1000;
  const totalSec = samples.length / SAMPLE_RATE;
  return windowSegments.map(({ sw, ew }) => ({
    start: ROUND(Math.max(0, (sw * windowSize) / SAMPLE_RATE - padSec)),
    end: ROUND(Math.min(totalSec, (ew * windowSize) / SAMPLE_RATE + padSec)),
  }));
};

const specId = spec => `${spec.topic}-${spec.locale}`;

// Some items declare `segments: N` to indicate they're rendered as N raw
// audio segments (e.g. a sentence with internal punctuation that TTS speaks
// with a noticeable pause). When the raw segment count matches the sum of
// per-item segment counts, we deterministically merge each item's raw
// segments back into one final segment, in spec order. This is unambiguous
// and avoids guessing which adjacent pair is an over-split.
const segmentsPerItem = spec => spec.items.map(item => item.segments ?? 1);

const collapseByItemSegments = (rawSegments, perItemCounts) => {
  const total = perItemCounts.reduce((sum, n) => sum + n, 0);
  if (rawSegments.length !== total) return null;
  const out = [];
  let cursor = 0;
  for (const count of perItemCounts) {
    const first = rawSegments[cursor];
    const last = rawSegments[cursor + count - 1];
    out.push({ sw: first.sw, ew: last.ew });
    cursor += count;
  }
  return out;
};

const analyseAudioFile = (spec, { strict, reconcile }) => {
  const audioPath = resolve(repoRoot, spec.output);
  if (!existsSync(audioPath)) {
    throw new Error(`[${specId(spec)}] missing audio file: ${spec.output}`);
  }

  const id = specId(spec);
  const workDir = `${tempRoot}/${id}`;
  ensureDir(workDir);
  const wavPath = `${workDir}/decoded.wav`;
  decodeToWav(audioPath, wavPath);

  const samples = readWavSamples(wavPath);
  const { rms, windowSize } = computeWindowRms(samples);
  const rawWindowSegments = findRawSegments(rms);
  const detectedCount = rawWindowSegments.length;
  const perItemCounts = segmentsPerItem(spec);
  const expectedCount = spec.items.length;
  const expectedRawCount = perItemCounts.reduce((sum, n) => sum + n, 0);
  const duration = ROUND(samples.length / SAMPLE_RATE);

  let windowSegments = rawWindowSegments;
  let reconciled = null;

  const structural =
    expectedRawCount !== expectedCount
      ? collapseByItemSegments(rawWindowSegments, perItemCounts)
      : null;
  if (structural) {
    windowSegments = structural;
    reconciled = { mergeOps: expectedRawCount - expectedCount, splitOps: 0, mode: "structural" };
    console.log(
      `  info: ${id} collapsed by per-item segments (raw=${detectedCount} -> ${expectedCount}).`
    );
  } else if (detectedCount !== expectedCount) {
    const msg =
      `[${id}] segment count mismatch: detected=${detectedCount}, expected=${expectedCount}. ` +
      "Index maps in audioSprites.ts assume the expected count.";

    if (reconcile) {
      const { segments, mergeOps, splitOps } = reconcileSegmentCount(
        rawWindowSegments,
        rms,
        expectedCount
      );
      if (segments.length === expectedCount) {
        windowSegments = segments;
        reconciled = { mergeOps, splitOps, mode: "heuristic" };
        console.log(
          `  info: ${id} reconciled to ${expectedCount} segments ` +
            `(merges=${mergeOps}, splits=${splitOps}).`
        );
      } else {
        const failMsg =
          `${msg} Auto-reconcile fell short: ended at ${segments.length} ` +
          `(merges=${mergeOps}, splits=${splitOps}).`;
        if (strict) throw new Error(failMsg);
        console.warn(`  warn: ${failMsg}`);
      }
    } else if (strict) {
      throw new Error(msg);
    } else {
      console.warn(`  warn: ${msg}`);
    }
  }

  return {
    duration,
    sampleRate: SAMPLE_RATE,
    segments: toSecondSegments(windowSegments, samples, windowSize),
    reconciled,
  };
};

export const buildManifest = (analysed, { write = true } = {}) => {
  const manifest = {};
  for (const [id, { spec, result }] of analysed.entries()) {
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

  if (write) {
    const outPath = resolve(repoRoot, "src/data/audioSpriteManifest.json");
    writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`Wrote ${outPath}`);
  }
  return manifest;
};

export const buildTypeScript = (manifest, { write = true } = {}) => {
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

  const numbersByLocale = Object.fromEntries(
    Object.entries(SPRITE_INDICES.numbers).map(([locale, indices]) => [
      locale,
      Object.fromEntries(Object.entries(indices).map(([k, v]) => [Number(k), v])),
    ])
  );

  const body = `// AUTO-GENERATED by scripts/build-sprite-manifest.mjs - do not hand-edit.
// Regenerate with: \`node scripts/build-sprite-manifest.mjs\` (uses existing audio files)
// or \`node scripts/generate-tts-sprites.mjs\` (re-runs TTS, then rebuilds).
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

// Per-locale index maps. EN keeps the legacy hand-tuned offsets (intro at
// index 0 for alphabet, hand-picked takes for colors/shapes); VI uses the
// content order from the TTS spec (0-based).
export const LETTER_SPRITE_INDEX: Record<SpriteLocale, Partial<Record<string, number>>> = ${json(SPRITE_INDICES.letters)};

export const NUMBER_SPRITE_INDEX: Record<SpriteLocale, Partial<Record<number, number>>> = ${json(numbersByLocale)};

export const COLOR_SPRITE_INDEX: Record<SpriteLocale, Partial<Record<ColorId, number>>> = ${json(SPRITE_INDICES.colors)};

export const SHAPE_SPRITE_INDEX: Record<SpriteLocale, Partial<Record<ShapeId, number>>> = ${json(SPRITE_INDICES.shapes)};

export const PROMPT_SPRITE_INDEX: Record<SpriteLocale, Record<PromptKey, number>> = ${json(SPRITE_INDICES.prompts)};

// Alphabet words ("Apple" for A, etc.) are recorded per locale.
export const ALPHABET_WORDS_SPRITE_INDEX: Record<SpriteLocale, Partial<Record<string, number>>> = ${json(SPRITE_INDICES.alphabetWords)};
`;

  if (write) {
    const outPath = resolve(repoRoot, "src/data/audioSprites.ts");
    writeFileSync(outPath, body);
    console.log(`Wrote ${outPath}`);
  }
  return body;
};

export const buildSpriteManifestFromAudio = ({
  filters = [],
  strict = false,
  reconcile = true,
} = {}) => {
  ensureDir(tempRoot);
  const specs = GENERATION_SPECS.filter(
    spec => filters.length === 0 || filters.includes(specId(spec))
  );
  if (specs.length === 0) {
    throw new Error(
      `No specs match filters [${filters.join(", ")}]. Known specs: ${GENERATION_SPECS.map(specId).join(", ")}`
    );
  }

  const flags = [strict ? "strict" : null, reconcile ? "reconcile" : null].filter(Boolean);
  console.log(
    `Building manifest from ${specs.length} audio file${specs.length === 1 ? "" : "s"}` +
      `${flags.length ? ` (${flags.join(", ")})` : ""}...`
  );

  const analysed = new Map();
  for (const spec of specs) {
    const id = specId(spec);
    const result = analyseAudioFile(spec, { strict, reconcile });
    console.log(
      `[${id}] ${spec.output}  duration=${result.duration}s  segments=${result.segments.length}`
    );
    analysed.set(id, { spec, result });
  }

  const manifest = buildManifest(analysed);
  buildTypeScript(manifest);
  return manifest;
};

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const reconcile = !args.includes("--no-reconcile");
  const filters = args.filter(a => !a.startsWith("--"));
  try {
    buildSpriteManifestFromAudio({ filters, strict, reconcile });
    console.log("\nDone.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
