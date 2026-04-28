import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import CountingGame from "@/features/numbers/counting-game";
import { usePreferences } from "@/hooks/usePreferences";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

export const Route = createFileRoute("/game/numbers")({
  component: GameNumbersPage,
});

function GameNumbersPage() {
  const { prefs } = usePreferences();

  usePreloadSprite("numbers");

  return (
    <ImmersiveView exitTo="/game">
      <CountingGame maxNumber={prefs.maxNumber} />
    </ImmersiveView>
  );
}
