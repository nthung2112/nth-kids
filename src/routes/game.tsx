import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import TopicHub from "@/components/hub/topic-hub";
import { GAME_TOPICS } from "@/data/topics";

export const RECENT_GAME_KEY = "nthkids:recent-game-topic";

export const Route = createFileRoute("/game")({
  component: GameHub,
});

function GameHub() {
  const { t } = useTranslation();

  return (
    <TopicHub
      title={t("game.title")}
      subtitle={t("game.subtitle")}
      topics={GAME_TOPICS}
      mode="game"
      recentKey={RECENT_GAME_KEY}
    />
  );
}
