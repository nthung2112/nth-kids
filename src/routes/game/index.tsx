import { createFileRoute } from "@tanstack/react-router";

import GameHubPage, { RECENT_GAME_KEY } from "@/features/game/game-hub-page";

export { RECENT_GAME_KEY };

export const Route = createFileRoute("/game/")({
  component: GameHubPage,
});
