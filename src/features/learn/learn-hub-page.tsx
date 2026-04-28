import { useTranslation } from "react-i18next";

import TopicHub from "@/components/hub/topic-hub";
import { LEARN_TOPICS } from "@/data/topics";

export const RECENT_LEARN_KEY = "nthkids:recent-learn-topic";

export default function LearnHubPage() {
  const { t } = useTranslation();

  return (
    <TopicHub
      title={t("learn.title")}
      subtitle={t("learn.subtitle")}
      topics={LEARN_TOPICS}
      recentKey={RECENT_LEARN_KEY}
    />
  );
}
