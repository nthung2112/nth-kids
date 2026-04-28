import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import type { SpriteTopic } from "@/data/audioSprites";
import ColoringGame from "@/features/colors/coloring-game";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

const COLORS_SPRITE_TOPICS: readonly SpriteTopic[] = ["colors", "prompts"];

export const Route = createFileRoute("/game/colors/coloring")({
  component: GameColorsColoringPage,
});

function GameColorsColoringPage() {
  usePreloadSprite(COLORS_SPRITE_TOPICS);

  return (
    <ImmersiveView exitTo="/game/colors">
      <ColoringGame />
    </ImmersiveView>
  );
}
