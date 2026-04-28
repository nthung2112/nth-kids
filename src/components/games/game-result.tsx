import type { ReactNode } from "react";

import ToyResult from "@/components/toys/toy-result";

export interface GameResultProps {
  score: number;
  maxScore: number;
  questionsAnswered: number;
  totalQuestions: number;
  superRatio: number;
  goodRatio: number;
  pointsPerQuestion: number;
  onPlayAgain: () => void;
  variant?: "default" | "color";
  extraStats?: ReactNode;
  starsLabelKey?: "stars" | "rainbowStars";
}

export default function GameResult(props: GameResultProps) {
  return <ToyResult {...props} />;
}
