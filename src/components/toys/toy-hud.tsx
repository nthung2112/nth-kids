import { Heart, HelpCircle, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { GameHudProps } from "@/components/games/game-hud";

export type ToyHudProps = GameHudProps;

export default function ToyHud({
  score,
  lives,
  livesStart,
  current,
  total,
  onTutorial,
  totalLabel,
}: ToyHudProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto mb-6 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 rounded-[2rem] border-4 border-white bg-white/90 p-3 shadow-xl sm:mb-8 sm:gap-4 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className="flex items-center gap-2 rounded-full border-4 border-yellow-300 bg-linear-to-br from-yellow-200 to-amber-200 px-3 py-1 shadow-md"
          aria-label={t("games.common.aria.score", { score })}
        >
          <Star className="h-5 w-5 fill-yellow-500 text-yellow-600" aria-hidden="true" />
          <span className="text-xl font-black text-purple-900 sm:text-2xl">{score}</span>
        </div>

        {onTutorial && (
          <button
            type="button"
            onClick={onTutorial}
            className="flex h-11 items-center gap-1 rounded-full border-4 border-sky-300 bg-sky-100 px-3 text-sm font-black text-sky-800 shadow-md transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-hidden active:translate-y-0.5 motion-reduce:transition-none"
            aria-label={t("games.common.tutorialButton")}
            title={t("games.common.tutorialButton")}
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">{t("games.common.tutorialButton")}</span>
          </button>
        )}
      </div>

      <div
        className="flex items-center justify-center gap-1 rounded-full border-4 border-pink-200 bg-pink-50 px-3 py-1 shadow-sm"
        aria-label={t("games.common.aria.lives", { lives, total: livesStart })}
      >
        {Array.from({ length: livesStart }).map((_, i) => (
          <Heart
            key={i}
            className={`h-6 w-6 sm:h-7 sm:w-7 ${
              i < lives ? "fill-red-500 text-red-500" : "text-gray-300"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div
        className="rounded-full border-4 border-purple-200 bg-purple-50 px-4 py-1 shadow-sm"
        aria-label={t("games.common.aria.progress", { current, total })}
      >
        <span className="text-lg font-black text-purple-700 sm:text-xl">
          {current}/{totalLabel ?? total}
        </span>
      </div>
    </div>
  );
}
