import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import ShapesGame from "@/components/shapes-game";
import ShapesLearning from "@/components/shapes-learning";
import type { SpriteTopic } from "@/data/audioSprites";
import { usePreloadSprite } from "@/hooks/useSpritePreload";
import { validateTopicSearch } from "./-topic-search";

const SHAPES_SPRITE_TOPICS: readonly SpriteTopic[] = ["shapes", "prompts"];

export const Route = createFileRoute("/shapes")({
  component: ShapesPage,
  validateSearch: validateTopicSearch,
});

function ShapesPage() {
  const { mode } = Route.useSearch();

  usePreloadSprite(SHAPES_SPRITE_TOPICS);

  const exitTo = mode === "game" ? "/game" : "/learn";

  return (
    <ImmersiveView exitTo={exitTo}>
      {mode === "learn" ? <ShapesLearning /> : <ShapesGame />}
    </ImmersiveView>
  );
}
