import { createFileRoute } from "@tanstack/react-router";

import LettersGameHubPage from "@/features/game/letters-game-hub-page";

export const Route = createFileRoute("/game/letters/")({
  component: LettersGameHubPage,
});
