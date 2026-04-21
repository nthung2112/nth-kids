import { useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import ColorGame from "@/components/color-game";
import ColorLearning from "@/components/color-learning";
import ColorMatchingGame from "@/components/color-matching-game";
import ColoringGame from "@/components/coloring-game";
import PageLayout from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/useSound";
import { preloadSpriteTopic } from "@/lib/audio-sprite-player";

export const Route = createFileRoute("/colors")({
  component: ColorsPage,
});

type ColorMode = "basic" | "matching" | "coloring";

const COLOR_MODES: Array<{
  id: ColorMode;
  labelKey: string;
  active: string;
  inactive: string;
}> = [
  {
    id: "basic",
    labelKey: "colors.modes.identify",
    active: "bg-red-500 text-white shadow-md hover:bg-red-600",
    inactive: "border-2 border-red-400 bg-white/80 text-red-600 hover:bg-white",
  },
  {
    id: "matching",
    labelKey: "colors.modes.matching",
    active: "bg-blue-500 text-white shadow-md hover:bg-blue-600",
    inactive: "border-2 border-blue-400 bg-white/80 text-blue-600 hover:bg-white",
  },
  {
    id: "coloring",
    labelKey: "colors.modes.coloring",
    active: "bg-green-500 text-white shadow-md hover:bg-green-600",
    inactive: "border-2 border-green-400 bg-white/80 text-green-600 hover:bg-white",
  },
];

function ColorsPage() {
  const { t } = useTranslation();
  const { playClickSound } = useSound();
  const [showGame, setShowGame] = useState(false);
  const [colorGameMode, setColorGameMode] = useState<ColorMode>("basic");

  useEffect(() => {
    preloadSpriteTopic("colors");
  }, []);

  return (
    <PageLayout>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4 sm:gap-3">
        <Button
          onClick={() => {
            playClickSound();
            setShowGame(!showGame);
          }}
          className="h-11 rounded-full bg-linear-to-r from-pink-500 to-purple-600 px-4 text-sm font-semibold text-white shadow-md hover:from-pink-600 hover:to-purple-700 sm:px-5 sm:text-base"
        >
          {showGame ? t("common.playLesson") : t("common.playGame")}
        </Button>

        {showGame && (
          <div className="flex flex-wrap justify-center gap-2" role="tablist">
            {COLOR_MODES.map(mode => {
              const isActive = colorGameMode === mode.id;
              return (
                <Button
                  key={mode.id}
                  onClick={() => {
                    playClickSound();
                    setColorGameMode(mode.id);
                  }}
                  className={`h-11 rounded-full px-3 text-xs font-semibold sm:px-4 sm:text-sm ${
                    isActive ? mode.active : mode.inactive
                  }`}
                  aria-pressed={isActive}
                  role="tab"
                >
                  {t(mode.labelKey)}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {!showGame ? (
        <ColorLearning />
      ) : colorGameMode === "basic" ? (
        <ColorGame />
      ) : colorGameMode === "matching" ? (
        <ColorMatchingGame />
      ) : (
        <ColoringGame />
      )}
    </PageLayout>
  );
}
