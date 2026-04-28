import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import type { SpriteTopic } from "@/data/audioSprites";
import ShapesLearning from "@/features/shapes/shapes-learning";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

const SHAPES_SPRITE_TOPICS: readonly SpriteTopic[] = ["shapes", "prompts"];

export const Route = createFileRoute("/learn/shapes")({
  component: LearnShapesPage,
});

function LearnShapesPage() {
  usePreloadSprite(SHAPES_SPRITE_TOPICS);

  return (
    <ImmersiveView exitTo="/learn">
      <ShapesLearning />
    </ImmersiveView>
  );
}
