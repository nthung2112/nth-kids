import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import Footer from "@/components/layout/footer";
import RecommendationCard from "@/components/recommendation-card";
import SettingsTrigger from "@/components/settings/settings-trigger";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TOPICS, type TopicPath } from "@/data/topics";
import { useSound } from "@/hooks/useSound";

export const Route = createFileRoute("/")({
  component: Home,
});

const RECENT_TOPIC_KEY = "nthkids:recent-topic";

const FEATURES = [
  { icon: "🎮", key: "home.features.interactive" },
  { icon: "🔊", key: "home.features.sound" },
  { icon: "⚙️", key: "home.features.flexible" },
  { icon: "📱", key: "home.features.mobile" },
];

function Home() {
  const { playClickSound } = useSound();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navigateTo = (path: TopicPath) => {
    playClickSound();
    try {
      window.localStorage.setItem(RECENT_TOPIC_KEY, path);
    } catch {
      // ignore storage errors (private mode etc.)
    }
    navigate({ to: path });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-linear-to-br from-sky-200 via-purple-200 to-pink-200">
      <SettingsTrigger />

      <main className="flex flex-1 flex-col px-3 pt-4 pb-3 sm:px-4 sm:pt-6">
        <div className="mb-4 text-center sm:mb-6">
          <h1 className="text-3xl font-bold text-purple-800 sm:text-5xl md:text-6xl">
            {t("app.title")} 🌟
          </h1>
          <p className="mt-1 text-sm font-semibold text-purple-600 sm:mt-2 sm:text-lg md:text-xl">
            {t("app.subtitle")}
          </p>
        </div>

        <div className="mx-auto mb-4 w-full max-w-5xl sm:mb-6">
          <RecommendationCard
            recentTopicKey={RECENT_TOPIC_KEY}
            onNavigate={path => navigateTo(path as TopicPath)}
          />
        </div>

        <div className="mx-auto mb-5 w-full max-w-5xl space-y-3 sm:mb-6 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-4 md:gap-6">
          {TOPICS.map(topic => (
            <Card
              key={topic.path}
              role="button"
              tabIndex={0}
              aria-label={t(topic.homeTitleKey)}
              className={`flex cursor-pointer items-center gap-4 border-4 p-3 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 motion-reduce:transition-none sm:flex-col sm:gap-2 sm:p-5 sm:text-center md:p-6 ${topic.theme.cardClass}`}
              onClick={() => navigateTo(topic.path)}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigateTo(topic.path);
                }
              }}
            >
              <div className="shrink-0 text-5xl sm:text-6xl md:text-7xl" aria-hidden="true">
                {topic.icon}
              </div>

              <div className="flex-1 text-left sm:flex-none sm:text-center">
                <h2 className={`text-lg font-bold sm:text-xl md:text-2xl ${topic.theme.titleClass}`}>
                  {t(topic.homeTitleKey)}
                </h2>
                <p className={`mt-0.5 text-xs sm:mt-1 sm:text-sm md:text-base ${topic.theme.descClass}`}>
                  {t(topic.homeDescriptionKey)}
                </p>
              </div>

              <Button
                className={`hidden rounded-full px-5 text-sm text-white sm:mt-2 sm:inline-flex md:px-7 md:text-base ${topic.theme.buttonClass}`}
                tabIndex={-1}
              >
                {t("home.cta")}
              </Button>

              <ChevronRight
                className={`h-6 w-6 shrink-0 sm:hidden ${topic.theme.arrowClass}`}
                aria-hidden="true"
              />
            </Card>
          ))}
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <h3 className="mb-2 text-center text-base font-bold text-purple-800 sm:mb-3 sm:text-xl md:text-2xl">
            {t("home.featuresTitle")}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            {FEATURES.map(feature => (
              <div
                key={feature.key}
                className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-left shadow-sm sm:flex-col sm:text-center"
              >
                <div className="text-xl sm:text-2xl" aria-hidden="true">
                  {feature.icon}
                </div>
                <div className="text-xs font-bold text-purple-700 sm:text-sm">
                  {t(feature.key)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
