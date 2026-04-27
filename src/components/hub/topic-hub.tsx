import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import type { GameTopicMeta, TopicMeta, TopicMode } from "@/data/topics";

interface TopicHubProps {
  title: string;
  subtitle: string;
  topics: ReadonlyArray<TopicMeta | GameTopicMeta>;
  mode: TopicMode;
  recentKey: string;
}

export default function TopicHub({ title, subtitle, topics, mode, recentKey }: TopicHubProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handlePick = (topic: TopicMeta | GameTopicMeta) => {
    try {
      window.localStorage.setItem(recentKey, topic.path);
    } catch {
      // ignore private-mode storage errors
    }
    navigate({ to: topic.path, search: { mode } });
  };

  return (
    <PageContainer>
      <header className="mb-4 text-center sm:mb-5 lg:mb-8">
        <h1 className="text-2xl font-bold text-purple-800 sm:text-3xl lg:text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-purple-600 sm:text-base lg:text-lg">{subtitle}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {topics.map(topic => (
          <Card
            key={topic.path}
            role="button"
            tabIndex={0}
            aria-label={t(topic.homeTitleKey)}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-4 p-4 text-center shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-95 motion-reduce:transition-none sm:gap-3 sm:p-5 lg:p-6 ${topic.theme.cardClass}`}
            onClick={() => handlePick(topic)}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handlePick(topic);
              }
            }}
          >
            <div
              className="text-5xl transition-transform duration-300 group-hover:scale-110 sm:text-6xl lg:text-7xl"
              aria-hidden="true"
            >
              {topic.icon}
            </div>
            <div>
              <h2 className={`text-lg font-bold sm:text-xl lg:text-2xl ${topic.theme.titleClass}`}>
                {t(topic.homeTitleKey)}
              </h2>
              <p className={`mt-0.5 text-xs sm:text-sm lg:text-base ${topic.theme.descClass}`}>
                {t(topic.homeDescriptionKey)}
              </p>
            </div>
            <ChevronRight
              className={`h-5 w-5 shrink-0 ${topic.theme.arrowClass}`}
              aria-hidden="true"
            />
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
