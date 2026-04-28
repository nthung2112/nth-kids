import { createFileRoute } from "@tanstack/react-router";

import ImmersiveView from "@/components/layout/immersive-view";
import NumbersLearning from "@/features/numbers/numbers-learning";
import { usePreloadSprite } from "@/hooks/useSpritePreload";

export const Route = createFileRoute("/learn/numbers")({
  component: LearnNumbersPage,
});

function LearnNumbersPage() {
  usePreloadSprite("numbers");

  return (
    <ImmersiveView exitTo="/learn">
      <NumbersLearning />
    </ImmersiveView>
  );
}
