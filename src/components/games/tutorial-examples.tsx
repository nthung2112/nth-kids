import type { ReactNode } from "react";

import { ArrowRight } from "lucide-react";

const Slot = ({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "purple" | "green" | "pink";
}) => {
  const palette = {
    blue: "border-blue-300 bg-white text-blue-600",
    purple: "border-purple-300 bg-white text-purple-600",
    green: "border-green-300 bg-green-100 text-green-600",
    pink: "border-pink-300 bg-pink-100 text-pink-600",
  } as const;
  return (
    <div
      className={`rounded-lg border-2 p-3 text-3xl font-bold ${palette[tone]}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
};

export const SEQUENCE_EXAMPLES: ReactNode[] = [
  null,
  (
    <div className="flex items-center justify-center gap-3 rounded-xl bg-blue-50 p-4">
      {(["A", "B", "C"] as const).map(letter => (
        <Slot key={letter}>{letter}</Slot>
      ))}
      <ArrowRight className="text-blue-500" />
      <Slot tone="green">D</Slot>
    </div>
  ),
  (
    <div className="flex items-center justify-center gap-3 rounded-xl bg-purple-50 p-4">
      {(["G", "H", "I"] as const).map(letter => (
        <Slot key={letter} tone="purple">
          {letter}
        </Slot>
      ))}
      <ArrowRight className="text-purple-500" />
      <Slot tone="green">J</Slot>
    </div>
  ),
  <div className="text-center text-6xl">🎉🎊🌟</div>,
];

export const COUNTING_EXAMPLES: ReactNode[] = [
  <div className="text-center text-5xl">🍎🍎🍎</div>,
  null,
  (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-blue-50 p-4">
      <div className="text-4xl">🍎🍎🍎</div>
      <ArrowRight className="rotate-90 text-blue-500" />
      <div className="rounded-lg border-2 border-green-300 bg-green-100 p-3 text-3xl font-bold text-green-600">
        3
      </div>
    </div>
  ),
  <div className="text-center text-6xl">🎉</div>,
];

export const ALPHABET_EXAMPLES: ReactNode[] = [
  null,
  null,
  (
    <div className="flex items-center justify-center gap-3 rounded-xl bg-green-50 p-4">
      <div className="text-5xl">🍎</div>
      <div className="text-2xl font-bold text-green-700">Apple</div>
      <ArrowRight className="text-green-500" />
      <Slot tone="green">A</Slot>
    </div>
  ),
  <div className="text-center text-6xl">🎉</div>,
];

export const COLOR_GUESS_EXAMPLES: ReactNode[] = [
  null,
  null,
  (
    <div className="flex items-center justify-center gap-3 rounded-xl bg-red-50 p-4">
      <div className="h-14 w-14 rounded-full border-4 border-red-300" style={{ backgroundColor: "#FF0000" }} />
      <div className="text-3xl">🍎</div>
      <ArrowRight className="text-red-500" />
      <div className="rounded-lg border-2 border-green-300 bg-green-100 p-3 text-2xl font-bold text-green-600">
        Red
      </div>
    </div>
  ),
  <div className="text-center text-6xl">🎉</div>,
];

export const COLOR_MATCHING_EXAMPLES: ReactNode[] = [
  null,
  (
    <div className="flex items-center justify-center gap-3 rounded-xl bg-yellow-50 p-4">
      <div className="rounded-lg border-2 border-yellow-300 bg-white p-3 text-3xl">❓</div>
      <ArrowRight className="text-yellow-500" />
      <div
        className="h-12 w-12 rounded-full border-2 border-gray-400"
        style={{ backgroundColor: "#FFD700" }}
      />
    </div>
  ),
  null,
  <div className="text-center text-6xl">🎉</div>,
];

export const COLORING_EXAMPLES: ReactNode[] = [
  null,
  (
    <div className="flex items-center justify-center gap-3 rounded-xl bg-pink-50 p-4">
      <div className="h-12 w-12 rounded-lg border-4 border-purple-300" style={{ backgroundColor: "#FF69B4" }} />
      <ArrowRight className="text-pink-500" />
      <div className="text-5xl">🌸</div>
    </div>
  ),
  null,
  <div className="text-center text-6xl">📥</div>,
];

export const SHAPES_EXAMPLES: ReactNode[] = [
  <div className="text-center text-6xl">🔷 ⭕ ⬜ 🔺</div>,
  null,
  <div className="text-center text-6xl">🎉</div>,
];

export const FLASHCARDS_EXAMPLES: ReactNode[] = [
  null,
  null,
  <div className="text-center text-5xl">🔢 🔤 🎨 🔷</div>,
];
