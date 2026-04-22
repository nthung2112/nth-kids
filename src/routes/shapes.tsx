import { useEffect } from "react";

import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import ShapesGame from "@/components/shapes-game";
import ShapesLearning from "@/components/shapes-learning";
import { preloadSpriteTopic } from "@/lib/audio-sprite-player";
import { validateTopicSearch } from "./-topic-search";

export const Route = createFileRoute("/shapes")({
  component: ShapesPage,
  validateSearch: validateTopicSearch,
});

function ShapesPage() {
  const { mode } = Route.useSearch();

  useEffect(() => {
    preloadSpriteTopic("shapes");
  }, []);

  const exitTo = mode === "game" ? "/game" : "/learn";

  return (
    <ImmersiveView exitTo={exitTo}>
      {mode === "learn" ? <ShapesLearning /> : <ShapesGame />}
    </ImmersiveView>
  );
}
