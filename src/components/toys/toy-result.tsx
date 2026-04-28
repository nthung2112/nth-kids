import { RotateCcw, Star, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { GameResultProps } from "@/components/games/game-result";
import ShapePrimitive from "@/components/toys/shape-primitive";
import ToyButton from "@/components/toys/toy-button";
import { Card } from "@/components/ui/card";
import type { ToyPalette, ToyShapeKind } from "@/data/topics";
import { cn } from "@/lib/utils";

type ResultTier = "super" | "good" | "tryHarder";

export type ToyResultProps = GameResultProps;

const TIER_PALETTE: Record<ResultTier, ToyPalette> = {
  super: {
    primary: "bg-yellow-400",
    secondary: "bg-yellow-100",
    accent: "bg-orange-300",
    onPrimary: "text-white",
    surface: "bg-white",
    border: "border-yellow-300",
    text: "text-amber-700",
  },
  good: {
    primary: "bg-emerald-400",
    secondary: "bg-emerald-100",
    accent: "bg-sky-300",
    onPrimary: "text-white",
    surface: "bg-white",
    border: "border-emerald-300",
    text: "text-emerald-700",
  },
  tryHarder: {
    primary: "bg-pink-400",
    secondary: "bg-pink-100",
    accent: "bg-purple-300",
    onPrimary: "text-white",
    surface: "bg-white",
    border: "border-pink-300",
    text: "text-pink-700",
  },
};

const TIER_SHAPE: Record<ResultTier, ToyShapeKind> = {
  super: "shapes",
  good: "blocks",
  tryHarder: "cards",
};

const getTier = (
  score: number,
  maxScore: number,
  superRatio: number,
  goodRatio: number
): ResultTier => {
  const winThreshold = maxScore * superRatio;
  const goodThreshold = maxScore * goodRatio;
  if (score >= winThreshold) return "super";
  if (score >= goodThreshold) return "good";
  return "tryHarder";
};

export default function ToyResult({
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
}: ToyResultProps) {
  const { t } = useTranslation();

  const tier = getTier(score, maxScore, superRatio, goodRatio);
  const palette = TIER_PALETTE[tier];
  const shape = TIER_SHAPE[tier];

  const headlineKey =
    tier === "super"
      ? "games.common.results.super"
      : tier === "good"
        ? "games.common.results.good"
        : "games.common.results.tryHarder";

  const trophyLabel =
    tier === "super" ? "★" : tier === "good" ? (variant === "color" ? "✿" : "◆") : "♥";

  const cardClass =
    variant === "color"
      ? "border-4 border-pink-300 bg-linear-to-br from-pink-100 to-purple-100"
      : "border-4 border-yellow-300 bg-linear-to-br from-yellow-100 to-orange-100";

  const buttonTone = tier === "super" ? "primary" : tier === "good" ? "success" : "secondary";

  return (
    <div className="mx-auto max-w-2xl text-center">
      <Card className={cn("rounded-[2rem] p-6 sm:p-8", cardClass)}>
        <div className="relative mx-auto mb-4 h-32 w-32 sm:h-40 sm:w-40">
          <ShapePrimitive
            shape={shape}
            label={trophyLabel}
            palette={palette}
            className="h-full w-full"
          />
          {tier === "super" && (
            <Trophy
              className="absolute -top-2 -right-2 h-10 w-10 fill-yellow-300 text-yellow-600 drop-shadow"
              aria-hidden="true"
            />
          )}
          {tier === "good" && (
            <Star
              className="absolute -top-2 -right-2 h-10 w-10 fill-yellow-300 text-yellow-500 drop-shadow"
              aria-hidden="true"
            />
          )}
        </div>

        <h2 className="mb-4 text-4xl font-black text-purple-800 sm:text-5xl">{t(headlineKey)}</h2>

        <div className="mb-6 space-y-1 text-xl font-bold text-purple-700 sm:text-2xl">
          <div>{t("games.common.stats.scoreOutOf", { score, max: maxScore })}</div>
          <div>
            {t("games.common.stats.answered", {
              answered: questionsAnswered,
              total: totalQuestions,
            })}
          </div>
          <div>
            {t(`games.common.stats.${starsLabelKey}`, {
              count: Math.floor(score / pointsPerQuestion),
            })}
          </div>
          {extraStats}
        </div>

        <div className="flex justify-center">
          <ToyButton
            onClick={onPlayAgain}
            tone={buttonTone}
            className="min-h-16 px-8 text-xl sm:text-2xl"
          >
            <RotateCcw className="h-6 w-6" aria-hidden="true" />
            {t("common.playAgain")}
          </ToyButton>
        </div>
      </Card>
    </div>
  );
}
