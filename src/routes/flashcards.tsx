import { createFileRoute } from "@tanstack/react-router";

import FlashcardsGame from "@/components/flashcards-game";
import ImmersiveView from "@/components/layout/immersive-view";
import { usePreferences } from "@/hooks/usePreferences";
import { usePreloadAllSprites } from "@/hooks/useSpritePreload";
import { validateTopicSearch } from "./-topic-search";

export const Route = createFileRoute("/flashcards")({
  component: FlashcardsPage,
  validateSearch: validateTopicSearch,
});

function FlashcardsPage() {
  const { prefs } = usePreferences();

  usePreloadAllSprites();

  return (
    <ImmersiveView exitTo="/game">
      <FlashcardsGame maxNumber={prefs.maxNumber} />
    </ImmersiveView>
  );
}
