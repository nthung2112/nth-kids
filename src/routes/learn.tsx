import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import TopicHub from "@/components/hub/topic-hub";
import { LEARN_TOPICS } from "@/data/topics";

export const RECENT_LEARN_KEY = "nthkids:recent-learn-topic";

export const Route = createFileRoute("/learn")({
  component: LearnHub,
});

function LearnHub() {
  const { t } = useTranslation();

  return (
    <TopicHub
      title={t("learn.title")}
      subtitle={t("learn.subtitle")}
      topics={LEARN_TOPICS}
      mode="learn"
      recentKey={RECENT_LEARN_KEY}
    />
  );
}
