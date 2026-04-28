export interface NumberData {
  number: number;
  name: string;
  emoji: string;
  items: string[];
  color: string;
}

type SupportedLang = "vi" | "en";

const numberEmojis = [
  "🍎",
  "🐱",
  "🌸",
  "🦋",
  "⭐",
  "🐠",
  "🎈",
  "🎁",
  "🌈",
  "🐝",
  "🍊",
  "🐶",
  "🌺",
  "🦄",
  "🌟",
  "🐙",
  "🎪",
  "🎂",
  "🌻",
  "🐢",
  "🍌",
  "🐰",
  "🌷",
  "🦜",
  "💫",
  "🐳",
  "🎨",
  "🧸",
  "🌹",
  "🐧",
  "🍇",
  "🐼",
  "🌼",
  "🦚",
  "✨",
  "🐬",
  "🎭",
  "🎪",
  "🌺",
  "🐨",
  "🍓",
  "🐯",
  "🌻",
  "🦩",
  "🌠",
  "🐋",
  "🎯",
  "🎊",
  "🌸",
  "🐘",
];

const cardColors = [
  "bg-red-100 border-red-300 hover:bg-red-200",
  "bg-orange-100 border-orange-300 hover:bg-orange-200",
  "bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
  "bg-green-100 border-green-300 hover:bg-green-200",
  "bg-blue-100 border-blue-300 hover:bg-blue-200",
  "bg-indigo-100 border-indigo-300 hover:bg-indigo-200",
  "bg-purple-100 border-purple-300 hover:bg-purple-200",
  "bg-pink-100 border-pink-300 hover:bg-pink-200",
  "bg-teal-100 border-teal-300 hover:bg-teal-200",
  "bg-rose-100 border-rose-300 hover:bg-rose-200",
];

const viOnes: Record<number, string> = {
  0: "Không",
  1: "Một",
  2: "Hai",
  3: "Ba",
  4: "Bốn",
  5: "Năm",
  6: "Sáu",
  7: "Bảy",
  8: "Tám",
  9: "Chín",
};

const viTens: Record<number, string> = {
  2: "Hai",
  3: "Ba",
  4: "Bốn",
  5: "Năm",
  6: "Sáu",
  7: "Bảy",
  8: "Tám",
  9: "Chín",
};

function getVietnameseName(num: number): string {
  if (num === 0) return "Không";
  if (num < 10) return viOnes[num];
  if (num === 10) return "Mười";
  if (num < 20) {
    const ones = num - 10;
    if (ones === 5) return "Mười lăm";
    return `Mười ${viOnes[ones].toLowerCase()}`;
  }
  if (num === 100) return "Một trăm";
  if (num < 100) {
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    const tensWord = `${viTens[tens]} mươi`;
    if (ones === 0) return tensWord;
    if (ones === 1) return `${tensWord} mốt`;
    if (ones === 5) return `${tensWord} lăm`;
    return `${tensWord} ${viOnes[ones].toLowerCase()}`;
  }
  return `Số ${num}`;
}

const enOnes: Record<number, string> = {
  0: "Zero",
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
};

const enTeens: Record<number, string> = {
  10: "Ten",
  11: "Eleven",
  12: "Twelve",
  13: "Thirteen",
  14: "Fourteen",
  15: "Fifteen",
  16: "Sixteen",
  17: "Seventeen",
  18: "Eighteen",
  19: "Nineteen",
};

const enTens: Record<number, string> = {
  2: "Twenty",
  3: "Thirty",
  4: "Forty",
  5: "Fifty",
  6: "Sixty",
  7: "Seventy",
  8: "Eighty",
  9: "Ninety",
};

function getEnglishName(num: number): string {
  if (num === 0) return "Zero";
  if (num < 10) return enOnes[num];
  if (num < 20) return enTeens[num];
  if (num === 100) return "One Hundred";
  if (num < 100) {
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    const tensWord = enTens[tens];
    if (ones === 0) return tensWord;
    return `${tensWord}-${enOnes[ones]}`;
  }
  return `Number ${num}`;
}

const normaliseLang = (lang?: string): SupportedLang => {
  if (!lang) return "vi";
  const base = lang.split("-")[0].toLowerCase();
  return base === "en" ? "en" : "vi";
};

export function getNumberName(num: number, lang?: string): string {
  return normaliseLang(lang) === "en" ? getEnglishName(num) : getVietnameseName(num);
}

export function generateNumberData(maxNumber: number, lang?: string): NumberData[] {
  const numbers: NumberData[] = [];

  for (let i = 1; i <= maxNumber; i++) {
    const emoji = numberEmojis[(i - 1) % numberEmojis.length];
    const color = cardColors[(i - 1) % cardColors.length];
    const itemCount = Math.min(i, 10);

    numbers.push({
      number: i,
      name: getNumberName(i, lang),
      emoji,
      items: Array(itemCount).fill(emoji),
      color,
    });
  }

  return numbers;
}

export function getNumberDisplayInfo(num: number) {
  if (num <= 10) {
    return {
      showAllItems: true,
      gridCols: "grid-cols-2 @md:grid-cols-3 @lg:grid-cols-5",
      cardSize: "p-4 @md:p-6",
      numberSize: "text-5xl @sm:text-6xl @md:text-7xl @lg:text-8xl",
      emojiSize: "text-3xl @sm:text-4xl @md:text-5xl",
    };
  }
  if (num <= 30) {
    return {
      showAllItems: false,
      gridCols: "grid-cols-2 @md:grid-cols-3 @lg:grid-cols-5",
      cardSize: "p-3 @md:p-4",
      numberSize: "text-4xl @md:text-5xl @lg:text-6xl",
      emojiSize: "text-2xl @md:text-3xl @lg:text-4xl",
    };
  }
  return {
    showAllItems: false,
    gridCols: "grid-cols-4 @md:grid-cols-6 @lg:grid-cols-8 @3xl:grid-cols-10",
    cardSize: "p-2 @md:p-3",
    numberSize: "text-3xl @md:text-4xl @lg:text-5xl",
    emojiSize: "text-2xl @md:text-3xl",
  };
}
