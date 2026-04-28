export type GameId =
  | "counting"
  | "alphabet"
  | "sequence"
  | "letterSounds"
  | "colorGuess"
  | "colorMatching"
  | "colorSorting"
  | "shapes"
  | "flashcards";

export interface GameConfig {
  id: GameId;
  livesStart: number;
  totalQuestions: number;
  pointsPerQuestion: number;
  resultThresholds: {
    superRatio: number;
    goodRatio: number;
  };
}

const baseThresholds = { superRatio: 0.7, goodRatio: 0.5 };

export const GAME_CONFIGS: Record<Exclude<GameId, "counting">, GameConfig> = {
  alphabet: {
    id: "alphabet",
    livesStart: 3,
    totalQuestions: 10,
    pointsPerQuestion: 10,
    resultThresholds: baseThresholds,
  },
  sequence: {
    id: "sequence",
    livesStart: 3,
    totalQuestions: 8,
    pointsPerQuestion: 15,
    resultThresholds: { superRatio: 0.625, goodRatio: 0.375 },
  },
  letterSounds: {
    id: "letterSounds",
    livesStart: 3,
    totalQuestions: 8,
    pointsPerQuestion: 12,
    resultThresholds: baseThresholds,
  },
  colorGuess: {
    id: "colorGuess",
    livesStart: 3,
    totalQuestions: 10,
    pointsPerQuestion: 15,
    resultThresholds: { superRatio: 2 / 3, goodRatio: 0.4 },
  },
  colorMatching: {
    id: "colorMatching",
    livesStart: 3,
    totalQuestions: 3,
    pointsPerQuestion: 20,
    resultThresholds: baseThresholds,
  },
  colorSorting: {
    id: "colorSorting",
    livesStart: 3,
    totalQuestions: 8,
    pointsPerQuestion: 12,
    resultThresholds: baseThresholds,
  },
  shapes: {
    id: "shapes",
    livesStart: 3,
    totalQuestions: 10,
    pointsPerQuestion: 12,
    resultThresholds: baseThresholds,
  },
  flashcards: {
    id: "flashcards",
    livesStart: 3,
    totalQuestions: 12,
    pointsPerQuestion: 10,
    resultThresholds: baseThresholds,
  },
};

export interface CountingGameTier {
  maxCount: number;
  totalQuestions: number;
  pointsPerQuestion: number;
}

export function getCountingGameConfig(maxNumber: number): GameConfig & CountingGameTier {
  let tier: CountingGameTier;
  if (maxNumber <= 10) {
    tier = { maxCount: 5, totalQuestions: 10, pointsPerQuestion: 10 };
  } else if (maxNumber <= 30) {
    tier = { maxCount: 8, totalQuestions: 12, pointsPerQuestion: 12 };
  } else {
    tier = { maxCount: 10, totalQuestions: 15, pointsPerQuestion: 15 };
  }

  return {
    id: "counting",
    livesStart: 3,
    resultThresholds: baseThresholds,
    ...tier,
  };
}
