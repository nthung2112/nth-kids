// Source of truth for every TTS-synthesised sprite.
// Each spec drives one audio file in public/assets/audio/ and one locale
// entry in src/data/audioSpriteManifest.json.
//
// Voice selection:
//   vi-VN-NamMinhNeural — warm male, clear diction; chosen because the
//     alternative female voice (HoaiMy) returns "no audio" for many short
//     tokens from the free edge-tts tier.
//   en-US-AnaNeural    — soft female, matches Microsoft Edge's kids read-aloud.
//
// Rate is slowed down slightly (-15%) so young children can follow each word.

const VI_VOICE = "vi-VN-NamMinhNeural";
const EN_VOICE = "en-US-AnaNeural";
const DEFAULT_RATE = "-15%";

const NUMBERS_VI_NAMES = {
  1: "một",
  2: "hai",
  3: "ba",
  4: "bốn",
  5: "năm",
  6: "sáu",
  7: "bảy",
  8: "tám",
  9: "chín",
  10: "mười",
};

// Vietnamese number name composer for 1..100.
// Covers: 11 "mười một", 15 "mười lăm", 20 "hai mươi", 21 "hai mươi mốt",
// 24 "hai mươi bốn", 25 "hai mươi lăm", etc.
const viNumberName = n => {
  if (n <= 10) return NUMBERS_VI_NAMES[n];
  if (n < 20) {
    const unit = n - 10;
    if (unit === 5) return "mười lăm";
    return `mười ${NUMBERS_VI_NAMES[unit]}`;
  }
  const tens = Math.floor(n / 10);
  const unit = n % 10;
  const tensName = `${NUMBERS_VI_NAMES[tens]} mươi`;
  if (unit === 0) return tensName;
  if (unit === 1) return `${tensName} mốt`;
  if (unit === 4) return `${tensName} tư`;
  if (unit === 5) return `${tensName} lăm`;
  return `${tensName} ${NUMBERS_VI_NAMES[unit]}`;
};

const NUMBERS_VI_ITEMS = Array.from({ length: 100 }, (_, i) => ({
  id: String(i + 1),
  text: viNumberName(i + 1),
}));

const NUMBERS_EN_ONES = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

const NUMBERS_EN_TEENS = [
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const NUMBERS_EN_TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

// English number name composer for 1..100. Irregular forms (forty, fifty)
// live in NUMBERS_EN_TENS so the composer stays purely positional. Compound
// numbers use the standard hyphen ("twenty-one", "ninety-nine").
const enNumberName = n => {
  if (n < 10) return NUMBERS_EN_ONES[n];
  if (n < 20) return NUMBERS_EN_TEENS[n - 10];
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const unit = n % 10;
    if (unit === 0) return NUMBERS_EN_TENS[tens];
    return `${NUMBERS_EN_TENS[tens]}-${NUMBERS_EN_ONES[unit]}`;
  }
  return "one hundred";
};

const NUMBERS_EN_ITEMS = Array.from({ length: 100 }, (_, i) => ({
  id: String(i + 1),
  text: enNumberName(i + 1),
}));

const COLORS_VI_ORDER = [
  "red",
  "green",
  "blue",
  "white",
  "black",
  "yellow",
  "orange",
  "pink",
  "brown",
  "gray",
  "purple",
];

const COLORS_VI_NAMES = {
  red: "Đỏ",
  yellow: "Vàng",
  green: "Xanh lục",
  blue: "Xanh lam",
  purple: "Tím",
  orange: "Cam",
  pink: "Hồng",
  brown: "Nâu",
  black: "Đen",
  white: "Trắng",
  gray: "Xám",
};

const COLORS_VI_ITEMS = COLORS_VI_ORDER.map(id => ({ id, text: COLORS_VI_NAMES[id] }));

const COLORS_EN_NAMES = {
  red: "Red",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  purple: "Purple",
  orange: "Orange",
  pink: "Pink",
  brown: "Brown",
  black: "Black",
  white: "White",
  gray: "Gray",
};

const COLORS_EN_ITEMS = COLORS_VI_ORDER.map(id => ({ id, text: COLORS_EN_NAMES[id] }));

