import { createFileRoute } from "@tanstack/react-router";

import HomePage, { RECENT_TOPIC_KEY } from "@/features/home/home-page";

export { RECENT_TOPIC_KEY };

export const Route = createFileRoute("/")({
  component: HomePage,
});
