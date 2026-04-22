import { useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import AlphabetGame from "@/components/alphabet-game";
import AlphabetLearning from "@/components/alphabet-learning";
import ImmersiveView from "@/components/layout/immersive-view";
import SequenceGame from "@/components/sequence-game";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/useSound";
import { preloadSpriteTopic } from "@/lib/audio-sprite-player";
import { validateTopicSearch } from "./-topic-search";

export const Route = createFileRoute("/letters")({
  component: LettersPage,
  validateSearch: validateTopicSearch,
});

type LettersGameMode = "basic" | "sequence";

function LettersPage() {
  const { t } = useTranslation();
  const { playClickSound } = useSound();
  const { mode } = Route.useSearch();
  const [gameMode, setGameMode] = useState<LettersGameMode>("basic");

  useEffect(() => {
    preloadSpriteTopic("alphabet");
  }, []);

  const exitTo = mode === "game" ? "/game" : "/learn";

  return (
    <ImmersiveView exitTo={exitTo}>
      {mode === "learn" ? (
        <AlphabetLearning />
      ) : (
        <>
          <div
            className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4 sm:gap-3"
            role="tablist"
            aria-label={t("letters.modes.basic")}
          >
            <Button
              onClick={() => {
                playClickSound();
                setGameMode("basic");
              }}
              className={`h-11 rounded-full px-4 text-sm font-semibold sm:text-base ${
                gameMode === "basic"
                  ? "bg-orange-500 text-white shadow-md hover:bg-orange-600"
                  : "border-2 border-orange-400 bg-white/80 text-orange-600 hover:bg-white"
              }`}
              aria-pressed={gameMode === "basic"}
              role="tab"
            >
              {t("letters.modes.basic")}
            </Button>

            <Button
              onClick={() => {
                playClickSound();
                setGameMode("sequence");
              }}
              className={`h-11 rounded-full px-4 text-sm font-semibold sm:text-base ${
                gameMode === "sequence"
                  ? "bg-purple-500 text-white shadow-md hover:bg-purple-600"
                  : "border-2 border-purple-400 bg-white/80 text-purple-600 hover:bg-white"
              }`}
              aria-pressed={gameMode === "sequence"}
              role="tab"
            >
              {t("letters.modes.sequence")}
            </Button>
          </div>

          {gameMode === "basic" ? <AlphabetGame /> : <SequenceGame />}
        </>
      )}
    </ImmersiveView>
  );
}