const SHAPES_VI_ORDER = [
  "square",
  "rectangle",
  "triangle",
  "circle",
  "oval",
  "star",
  "heart",
  "diamond",
];

const SHAPES_VI_NAMES = {
  circle: "Hình tròn",
  square: "Hình vuông",
  triangle: "Hình tam giác",
  rectangle: "Hình chữ nhật",
  star: "Hình ngôi sao",
  heart: "Hình trái tim",
  diamond: "Hình thoi",
  oval: "Hình bầu dục",
};

const SHAPES_VI_ITEMS = SHAPES_VI_ORDER.map(id => ({ id, text: SHAPES_VI_NAMES[id] }));

const SHAPES_EN_NAMES = {
  circle: "Circle",
  square: "Square",
  triangle: "Triangle",
  rectangle: "Rectangle",
  star: "Star",
  heart: "Heart",
  diamond: "Diamond",
  oval: "Oval",
};

const SHAPES_EN_ITEMS = SHAPES_VI_ORDER.map(id => ({ id, text: SHAPES_EN_NAMES[id] }));

// Vietnamese letter pronunciation, as taught in Vietnamese kindergartens for
// the English alphabet. A few letters overlap with the Vietnamese alphabet
// ("bê", "xê", "dê"); the rest use the typical Vietnamese rendering.
const ALPHABET_VI_LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const ALPHABET_VI_NAMES = {
  A: "a",
  B: "bê",
  C: "xê",
  D: "dê",
  E: "e",
  F: "ép",
  G: "gờ",
  H: "hát",
  I: "i",
  J: "di",
  K: "ca",
  L: "lờ",
  M: "mờ",
  N: "nờ",
  O: "o",
  P: "pê",
  Q: "qui",
  R: "rờ",
  S: "ét",
  T: "tê",
  U: "u",
  V: "vê",
  W: "vê kép",
  X: "ích",
  Y: "y",
  Z: "dét",
};

const ALPHABET_VI_ITEMS = ALPHABET_VI_LETTERS.map(letter => ({
  id: letter,
  text: ALPHABET_VI_NAMES[letter],
}));

// English letter names spelled phonetically. Single-letter tokens like "A",
// "I" and "U" collide with the article "a" and pronouns "I"/"you" when fed
// to TTS in isolation; the spelled-out forms ("ay", "eye", "you") force the
// engine to read the alphabet name reliably. "zee" matches the en-US voice.
const ALPHABET_EN_NAMES = {
  A: "ay",
  B: "bee",
  C: "see",
  D: "dee",
  E: "ee",
  F: "eff",
  G: "gee",
  H: "aitch",
  I: "eye",
  J: "jay",
  K: "kay",
  L: "el",
  M: "em",
  N: "en",
  O: "oh",
  P: "pee",
  Q: "cue",
  R: "ar",
  S: "ess",
  T: "tee",
  U: "you",
  V: "vee",
  W: "double-u",
  X: "ex",
  Y: "why",
  Z: "zee",
};

const ALPHABET_EN_ITEMS = ALPHABET_VI_LETTERS.map(letter => ({
  id: letter,
  text: ALPHABET_EN_NAMES[letter],
}));

// Alphabet example words — these feed `alphabetWords` sprite and are spoken
// on top of the letter cue in learn/game flows.
const ALPHABET_WORDS_EN = {
  A: "Apple",
  B: "Ball",
  C: "Cat",
  D: "Dog",
  E: "Elephant",
  F: "Fish",
  G: "Grape",
  H: "Horse",
  I: "Ice cream",
  J: "Jelly",
  K: "Kite",
  L: "Lion",
  M: "Monkey",
  N: "Nest",
  O: "Orange",
  P: "Panda",
  Q: "Queen",
  R: "Rabbit",
  S: "Sun",
  T: "Tree",
  U: "Umbrella",
  V: "Vase",
  W: "Whale",
  X: "X-ray",
  Y: "Yarn",
  Z: "Zebra",
};

