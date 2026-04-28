import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import type { SpriteTopic } from "@/data/audioSprites";
import ColorGame from "@/features/colors/color-game";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

const COLORS_SPRITE_TOPICS: readonly SpriteTopic[] = ["colors", "prompts"];

export const Route = createFileRoute("/game/colors/identify")({
  component: GameColorsIdentifyPage,
});

function GameColorsIdentifyPage() {
  usePreloadSprite(COLORS_SPRITE_TOPICS);

  return (
    <ImmersiveView exitTo="/game/colors">
      <ColorGame />
    </ImmersiveView>
  );
}
