import { createFileRoute } from "@tanstack/react-router";

import ColorsGameHubPage from "@/features/game/colors-game-hub-page";

export const Route = createFileRoute("/game/colors/")({
  component: ColorsGameHubPage,
});
