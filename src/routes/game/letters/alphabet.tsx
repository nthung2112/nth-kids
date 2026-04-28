import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import type { SpriteTopic } from "@/data/audioSprites";
import AlphabetGame from "@/features/letters/alphabet-game";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

const LETTERS_SPRITE_TOPICS: readonly SpriteTopic[] = ["alphabet", "alphabetWords", "prompts"];

export const Route = createFileRoute("/game/letters/alphabet")({
  component: GameLettersAlphabetPage,
});

function GameLettersAlphabetPage() {
  usePreloadSprite(LETTERS_SPRITE_TOPICS);

  return (
    <ImmersiveView exitTo="/game/letters">
      <AlphabetGame />
    </ImmersiveView>
  );
}
