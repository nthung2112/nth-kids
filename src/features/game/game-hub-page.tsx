import { useTranslation } from "react-i18next";

import TopicHub from "@/components/hub/topic-hub";
import { GAME_TOPICS } from "@/data/topics";

export const RECENT_GAME_KEY = "nthkids:recent-game-topic";

export default function GameHubPage() {
  const { t } = useTranslation();

  return (
    <TopicHub
      title={t("game.title")}
      subtitle={t("game.subtitle")}
      topics={GAME_TOPICS}
      recentKey={RECENT_GAME_KEY}
    />
  );
}
