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
//   5. Convert the combined WAV to AAC (.m4a) via `afconvert`. Once every
//      spec has produced its .m4a, delegate to `build-sprite-manifest.mjs`
//      to derive segments from the final audio and emit the manifest JSON
//      and TypeScript module.
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
// Requires:
//   - macOS `afconvert` (system).
//   - Python 3 with `edge-tts` (rany2/edge-tts) installed.
//     Install once with: pip3 install --user edge-tts
//   - scripts/edge_tts_synth.py wrapper (this repo) handling SSL behind the
//     corporate proxy.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSpriteManifestFromAudio } from "./build-sprite-manifest.mjs";
import { GENERATION_SPECS } from "./tts-content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const tempRoot = "/tmp/nthkids-tts";

const SAMPLE_RATE = 22050;
const BATCH_GAP_MS = 600; // silence inserted between batches in the final sprite
const ITEM_FADE_MS = 8;
const MAX_ATTEMPTS = 6;
const INTER_BATCH_MS = 500; // python wrapper is reliable; small pacing is enough
const MAX_SUBDIVIDE_DEPTH = 3;

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
const BATCH_SIZE = batchArgIndex >= 0 ? Number(args[batchArgIndex + 1]) || 6 : 6;
const filters = args.filter(a => !a.startsWith("--") && !/^\d+$/.test(a));

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

const PY_WRAPPER = resolve(__dirname, "edge_tts_synth.py");

const callPyWrapper = (spec, text, mp3Path) => {
  // `=` syntax for --rate stops argparse from treating values like `-15%` as
  // another option flag. `text` is passed as a bare argv entry — `spawnSync`
  // does not invoke a shell, so wrapping it in literal `"..."` would feed the
  // quote characters straight into edge-tts's SSML.
  const args = [
    PY_WRAPPER,
    "--voice",
    spec.voice,
    `--rate=${spec.rate}`,
    "--text",
    text,
    "--output",
    mp3Path,
  ];
  return spawnSync("python3", args, {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, EDGE_TTS_INSECURE: process.env.EDGE_TTS_INSECURE ?? "1" },
  });
};

const synthesiseBatch = async (spec, items, mp3Path) => {
  if (skipTts && existsSync(mp3Path)) return false;
  if (existsSync(mp3Path)) return false;
  // Two periods nudge the engine into a noticeably longer pause than a single
  // sentence break, which keeps short clips from merging during silence
  // detection. Trailing period gives the last item clean trailing silence.
  const wrap = spec.wrapText ?? (text => text);
  const text = items.map(i => wrap(i.text.trim())).join(".. ") + ".";

  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const proc = callPyWrapper(spec, text, mp3Path);
    if (proc.status === 0 && existsSync(mp3Path)) return true;
    const stderr = proc.stderr?.toString().trim() ?? "";
    // Wrapper exits with code 2 when edge-tts streams empty audio; treat as
    // retryable just like network errors.
    const reason =
      proc.status === 2
        ? "empty audio stream"
        : stderr || `python wrapper exited with code ${proc.status}`;
    lastError = new Error(reason);
    const wait = Math.min(2000 + 2000 * (attempt - 1), 20000) + Math.floor(Math.random() * 500);
    console.warn(
      `    warn: batch [${items[0].id}..${items[items.length - 1].id}] ` +
        `attempt ${attempt}/${MAX_ATTEMPTS} -> ${reason}; retry in ${wait}ms`
    );
    await sleep(wait);
  }
  throw new Error(
    `Failed to synthesise batch [${items[0].id}..${items[items.length - 1].id}] ` +
      `(${spec.voice}) after ${MAX_ATTEMPTS} attempts: ${lastError?.message}`
  );
};

