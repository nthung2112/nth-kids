import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Gamepad2, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/layout/page-container";
import RecommendationCard from "@/components/recommendation-card";
import { Card } from "@/components/ui/card";
import { GAME_TOPICS, LEARN_TOPICS, type GameTopicPath, type TopicPath } from "@/data/topics";

export const Route = createFileRoute("/")({
  component: Home,
});

export const RECENT_TOPIC_KEY = "nthkids:recent-topic";

const FEATURES = [
  { icon: "🎮", key: "home.features.interactive" },
  { icon: "🔊", key: "home.features.sound" },
  { icon: "⚙️", key: "home.features.flexible" },
  { icon: "📱", key: "home.features.mobile" },
];

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goToTopic = (path: TopicPath | GameTopicPath, mode: "learn" | "game") => {
    try {
      window.localStorage.setItem(RECENT_TOPIC_KEY, path);
    } catch {
      // ignore storage errors (private mode etc.)
    }
    navigate({ to: path, search: { mode } });
  };

  const goToHub = (to: "/learn" | "/game") => {
    navigate({ to });
  };

  const heroTopics = LEARN_TOPICS;
  const flashcardsTopic = GAME_TOPICS.find(topic => topic.id === "flashcards");

  return (
    <PageContainer>
      <header className="mb-4 text-center sm:mb-5 lg:mb-8">
        <h1 className="text-2xl font-bold text-purple-800 sm:text-3xl lg:text-4xl">
          {t("app.title")}
        </h1>
        <p className="mt-1 text-sm font-semibold text-purple-600 sm:text-base lg:text-lg">
          {t("app.subtitle")}
        </p>
      </header>

      <div className="mb-4 lg:mb-6">
        <RecommendationCard
          recentTopicKey={RECENT_TOPIC_KEY}
          onNavigate={(path, mode) => goToTopic(path as TopicPath | GameTopicPath, mode)}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:mb-6 lg:gap-6">
        <button
          type="button"
          onClick={() => goToHub("/learn")}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-4 border-purple-300 bg-linear-to-br from-purple-100 to-purple-200 p-4 text-center shadow-sm transition-all hover:scale-[1.03] hover:shadow-lg active:scale-95 motion-reduce:transition-none sm:p-6 lg:gap-3 lg:p-8"
        >
          <GraduationCap
            className="h-8 w-8 text-purple-700 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
            aria-hidden="true"
          />
          <span className="text-sm font-bold text-purple-800 sm:text-base lg:text-xl">
            {t("nav.learn")}
          </span>
        </button>
        <button
          type="button"
          onClick={() => goToHub("/game")}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-4 border-pink-300 bg-linear-to-br from-pink-100 to-pink-200 p-4 text-center shadow-sm transition-all hover:scale-[1.03] hover:shadow-lg active:scale-95 motion-reduce:transition-none sm:p-6 lg:gap-3 lg:p-8"
        >
          <Gamepad2
            className="h-8 w-8 text-pink-700 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
            aria-hidden="true"
          />
          <span className="text-sm font-bold text-pink-800 sm:text-base lg:text-xl">
            {t("nav.game")}
          </span>
        </button>
      </div>

      <section className="mb-4 lg:mb-8">
        <h2 className="mb-2 text-sm font-bold text-purple-700 uppercase tracking-wide sm:text-base lg:mb-4 lg:text-lg">
          {t("home.exploreTopics")}
        </h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
          {heroTopics.map(topic => (
            <Card
              key={topic.path}
              role="button"
              tabIndex={0}
              aria-label={t(topic.homeTitleKey)}
              className={`flex cursor-pointer items-center gap-3 border-4 p-3 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 motion-reduce:transition-none lg:p-4 ${topic.theme.cardClass}`}
              onClick={() => goToTopic(topic.path, "learn")}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  goToTopic(topic.path, "learn");
                }
              }}
            >
              <div className="shrink-0 text-4xl sm:text-5xl" aria-hidden="true">
                {topic.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className={`text-base font-bold sm:text-lg ${topic.theme.titleClass}`}>
                  {t(topic.homeTitleKey)}
                </h3>
                <p className={`mt-0.5 text-xs sm:text-sm ${topic.theme.descClass}`}>
                  {t(topic.homeDescriptionKey)}
                </p>
              </div>
              <ChevronRight
                className={`h-5 w-5 shrink-0 ${topic.theme.arrowClass}`}
                aria-hidden="true"
              />
            </Card>
          ))}

          {flashcardsTopic && (
            <Card
              role="button"
              tabIndex={0}
              aria-label={t(flashcardsTopic.homeTitleKey)}
              className={`flex cursor-pointer items-center gap-3 border-4 p-3 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 motion-reduce:transition-none sm:col-span-2 lg:col-span-1 lg:p-4 ${flashcardsTopic.theme.cardClass}`}
              onClick={() => goToTopic(flashcardsTopic.path, "game")}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  goToTopic(flashcardsTopic.path, "game");
                }
              }}
            >
              <div className="shrink-0 text-4xl sm:text-5xl" aria-hidden="true">
                {flashcardsTopic.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className={`text-base font-bold sm:text-lg ${flashcardsTopic.theme.titleClass}`}>
                  {t(flashcardsTopic.homeTitleKey)}
                </h3>
                <p className={`mt-0.5 text-xs sm:text-sm ${flashcardsTopic.theme.descClass}`}>
                  {t(flashcardsTopic.homeDescriptionKey)}
                </p>
              </div>
              <ChevronRight
                className={`h-5 w-5 shrink-0 ${flashcardsTopic.theme.arrowClass}`}
                aria-hidden="true"
              />
            </Card>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-center text-sm font-bold text-purple-700 sm:text-base lg:mb-4 lg:text-lg">
          {t("home.featuresTitle")}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          {FEATURES.map(feature => (
            <div
              key={feature.key}
              className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-left shadow-sm lg:px-4 lg:py-3"
            >
              <div className="text-lg sm:text-xl lg:text-2xl" aria-hidden="true">
                {feature.icon}
              </div>
              <div className="text-xs font-bold text-purple-700 sm:text-sm lg:text-base">
                {t(feature.key)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
