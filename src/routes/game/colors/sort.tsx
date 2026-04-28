import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import type { SpriteTopic } from "@/data/audioSprites";
import ColorSortingGame from "@/features/colors/color-sorting-game";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

const COLORS_SPRITE_TOPICS: readonly SpriteTopic[] = ["colors", "prompts"];

export const Route = createFileRoute("/game/colors/sort")({
  component: GameColorsSortPage,
});

function GameColorsSortPage() {
  usePreloadSprite(COLORS_SPRITE_TOPICS);

  return (
    <ImmersiveView exitTo="/game/colors">
      <ColorSortingGame />
    </ImmersiveView>
  );
}
