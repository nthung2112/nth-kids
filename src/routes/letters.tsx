import { useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import AlphabetGame from "@/components/alphabet-game";
import AlphabetLearning from "@/components/alphabet-learning";
import PageLayout from "@/components/layout/page-layout";
import SequenceGame from "@/components/sequence-game";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/useSound";
import { preloadSpriteTopic } from "@/lib/audio-sprite-player";

export const Route = createFileRoute("/letters")({
  component: LettersPage,
});

function LettersPage() {
  const { t } = useTranslation();
  const { playClickSound } = useSound();
  const [showGame, setShowGame] = useState(false);
  const [gameMode, setGameMode] = useState<"basic" | "sequence">("basic");

  useEffect(() => {
    preloadSpriteTopic("alphabet");
  }, []);

  return (
    <PageLayout>
      {/* Mode toggle and game mode selection - compact */}
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
          <div className="flex gap-2">
            <Button
              onClick={() => {
                playClickSound();
                setGameMode("basic");
              }}
              className={`h-11 rounded-full px-3 text-xs font-semibold sm:px-4 sm:text-sm ${
                gameMode === "basic"
                  ? "bg-orange-500 text-white shadow-md hover:bg-orange-600"
                  : "border-2 border-orange-400 bg-white/80 text-orange-600 hover:bg-white"
              }`}
              aria-pressed={gameMode === "basic"}
            >
              {t("letters.modes.basic")}
            </Button>

            <Button
              onClick={() => {
                playClickSound();
                setGameMode("sequence");
              }}
              className={`h-11 rounded-full px-3 text-xs font-semibold sm:px-4 sm:text-sm ${
                gameMode === "sequence"
                  ? "bg-purple-500 text-white shadow-md hover:bg-purple-600"
                  : "border-2 border-purple-400 bg-white/80 text-purple-600 hover:bg-white"
              }`}
              aria-pressed={gameMode === "sequence"}
            >
              {t("letters.modes.sequence")}
            </Button>
          </div>
        )}
      </div>

      {!showGame ? (
        <AlphabetLearning />
      ) : gameMode === "basic" ? (
        <AlphabetGame />
      ) : (
        <SequenceGame />
      )}
    </PageLayout>
  );
}
