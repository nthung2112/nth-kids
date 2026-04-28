import ToyHud from "@/components/toys/toy-hud";

export interface GameHudProps {
  score: number;
  lives: number;
  livesStart: number;
  current: number;
  total: number;
  onTutorial?: () => void;
  totalLabel?: string;
}

export default function GameHud(props: GameHudProps) {
  return <ToyHud {...props} />;
}
