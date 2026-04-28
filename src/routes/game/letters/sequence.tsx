import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import type { SpriteTopic } from "@/data/audioSprites";
import SequenceGame from "@/features/letters/sequence-game";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

const LETTERS_SPRITE_TOPICS: readonly SpriteTopic[] = ["alphabet", "prompts"];

export const Route = createFileRoute("/game/letters/sequence")({
  component: GameLettersSequencePage,
});

function GameLettersSequencePage() {
  usePreloadSprite(LETTERS_SPRITE_TOPICS);

  return (
    <ImmersiveView exitTo="/game/letters">
      <SequenceGame />
    </ImmersiveView>
  );
}
