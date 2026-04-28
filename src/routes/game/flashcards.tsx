import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import FlashcardsGame from "@/features/flashcards/flashcards-game";
import { usePreferences } from "@/hooks/usePreferences";
import { usePreloadAllSprites } from "@/hooks/useSpritePreload";

export const Route = createFileRoute("/game/flashcards")({
  component: GameFlashcardsPage,
});

function GameFlashcardsPage() {
  const { prefs } = usePreferences();

  usePreloadAllSprites();

  return (
    <ImmersiveView exitTo="/game">
      <FlashcardsGame maxNumber={prefs.maxNumber} />
    </ImmersiveView>
  );
}
