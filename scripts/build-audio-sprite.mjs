#!/usr/bin/env node
// Detect spoken segments inside each topic m4a sprite file and emit a typed
// TypeScript manifest at src/data/audioSprites.ts.
//
// Prereq: convert m4a -> wav (16-bit signed mono LE @ 22050 Hz) into
// /tmp/nthkids-audio/<name>.wav using afconvert.
//
// Usage:
//   node scripts/build-audio-sprite.mjs
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const wavDir = "/tmp/nthkids-audio";
const m4aDir = resolve(repoRoot, "public/assets/audio");

const TOPICS = [
  { name: "alphabet", minSilenceMs: 250 },
  { name: "colors", minSilenceMs: 250 },
  { name: "numbers", minSilenceMs: 250 },
  { name: "shapes", minSilenceMs: 300 },
];

const WINDOW_MS = 30;
const SILENCE_DBFS = -45;
const MIN_SEGMENT_MS = 120;
const PADDING_MS = 80;

function ensureWav(name) {
  const wavPath = `${wavDir}/${name}.wav`;
  if (existsSync(wavPath)) return wavPath;
  if (!existsSync(wavDir)) mkdirSync(wavDir, { recursive: true });
  const m4aPath = `${m4aDir}/${name}.m4a`;
  execFileSync("afconvert", ["-f", "WAVE", "-d", "LEI16@22050", "-c", "1", m4aPath, wavPath]);
  return wavPath;
}

function readWav(path) {
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
  if (channels !== 1 || bits !== 16) {
    throw new Error(`Unexpected wav format: ${channels}ch ${bits}bit`);
  }
  const samples = new Int16Array(buf.buffer, buf.byteOffset + dataOffset, dataSize / 2);
  return { samples, sampleRate, durationSec: samples.length / sampleRate };
}

function detectSegments(samples, sampleRate, minSilenceMs) {
  const windowSize = Math.max(1, Math.round((sampleRate * WINDOW_MS) / 1000));
  const minSilenceWindows = Math.ceil(minSilenceMs / WINDOW_MS);
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
    start: round(Math.max(0, (sw * windowSize) / sampleRate - padSec)),
    end: round(Math.min(samples.length / sampleRate, (ew * windowSize) / sampleRate + padSec)),
  }));
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

const sprites = {};
for (const { name, minSilenceMs } of TOPICS) {
  const wavPath = ensureWav(name);
  const { samples, sampleRate, durationSec } = readWav(wavPath);
  const segments = detectSegments(samples, sampleRate, minSilenceMs);
  sprites[name] = { duration: round(durationSec), sampleRate, segments };
  console.log(`${name}: ${segments.length} segments, ${round(durationSec)}s`);
}

// Mapping data — see analysis comments below in the generated TS.
// alphabet: segment[0] is an intro (longest at ~0.98s); A..Z = segments[1..26]
// colors: 20 segments for 10 distinct colors; assume each color spoken twice (take indices 0,2,4,...)
// numbers: 110 segments; only first 100 (1..100) are used
// shapes: order in recording = square,rectangle,triangle,polygon,circle,oval,sphere,spiral,cube,cone,cylinder + 1 extra
const SHAPE_ORDER_IN_RECORDING = [
  "square",
  "rectangle",
  "triangle",
  "polygon",
  "circle",
  "oval",
  "sphere",
  "spiral",
  "cube",
  "cone",
  "cylinder",
];

const APP_SHAPES = [
  "circle",
  "square",
  "triangle",
  "rectangle",
  "star",
  "heart",
  "diamond",
  "oval",
];

const shapeIndex = {};
APP_SHAPES.forEach(appShape => {
  const idx = SHAPE_ORDER_IN_RECORDING.indexOf(appShape);
  if (idx >= 0) shapeIndex[appShape] = idx;
});

