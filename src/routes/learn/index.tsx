import { createFileRoute } from "@tanstack/react-router";

import LearnHubPage, { RECENT_LEARN_KEY } from "@/features/learn/learn-hub-page";

export { RECENT_LEARN_KEY };

export const Route = createFileRoute("/learn/")({
  component: LearnHubPage,
});
