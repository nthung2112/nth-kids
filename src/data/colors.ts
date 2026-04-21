export type ColorId =
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "orange"
  | "pink"
  | "brown"
  | "black"
  | "white"
  | "gray";

export interface ColorDef {
  id: ColorId;
  hex: string;
  lightHex: string;
  emoji: string;
  examples: string[];
  bgClass: string;
  borderClass: string;
  hoverClass: string;
  lightBgClass: string;
}

export const COLOR_DEFS: Record<ColorId, ColorDef> = {
  red: {
    id: "red",
    hex: "#FF0000",
    lightHex: "#FFE6E6",
    emoji: "🍎",
    examples: ["🍎", "🌹", "❤️", "🍓"],
    bgClass: "bg-red-500",
    borderClass: "border-red-300",
    hoverClass: "hover:bg-red-600",
    lightBgClass: "bg-red-100",
  },
  green: {
    id: "green",
    hex: "#00AA00",
    lightHex: "#E6FFE6",
    emoji: "🌳",
    examples: ["🌳", "🍃", "🐸", "🥒"],
    bgClass: "bg-green-500",
    borderClass: "border-green-300",
    hoverClass: "hover:bg-green-600",
    lightBgClass: "bg-green-100",
  },
  blue: {
    id: "blue",
    hex: "#0066FF",
    lightHex: "#E6F2FF",
    emoji: "🌊",
    examples: ["🌊", "🐋", "💙", "🫐"],
    bgClass: "bg-blue-500",
    borderClass: "border-blue-300",
    hoverClass: "hover:bg-blue-600",
    lightBgClass: "bg-blue-100",
  },
  white: {
    id: "white",
    hex: "#FFFFFF",
    lightHex: "#FAFAFA",
    emoji: "☁️",
    examples: ["☁️", "🤍", "🐑", "⚪"],
    bgClass: "bg-white",
    borderClass: "border-gray-300",
    hoverClass: "hover:bg-gray-50",
    lightBgClass: "bg-gray-50",
  },
  black: {
    id: "black",
    hex: "#000000",
    lightHex: "#F0F0F0",
    emoji: "🐧",
    examples: ["🐧", "🖤", "🦇", "⚫"],
    bgClass: "bg-gray-800",
    borderClass: "border-gray-600",
    hoverClass: "hover:bg-gray-900",
    lightBgClass: "bg-gray-100",
  },
  yellow: {
    id: "yellow",
    hex: "#FFD700",
    lightHex: "#FFFACD",
    emoji: "☀️",
    examples: ["☀️", "🍌", "⭐", "🌻"],
    bgClass: "bg-yellow-500",
    borderClass: "border-yellow-300",
    hoverClass: "hover:bg-yellow-600",
    lightBgClass: "bg-yellow-100",
  },
  orange: {
    id: "orange",
    hex: "#FF8C00",
    lightHex: "#FFE6CC",
    emoji: "🍊",
    examples: ["🍊", "🎃", "🦊", "🥕"],
    bgClass: "bg-orange-500",
    borderClass: "border-orange-300",
    hoverClass: "hover:bg-orange-600",
    lightBgClass: "bg-orange-100",
  },
  pink: {
    id: "pink",
    hex: "#FF69B4",
    lightHex: "#FFE4F0",
    emoji: "🌸",
    examples: ["🌸", "💖", "🐷", "🍬"],
    bgClass: "bg-pink-500",
    borderClass: "border-pink-300",
    hoverClass: "hover:bg-pink-600",
    lightBgClass: "bg-pink-100",
  },
  brown: {
    id: "brown",
    hex: "#8B4513",
    lightHex: "#F4E4D4",
    emoji: "🍫",
    examples: ["🍫", "🐻", "🌰", "🪵"],
    bgClass: "bg-amber-800",
    borderClass: "border-amber-600",
    hoverClass: "hover:bg-amber-900",
    lightBgClass: "bg-amber-100",
  },
  gray: {
    id: "gray",
    hex: "#808080",
    lightHex: "#F0F0F0",
    emoji: "🐧",
    examples: ["🐧", "🖤", "🦇", "⚫"],
    bgClass: "bg-gray-800",
    borderClass: "border-gray-600",
    hoverClass: "hover:bg-gray-900",
    lightBgClass: "bg-gray-100",
  },
  purple: {
    id: "purple",
    hex: "#8A2BE2",
    lightHex: "#F0E6FF",
    emoji: "🍇",
    examples: ["🍇", "💜", "🦄", "🔮"],
    bgClass: "bg-purple-500",
    borderClass: "border-purple-300",
    hoverClass: "hover:bg-purple-600",
    lightBgClass: "bg-purple-100",
  },
};

export const COLOR_LEARNING_IDS: ColorId[] = [
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

export const COLOR_GUESS_IDS: ColorId[] = ["red", "yellow", "green", "blue", "purple"];

export const COLOR_MATCHING_IDS: ColorId[] = ["red", "yellow", "green", "blue", "purple", "orange"];

export const COLOR_PALETTE_IDS: ColorId[] = [
  "red",
  "yellow",
  "green",
  "blue",
  "purple",
  "orange",
  "pink",
  "brown",
];
