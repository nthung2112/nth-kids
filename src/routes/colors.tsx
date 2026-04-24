import { useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import ColorGame from "@/components/color-game";
import ColorLearning from "@/components/color-learning";
import ColorMatchingGame from "@/components/color-matching-game";
import ColoringGame from "@/components/coloring-game";
import ImmersiveView from "@/components/layout/immersive-view";
import { Button } from "@/components/ui/button";
import type { SpriteTopic } from "@/data/audioSprites";
import { usePreloadSprite } from "@/hooks/useSpritePreload";
import { validateTopicSearch } from "./-topic-search";

const COLORS_SPRITE_TOPICS: readonly SpriteTopic[] = ["colors", "prompts"];

export const Route = createFileRoute("/colors")({
  component: ColorsPage,
  validateSearch: validateTopicSearch,
});

type ColorGameMode = "basic" | "matching" | "coloring";

const COLOR_MODES: Array<{
  id: ColorGameMode;
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
  const { mode } = Route.useSearch();
  const [gameMode, setGameMode] = useState<ColorGameMode>("basic");

  usePreloadSprite(COLORS_SPRITE_TOPICS);

  const exitTo = mode === "game" ? "/game" : "/learn";

  return (
    <ImmersiveView exitTo={exitTo}>
      {mode === "learn" ? (
        <ColorLearning />
      ) : (
        <>
          <div
            className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4 sm:gap-3"
            role="tablist"
          >
            {COLOR_MODES.map(item => {
              const isActive = gameMode === item.id;
              return (
                <Button
                  key={item.id}
                  onClick={() => setGameMode(item.id)}
                  className={`h-11 rounded-full px-3 text-xs font-semibold sm:px-4 sm:text-sm ${
                    isActive ? item.active : item.inactive
                  }`}
                  aria-pressed={isActive}
                  role="tab"
                >
                  {t(item.labelKey)}
                </Button>
              );
            })}
          </div>

          {gameMode === "basic" ? (
            <ColorGame />
          ) : gameMode === "matching" ? (
            <ColorMatchingGame />
          ) : (
            <ColoringGame />
          )}
        </>
      )}
    </ImmersiveView>
  );
}
