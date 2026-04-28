import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import type { SpriteTopic } from "@/data/audioSprites";
import AlphabetLearning from "@/features/letters/alphabet-learning";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

const LETTERS_SPRITE_TOPICS: readonly SpriteTopic[] = ["alphabet", "alphabetWords", "prompts"];

export const Route = createFileRoute("/learn/letters")({
  component: LearnLettersPage,
});

function LearnLettersPage() {
  usePreloadSprite(LETTERS_SPRITE_TOPICS);

  return (
    <ImmersiveView exitTo="/learn">
      <AlphabetLearning />
    </ImmersiveView>
  );
}
