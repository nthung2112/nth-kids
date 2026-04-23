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
  A: "Ăn táo",
  B: "Bóng",
  C: "Con mèo",
  D: "Con chó",
  E: "Con voi",
  F: "Con cá",
  G: "Quả nho",
  H: "Con ngựa",
  I: "Kem",
  J: "Kẹo dẻo",
  K: "Con diều",
  L: "Sư tử",
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
  Z: "Ngựa vằn",
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
  colorMatching: "Ghép cặp màu giống nhau!",
  shapesGame: "Đây là hình gì?",
  flashcardNumber: "Đây là số nào?",
  flashcardLetter: "Đây là chữ cái nào?",
  flashcardColor: "Đây là màu gì?",
  flashcardShape: "Đây là hình gì?",
  preview: "Xin chào! Cùng học vui nhé.",
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
    output: "public/assets/audio/numbers-vi.m4a",
    items: NUMBERS_VI_ITEMS,
  },
  {
    topic: "colors",
    locale: "vi",
    voice: VI_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/colors-vi.m4a",
    items: COLORS_VI_ITEMS,
  },
  {
    topic: "shapes",
    locale: "vi",
    voice: VI_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/shapes-vi.m4a",
    items: SHAPES_VI_ITEMS,
  },
  {
    topic: "alphabet",
    locale: "vi",
    voice: VI_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/alphabet-vi.m4a",
    items: ALPHABET_VI_ITEMS,
    // The bare Vietnamese letter pronunciations ("a", "i", "e") are too short
    // for the engine + silence detector to separate cleanly, so prefix each
    // clip with "Chữ" (= "Letter"). This is also pedagogically clearer:
    // children hear "Letter A" rather than just "A".
    wrapText: text => `Chữ ${text}`,
  },

  // Alphabet example words (Phase 2 P2)
  {
    topic: "alphabetWords",
    locale: "en",
    voice: EN_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/alphabet-words-en.m4a",
    items: ALPHABET_WORDS_EN_ITEMS,
  },
  {
    topic: "alphabetWords",
    locale: "vi",
    voice: VI_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/alphabet-words-vi.m4a",
    items: ALPHABET_WORDS_VI_ITEMS,
  },

  // Game question prompts + settings preview packed into one sprite per locale
  // (Phase 2 P3 + P4; the preview sample reuses the prompts sprite).
  {
    topic: "prompts",
    locale: "en",
    voice: EN_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/prompts-en.m4a",
    items: PROMPT_EN_ITEMS,
  },
  {
    topic: "prompts",
    locale: "vi",
    voice: VI_VOICE,
    rate: DEFAULT_RATE,
    output: "public/assets/audio/prompts-vi.m4a",
    items: PROMPT_VI_ITEMS,
  },
];

// Index map source of truth — drives typed constants in audioSprites.ts.
export const SPRITE_INDICES = {
  letters: Object.fromEntries(ALPHABET_VI_LETTERS.map((l, i) => [l, i])),
  numbers: Object.fromEntries(
    Array.from({ length: 100 }, (_, i) => [String(i + 1), i])
  ),
  colors: Object.fromEntries(COLORS_VI_ORDER.map((c, i) => [c, i])),
  shapes: Object.fromEntries(SHAPES_VI_ORDER.map((s, i) => [s, i])),
  prompts: Object.fromEntries(PROMPT_KEYS.map((k, i) => [k, i])),
};
