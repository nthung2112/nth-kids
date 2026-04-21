export type ShapeId =
  | "circle"
  | "square"
  | "triangle"
  | "rectangle"
  | "star"
  | "heart"
  | "diamond"
  | "oval";

export interface ShapeDef {
  id: ShapeId;
  emoji: string;
  examples: string[];
  bgClass: string;
  borderClass: string;
}

export const SHAPE_DEFS: Record<ShapeId, ShapeDef> = {
  circle: {
    id: "circle",
    emoji: "⭕",
    examples: ["☀️", "⚽", "🍩"],
    bgClass: "bg-yellow-100",
    borderClass: "border-yellow-300",
  },
  square: {
    id: "square",
    emoji: "🟦",
    examples: ["🎁", "🪟", "🧊"],
    bgClass: "bg-blue-100",
    borderClass: "border-blue-300",
  },
  triangle: {
    id: "triangle",
    emoji: "🔺",
    examples: ["🍕", "⛰️", "🎄"],
    bgClass: "bg-red-100",
    borderClass: "border-red-300",
  },
  rectangle: {
    id: "rectangle",
    emoji: "▭",
    examples: ["🚪", "📱", "📺"],
    bgClass: "bg-green-100",
    borderClass: "border-green-300",
  },
  star: {
    id: "star",
    emoji: "⭐",
    examples: ["⭐", "🌟", "✨"],
    bgClass: "bg-yellow-100",
    borderClass: "border-yellow-300",
  },
  heart: {
    id: "heart",
    emoji: "❤️",
    examples: ["❤️", "💖", "💝"],
    bgClass: "bg-pink-100",
    borderClass: "border-pink-300",
  },
  diamond: {
    id: "diamond",
    emoji: "🔷",
    examples: ["🔷", "💎", "🃏"],
    bgClass: "bg-indigo-100",
    borderClass: "border-indigo-300",
  },
  oval: {
    id: "oval",
    emoji: "⬭",
    examples: ["🥚", "🏉", "🥔"],
    bgClass: "bg-orange-100",
    borderClass: "border-orange-300",
  },
};

export const SHAPE_LEARNING_IDS: ShapeId[] = [
  "square",
  "rectangle",
  "triangle",
  "circle",
  "oval",
  "star",
  "heart",
  "diamond",
];

export const SHAPE_GAME_IDS: ShapeId[] = [
  "square",
  "rectangle",
  "triangle",
  "circle",
  "oval",
  "star",
  "heart",
  "diamond",
];