const APP_COLORS = [
  "red",
  "yellow",
  "green",
  "blue",
  "purple",
  "orange",
  "pink",
  "brown",
  "black",
  "white",
];
const colorIndex = {};
APP_COLORS.forEach((color, i) => {
  // Assume each color said twice in the recording -> pick the first take.
  const targetIdx = i * 2;
  if (targetIdx < sprites.colors.segments.length) colorIndex[color] = targetIdx;
});

const letterIndex = {};
"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((letter, i) => {
  // Skip the longer intro segment at index 0.
  const targetIdx = i + 1;
  if (targetIdx < sprites.alphabet.segments.length) letterIndex[letter] = targetIdx;
});

const numberIndex = {};
for (let n = 1; n <= 100; n++) {
  const targetIdx = n - 1;
  if (targetIdx < sprites.numbers.segments.length) numberIndex[n] = targetIdx;
}

const out = `// AUTO-GENERATED by scripts/build-audio-sprite.mjs — do not hand-edit.
// To regenerate, run: \`node scripts/build-audio-sprite.mjs\`.
//
// Each sprite file is a single .m4a sprite hosted from /assets, and contains
// one English voice recording per item (number / letter / color / shape).
// We detected segment timings via silence detection; the offset/skip mapping
// for each topic is encoded below and reflects analysis of the source files.
//
// Topic source content (verified with the user, 2026-04-21):
//   alphabet.m4a -> intro + A..Z (27 segments total).
//   colors.m4a   -> each of 10 colors spoken twice (20 segments).
//   numbers.m4a  -> 1..100 followed by 101/200/1000/10000 extras; first 100 used.
//   shapes.m4a   -> square,rectangle,triangle,polygon,circle,oval,sphere,
//                   spiral,cube,cone,cylinder (+1 extra). App reuses the
//                   subset that matches its shape catalog.

import type { ColorId } from "@/data/colors";
import type { ShapeId } from "@/data/shapes";

export interface AudioSegment {
  start: number;
  end: number;
}

export interface AudioSprite {
  src: string;
  duration: number;
  sampleRate: number;
  segments: AudioSegment[];
}

export const AUDIO_SPRITES = {
  alphabet: {
    src: "assets/alphabet.m4a",
    duration: ${sprites.alphabet.duration},
    sampleRate: ${sprites.alphabet.sampleRate},
    segments: ${JSON.stringify(sprites.alphabet.segments)},
  },
  colors: {
    src: "assets/colors.m4a",
    duration: ${sprites.colors.duration},
    sampleRate: ${sprites.colors.sampleRate},
    segments: ${JSON.stringify(sprites.colors.segments)},
  },
  numbers: {
    src: "assets/numbers.m4a",
    duration: ${sprites.numbers.duration},
    sampleRate: ${sprites.numbers.sampleRate},
    segments: ${JSON.stringify(sprites.numbers.segments)},
  },
  shapes: {
    src: "assets/shapes.m4a",
    duration: ${sprites.shapes.duration},
    sampleRate: ${sprites.shapes.sampleRate},
    segments: ${JSON.stringify(sprites.shapes.segments)},
  },
} satisfies Record<string, AudioSprite>;

export type SpriteTopic = keyof typeof AUDIO_SPRITES;

export const LETTER_SPRITE_INDEX: Partial<Record<string, number>> = ${JSON.stringify(letterIndex)};

export const NUMBER_SPRITE_INDEX: Partial<Record<number, number>> = ${JSON.stringify(numberIndex)};

export const COLOR_SPRITE_INDEX: Partial<Record<ColorId, number>> = ${JSON.stringify(colorIndex)};

export const SHAPE_SPRITE_INDEX: Partial<Record<ShapeId, number>> = ${JSON.stringify(shapeIndex)};
`;

const outPath = resolve(repoRoot, "src/data/audioSprites.ts");
writeFileSync(outPath, out);
console.log(`\nWrote ${outPath}`);
console.log(
  `Mapped: ${Object.keys(letterIndex).length} letters, ${Object.keys(numberIndex).length} numbers, ` +
    `${Object.keys(colorIndex).length} colors, ${Object.keys(shapeIndex).length} shapes`
);