// Vietnamese cue words chosen to match the emoji + letter pairing in
// src/data/alphabet.ts and `data.alphabet.*.vietnamese` strings, favouring
// short, concrete nouns a Vietnamese child will recognise.
const ALPHABET_WORDS_VI = {
  A: "Trái táo",
  B: "Quả bóng",
  C: "Con mèo",
  D: "Con chó",
  E: "Con voi",
  F: "Con cá",
  G: "Quả nho",
  H: "Con ngựa",
  I: "Cây Kem",
  J: "Kẹo dẻo",
  K: "Con diều",
  L: "Con Sư tử",
  M: "Con khỉ",
  N: "Tổ chim",
  O: "Quả cam",
  P: "Gấu trúc",
  Q: "Nữ hoàng",
  R: "Con thỏ",
  S: "Mặt trời",
  T: "Cái cây",
  U: "Cái ô",
  V: "Bình hoa",
  W: "Cá voi",
  X: "Tia X",
  Y: "Sợi len",
  Z: "Con Ngựa vằn",
};

const ALPHABET_WORDS_EN_ITEMS = ALPHABET_VI_LETTERS.map(letter => ({
  id: letter,
  text: ALPHABET_WORDS_EN[letter],
}));

const ALPHABET_WORDS_VI_ITEMS = ALPHABET_VI_LETTERS.map(letter => ({
  id: letter,
  text: ALPHABET_WORDS_VI[letter],
}));

// Prompt sprite: game question strings + flashcard prompts (11 items).
// Keys are stable identifiers used by components and useSound.playPromptSound.
const PROMPT_KEYS = [
  "counting",
  "alphabetGame",
  "sequence",
  "colorGuess",
  "colorMatching",
  "shapesGame",
  "flashcardNumber",
  "flashcardLetter",
  "flashcardColor",
  "flashcardShape",
  "preview",
];

const PROMPT_TEXTS_EN = {
  counting: "How many do you see?",
  alphabetGame: "Which letter does this word start with?",
  sequence: "What letter comes next?",
  colorGuess: "What color is this?",
  colorMatching: "Match the same colors!",
  shapesGame: "What shape is this?",
  flashcardNumber: "Which number is this?",
  flashcardLetter: "Which letter is this?",
  flashcardColor: "What color is this?",
  flashcardShape: "What shape is this?",
  preview: "Hello! Let's learn together.",
};

const PROMPT_TEXTS_VI = {
  counting: "Đếm xem có bao nhiêu?",
  alphabetGame: "Chữ cái nào bắt đầu từ này?",
  sequence: "Chữ cái tiếp theo là gì?",
  colorGuess: "Đây là màu gì?",
  colorMatching: "Ghép cặp màu giống nhau.",
  shapesGame: "Đây là hình gì?",
  flashcardNumber: "Đây là số nào?",
  flashcardLetter: "Đây là chữ cái nào?",
  flashcardColor: "Đây là màu gì?",
  flashcardShape: "Đây là hình gì?",
  preview: "Xin chào, cùng học vui nhé.",
};

const PROMPT_EN_ITEMS = PROMPT_KEYS.map(key => ({ id: key, text: PROMPT_TEXTS_EN[key] }));
const PROMPT_VI_ITEMS = PROMPT_KEYS.map(key => ({ id: key, text: PROMPT_TEXTS_VI[key] }));

