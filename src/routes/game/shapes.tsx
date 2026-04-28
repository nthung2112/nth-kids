import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import type { SpriteTopic } from "@/data/audioSprites";
import ShapesGame from "@/features/shapes/shapes-game";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

const SHAPES_SPRITE_TOPICS: readonly SpriteTopic[] = ["shapes", "prompts"];

export const Route = createFileRoute("/game/shapes")({
  component: GameShapesPage,
});

function GameShapesPage() {
  usePreloadSprite(SHAPES_SPRITE_TOPICS);

  return (
    <ImmersiveView exitTo="/game">
      <ShapesGame />
    </ImmersiveView>
  );
}
