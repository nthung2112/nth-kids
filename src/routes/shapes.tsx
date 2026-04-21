import { useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import PageLayout from "@/components/layout/page-layout";
import ShapesGame from "@/components/shapes-game";
import ShapesLearning from "@/components/shapes-learning";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/useSound";
import { preloadSpriteTopic } from "@/lib/audio-sprite-player";

export const Route = createFileRoute("/shapes")({
  component: ShapesPage,
});

function ShapesPage() {
  const { t } = useTranslation();
  const { playClickSound } = useSound();
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    preloadSpriteTopic("shapes");
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
      </div>

      {showGame ? <ShapesGame /> : <ShapesLearning />}
    </PageLayout>
  );
}