// One generation spec per (topic, locale). "enabled: false" can be used to
// skip a topic during iterative testing without deleting it here.
export const GENERATION_SPECS = [
  // Vietnamese localisation of existing sprites (Phase 2 P1)
  {
    topic: "numbers",
    locale: "vi",
    voice: VI_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/numbers-vi.mp3",
    items: NUMBERS_VI_ITEMS,
  },
  {
    topic: "colors",
    locale: "vi",
    voice: VI_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/colors-vi.mp3",
    items: COLORS_VI_ITEMS,
  },
  {
    topic: "shapes",
    locale: "vi",
    voice: VI_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/shapes-vi.mp3",
    items: SHAPES_VI_ITEMS,
  },
  {
    topic: "alphabet",
    locale: "vi",
    voice: VI_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/alphabet-vi.mp3",
    items: ALPHABET_VI_ITEMS,
    // Vietnamese letter pronunciations ("a", "i", "e") are very short and
    // resist silence-detection batching even with a "Chữ" prefix. Synthesise
    // each clip individually instead — Python edge-tts is reliable enough
    // that the extra calls cost ~30s for the whole alphabet.
    synthMode: "individual",
    wrapText: text => `Chữ ${text}`,
  },
  {
    topic: "numbers",
    locale: "en",
    voice: EN_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/numbers-en.mp3",
    items: NUMBERS_EN_ITEMS,
  },
  {
    topic: "colors",
    locale: "en",
    voice: EN_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/colors-en.mp3",
    items: COLORS_EN_ITEMS,
  },
  {
    topic: "shapes",
    locale: "en",
    voice: EN_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/shapes-en.mp3",
    items: SHAPES_EN_ITEMS,
  },
  {
    topic: "alphabet",
    locale: "en",
    voice: EN_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/alphabet-en.mp3",
    items: ALPHABET_EN_ITEMS,
  },
  {
    topic: "alphabetWords",
    locale: "en",
    voice: EN_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/alphabet-words-en.mp3",
    items: ALPHABET_WORDS_EN_ITEMS,
  },
  {
    topic: "alphabetWords",
    locale: "vi",
    voice: VI_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/alphabet-words-vi.mp3",
    items: ALPHABET_WORDS_VI_ITEMS,
  },

  // Game question prompts + settings preview packed into one sprite per locale
  // (Phase 2 P3 + P4; the preview sample reuses the prompts sprite).
  {
    topic: "prompts",
    locale: "en",
    voice: EN_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/prompts-en.mp3",
    items: PROMPT_EN_ITEMS,
  },
  {
    topic: "prompts",
    locale: "vi",
    voice: VI_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/prompts-vi.mp3",
    items: PROMPT_VI_ITEMS,
  },
];

// Index map source of truth — drives typed constants in audioSprites.ts.
// VI sprites are TTS-generated with our content order so indices are 0-based.
// EN sprites were hand-recorded with their own structure, so we preserve the
// historical hand-tuned mappings verbatim.
export const SPRITE_INDICES = {
  letters: {
    en: Object.fromEntries(ALPHABET_VI_LETTERS.map((l, i) => [l, i])),
    vi: Object.fromEntries(ALPHABET_VI_LETTERS.map((l, i) => [l, i])),
  },
  numbers: {
    en: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [String(i + 1), i])),
    vi: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [String(i + 1), i])),
  },
  colors: {
    en: Object.fromEntries(Object.keys(COLORS_EN_NAMES).map((c, i) => [c, i])),
    vi: Object.fromEntries(COLORS_VI_ORDER.map((c, i) => [c, i])),
  },
  shapes: {
    en: Object.fromEntries(Object.keys(SHAPES_EN_NAMES).map((s, i) => [s, i])),
    vi: Object.fromEntries(SHAPES_VI_ORDER.map((s, i) => [s, i])),
  },
  prompts: {
    en: Object.fromEntries(PROMPT_KEYS.map((k, i) => [k, i])),
    vi: Object.fromEntries(PROMPT_KEYS.map((k, i) => [k, i])),
  },
  alphabetWords: {
    en: Object.fromEntries(ALPHABET_VI_LETTERS.map((l, i) => [l, i])),
    vi: Object.fromEntries(ALPHABET_VI_LETTERS.map((l, i) => [l, i])),
  },
};

export const specId = spec => `${spec.topic}-${spec.locale}`;

// Parses edge-tts rate strings ("-15%", "+20%") into Web Speech API `rate`
// multipliers. "-15%" means 15% slower, which is rate=0.85. Clamped to the
// 0.1..10 range that the Web Speech spec accepts.
export const parseRateToMultiplier = rateStr => {
  if (!rateStr || typeof rateStr !== "string") return 1;
  const match = rateStr.trim().match(/^([-+]?)(\d+(?:\.\d+)?)%$/);
  if (!match) return 1;
  const sign = match[1] === "-" ? -1 : 1;
  const pct = parseFloat(match[2]);
  const multiplier = 1 + (sign * pct) / 100;
  return Math.min(10, Math.max(0.1, multiplier));
};
