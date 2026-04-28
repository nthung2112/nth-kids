import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import type { SpriteTopic } from "@/data/audioSprites";
import LetterSoundsGame from "@/features/letters/letter-sounds-game";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

const LETTER_SOUNDS_SPRITE_TOPICS: readonly SpriteTopic[] = ["alphabet", "prompts"];

export const Route = createFileRoute("/game/letters/sounds")({
  component: GameLettersSoundsPage,
});

function GameLettersSoundsPage() {
  usePreloadSprite(LETTER_SOUNDS_SPRITE_TOPICS);

  return (
    <ImmersiveView exitTo="/game/letters">
      <LetterSoundsGame />
    </ImmersiveView>
  );
}
