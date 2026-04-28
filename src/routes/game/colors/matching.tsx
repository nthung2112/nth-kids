import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import type { SpriteTopic } from "@/data/audioSprites";
import ColorMatchingGame from "@/features/colors/color-matching-game";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

const COLORS_SPRITE_TOPICS: readonly SpriteTopic[] = ["colors", "prompts"];

export const Route = createFileRoute("/game/colors/matching")({
  component: GameColorsMatchingPage,
});

function GameColorsMatchingPage() {
  usePreloadSprite(COLORS_SPRITE_TOPICS);

  return (
    <ImmersiveView exitTo="/game/colors">
      <ColorMatchingGame />
    </ImmersiveView>
  );
}