const decodeToWav = (mp3Path, wavPath) => {
  if (existsSync(wavPath)) rmSync(wavPath); // re-decode each run; cheap
  run("afconvert", ["-f", "WAVE", "-d", `LEI16@${SAMPLE_RATE}`, "-c", "1", mp3Path, wavPath]);
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
// segment despite the period separator. The depth cap stops runaway recursion
// when silence detection is fundamentally unable to separate items, in which
// case the caller should use synthMode: "individual" instead.
const synthDetectOrSubdivide = async (spec, items, workDir, batchKey, depth = 0) => {
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
    if (segments.length === 0) {
      throw new Error(
        `[${spec.topic}-${spec.locale}] ${batchKey}: TTS returned silence for "${items[0].text}".`
      );
    }
    // Multiple detected segments inside one item — collapse to single span.
    const merged = { start: segments[0].start, end: segments[segments.length - 1].end };
    return { samples, segments: [merged], synthed };
  }

  if (depth >= MAX_SUBDIVIDE_DEPTH) {
    throw new Error(
      `[${spec.topic}-${spec.locale}] ${batchKey}: silence detection cannot separate ${items.length} ` +
        `items even after ${depth} subdivisions. Set synthMode: "individual" on this spec.`
    );
  }

  console.warn(
    `    warn: ${batchKey} expected ${items.length}, got ${segments.length} — subdividing.`
  );
  const mid = Math.ceil(items.length / 2);
  const left = await synthDetectOrSubdivide(
    spec,
    items.slice(0, mid),
    workDir,
    `${batchKey}a`,
    depth + 1
  );
  if (left.synthed) await sleep(INTER_BATCH_MS);
  const right = await synthDetectOrSubdivide(
    spec,
    items.slice(mid),
    workDir,
    `${batchKey}b`,
    depth + 1
  );

  return stitchResults(left, right);
};

const stitchResults = (left, right) => {
  const gapSamples = Math.round((BATCH_GAP_MS / 1000) * SAMPLE_RATE);
  const stitched = new Int16Array(left.samples.length + gapSamples + right.samples.length);
  stitched.set(left.samples, 0);
  stitched.set(right.samples, left.samples.length + gapSamples);
  const offsetSec = (left.samples.length + gapSamples) / SAMPLE_RATE;
  return {
    samples: stitched,
    segments: [
      ...left.segments,
      ...right.segments.map(s => ({ start: s.start + offsetSec, end: s.end + offsetSec })),
    ],
    synthed: left.synthed || right.synthed,
  };
};

// Per-item synthesis: one TTS call per item, no silence detection needed.
// Used for very short items (e.g. Vietnamese single-letter names) where
// silence detection can't reliably separate clips.
const synthesiseIndividual = async (spec, items, workDir) => {
  let acc = null;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const result = await synthDetectOrSubdivide(spec, [item], workDir, `item-${item.id}`);
    if (acc === null) {
      acc = result;
    } else {
      acc = stitchResults(acc, result);
    }
    if (result.synthed && i < items.length - 1) await sleep(INTER_BATCH_MS);
  }
  return acc;
};

const generateSpec = async spec => {
  const id = `${spec.topic}-${spec.locale}`;
  const workDir = `${tempRoot}/${id}`;
  ensureDir(workDir);

  const mode = spec.synthMode ?? "batched";
  const batchResults = [];

  if (mode === "individual") {
    console.log(`\n[${id}] ${spec.items.length} items (one-call-per-item mode)`);
    const result = await synthesiseIndividual(spec, spec.items, workDir);
    batchResults.push(result);
    console.log(
      `  done: ${result.segments.length} segments, ${ROUND(result.samples.length / SAMPLE_RATE)}s`
    );
  } else {
    const batches = [];
    for (let i = 0; i < spec.items.length; i += BATCH_SIZE) {
      batches.push(spec.items.slice(i, i + BATCH_SIZE));
    }
    console.log(
      `\n[${id}] ${spec.items.length} items in ${batches.length} batch(es) of ≤${BATCH_SIZE}`
    );

    for (let bi = 0; bi < batches.length; bi++) {
      const result = await synthDetectOrSubdivide(spec, batches[bi], workDir, `batch-${bi}`);
      batchResults.push(result);
      console.log(
        `  batch ${bi + 1}/${batches.length}: ${result.segments.length} segments, ${ROUND(result.samples.length / SAMPLE_RATE)}s`
      );
      if (result.synthed && bi < batches.length - 1) await sleep(INTER_BATCH_MS);
    }
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

const main = async () => {
  ensureDir(tempRoot);
  const specs = GENERATION_SPECS.filter(
    spec => filters.length === 0 || filters.includes(specId(spec))
  );
  console.log(
    `Synthesising ${specs.length} sprite${specs.length === 1 ? "" : "s"} ` +
      `(batch=${BATCH_SIZE}${skipTts ? ", reusing cached TTS" : ""})...`
  );

  const generatedIds = [];
  for (const spec of specs) {
    const id = specId(spec);
    const result = await generateSpec(spec);
    console.log(
      `[${id}] -> ${spec.output}  duration=${result.duration}s  segments(in-memory)=${result.segments.length}`
    );
    generatedIds.push(id);
  }

  console.log("\nRebuilding manifest + TypeScript from final .m4a files...");
  buildSpriteManifestFromAudio({ filters: generatedIds });
  console.log("\nDone.");
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
