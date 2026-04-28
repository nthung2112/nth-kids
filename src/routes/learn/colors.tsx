import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import type { SpriteTopic } from "@/data/audioSprites";
import ColorLearning from "@/features/colors/color-learning";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

const COLORS_SPRITE_TOPICS: readonly SpriteTopic[] = ["colors", "prompts"];

export const Route = createFileRoute("/learn/colors")({
  component: LearnColorsPage,
});

function LearnColorsPage() {
  usePreloadSprite(COLORS_SPRITE_TOPICS);

  return (
    <ImmersiveView exitTo="/learn">
      <ColorLearning />
    </ImmersiveView>
  );
}
