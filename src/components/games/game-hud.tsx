import { HelpCircle, Heart, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

interface GameHudProps {
  score: number;
  lives: number;
  livesStart: number;
  current: number;
  total: number;
  onTutorial?: () => void;
  totalLabel?: string;
}

export default function GameHud({
  score,
  lives,
  livesStart,
  current,
  total,
  onTutorial,
  totalLabel,
}: GameHudProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto mb-6 flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 rounded-3xl bg-white p-3 shadow-lg sm:mb-8 sm:gap-4 sm:rounded-full sm:p-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          <span
            className="text-xl font-bold text-purple-800"
            aria-label={t("games.common.aria.score", { score })}
          >
            {score}
          </span>
        </div>

        {onTutorial && (
          <Button
            onClick={onTutorial}
            className="h-10 rounded-full bg-blue-500 px-3 text-xs text-white hover:bg-blue-600 sm:h-11 sm:text-sm"
            aria-label={t("games.common.tutorialButton")}
            title={t("games.common.tutorialButton")}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t("games.common.tutorialButton")}</span>
          </Button>
        )}
      </div>

      <div
        className="order-last flex w-full items-center justify-center gap-1 sm:order-0 sm:w-auto"
        aria-label={t("games.common.aria.lives", { lives, total: livesStart })}
      >
        {[...Array(livesStart)].map((_, i) => (
          <Heart
            key={i}
            className={`h-6 w-6 sm:h-8 sm:w-8 ${
              i < lives ? "fill-red-500 text-red-500" : "text-gray-300"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span
          className="text-base font-semibold text-purple-600 sm:text-lg"
          aria-label={t("games.common.aria.progress", { current, total })}
        >
          {current}/{totalLabel ?? total}
        </span>
      </div>
    </div>
  );
}
