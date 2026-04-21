export interface ColoringTemplate {
  id: "sun" | "house" | "tree";
  emoji: string;
  paths: string[];
  referenceColors: string[];
}

export const COLORING_TEMPLATES: ColoringTemplate[] = [
  {
    id: "sun",
    emoji: "☀️",
    paths: [
      "M 150 150 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0",
      "M 150 50 L 150 30 M 150 270 L 150 290 M 50 150 L 30 150 M 270 150 L 290 150",
      "M 89 89 L 75 75 M 211 211 L 225 225 M 89 211 L 75 225 M 211 89 L 225 75",
    ],
    referenceColors: ["#FFD700", "#FFA500", "#FFA500"],
  },
  {
    id: "house",
    emoji: "🏠",
    paths: [
      "M 100 100 L 150 50 L 200 100 Z",
      "M 110 100 L 190 100 L 190 180 L 110 180 Z",
      "M 130 140 L 130 180 L 160 180 L 160 140 Z",
      "M 170 120 L 185 120 L 185 135 L 170 135 Z",
    ],
    referenceColors: ["#8B4513", "#FF8C00", "#654321", "#FFFACD"],
  },
  {
    id: "tree",
    emoji: "🌳",
    paths: [
      "M 145 150 L 155 150 L 155 200 L 145 200 Z",
      "M 150 150 m -30 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0",
      "M 150 130 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0",
      "M 150 110 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0",
    ],
    referenceColors: ["#8B4513", "#228B22", "#228B22", "#228B22"],
  },
];
