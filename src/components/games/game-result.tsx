import type { ReactNode } from "react";

import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GameResultProps {
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

export default function GameResult({
  score,
  maxScore,
  questionsAnswered,
  totalQuestions,
  superRatio,
  goodRatio,
  pointsPerQuestion,
  onPlayAgain,
  variant = "default",
  extraStats,
  starsLabelKey = "stars",
}: GameResultProps) {
  const { t } = useTranslation();

  const winThreshold = maxScore * superRatio;
  const goodThreshold = maxScore * goodRatio;

  const headlineKey =
    score >= winThreshold
      ? "games.common.results.super"
      : score >= goodThreshold
        ? "games.common.results.good"
        : "games.common.results.tryHarder";

  const trophyEmoji =
    variant === "color"
      ? score >= winThreshold
        ? "🏆"
        : score >= goodThreshold
          ? "🌈"
          : "🎨"
      : score >= winThreshold
        ? "🏆"
        : score >= goodThreshold
          ? "🌟"
          : "💖";

  const cardClass =
    variant === "color"
      ? "border-4 border-pink-300 bg-linear-to-br from-pink-100 to-purple-100 p-8"
      : "border-4 border-yellow-300 bg-linear-to-br from-yellow-100 to-orange-100 p-8";

  const buttonClass =
    variant === "color"
      ? "rounded-full bg-linear-to-r from-pink-500 to-purple-500 px-8 py-4 text-xl text-white hover:from-pink-600 hover:to-purple-600"
      : "rounded-full bg-linear-to-r from-green-500 to-blue-500 px-8 py-4 text-xl text-white hover:from-green-600 hover:to-blue-600";

  return (
    <div className="mx-auto max-w-2xl text-center">
      <Card className={cardClass}>
        <div className="mb-4 text-6xl" aria-hidden="true">
          {trophyEmoji}
        </div>

        <h2 className="mb-4 text-4xl font-bold text-purple-800">{t(headlineKey)}</h2>

        <div className="mb-6 text-2xl text-purple-600">
          <div className="mb-2">{t("games.common.stats.scoreOutOf", { score, max: maxScore })}</div>
          <div className="mb-2">
            {t("games.common.stats.answered", { answered: questionsAnswered, total: totalQuestions })}
          </div>
          <div>
            {t(`games.common.stats.${starsLabelKey}`, {
              count: Math.floor(score / pointsPerQuestion),
            })}
          </div>
          {extraStats}
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={onPlayAgain} className={buttonClass}>
            <RotateCcw className="mr-2" />
            {t("common.playAgain")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
