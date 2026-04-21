import { useEffect } from "react";

import { createFileRoute } from "@tanstack/react-router";

import FlashcardsGame from "@/components/flashcards-game";
import PageLayout from "@/components/layout/page-layout";
import { usePreferences } from "@/hooks/usePreferences";
import { preloadSprites } from "@/lib/audio-sprite-player";

export const Route = createFileRoute("/flashcards")({
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const { prefs } = usePreferences();

  useEffect(() => {
    // Mixed practice draws from every topic, so warm them all up.
    preloadSprites();
  }, []);

  return (
    <PageLayout>
      <FlashcardsGame maxNumber={prefs.maxNumber} />
    </PageLayout>
  );
}
