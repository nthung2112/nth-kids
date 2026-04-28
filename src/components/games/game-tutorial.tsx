import type { ReactNode } from "react";

import ToyTutorial from "@/components/toys/toy-tutorial";

export interface TutorialStep {
  title: string;
  content: string;
}

export interface GameTutorialProps {
  onClose: () => void;
  stepsKey: string;
  examples?: ReactNode[];
}

export default function GameTutorial(props: GameTutorialProps) {
  return <ToyTutorial {...props} />;
}
