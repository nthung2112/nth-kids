import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/layout/page-container";
import { ProgressSummaryCard } from "@/components/rewards";
import { ToyBackdrop, ToyButton, ToyIllustration, ToyTile } from "@/components/toys";
import { GAME_TOPICS, LEARN_TOPICS, type GameTopicPath, type LearnTopicPath } from "@/data/topics";
import DailyPlayCard from "@/features/home/daily-play-card";
import RecommendationCard from "@/features/home/recommendation-card";
import { useDailyPlaylist } from "@/hooks/useDailyPlaylist";
import { useRewardProgress } from "@/hooks/useRewardProgress";

export const RECENT_TOPIC_KEY = "nthkids:recent-topic";

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { progress } = useRewardProgress();
  const dailyPlay = useDailyPlaylist();

  const rememberPath = (path: LearnTopicPath | GameTopicPath) => {
    try {
      window.localStorage.setItem(RECENT_TOPIC_KEY, path);
    } catch {
      // ignore storage errors (private mode etc.)
    }
  };

  const goToLearnTopic = (path: LearnTopicPath) => {
    rememberPath(path);
    navigate({ to: path });
  };

  const goToGameTopic = (path: GameTopicPath) => {
    rememberPath(path);
    navigate({ to: path });
  };

  const goToHub = (to: "/learn" | "/game") => {
    navigate({ to });
  };

  const flashcardsTopic = GAME_TOPICS.find(topic => topic.id === "flashcards");

  return (
    <PageContainer>
      <section className="relative mb-5 overflow-hidden rounded-[2rem] border-4 border-white/70 bg-white/75 p-4 shadow-xl sm:mb-6 sm:p-6 lg:p-8">
        <ToyBackdrop topicId="numbers" className="absolute inset-0 opacity-70" />
        <div className="relative z-10 grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black tracking-wide text-purple-500 uppercase">
              {t("home.hero.eyebrow")}
            </p>
            <h1 className="mt-2 text-3xl font-black text-purple-900 sm:text-4xl lg:text-5xl">
              {t("home.hero.title")}
            </h1>
            <p className="mt-2 max-w-xl text-base font-bold text-purple-700 sm:text-lg">
              {t("home.hero.subtitle")}
            </p>
            <ToyButton className="mt-4" onClick={() => goToHub("/game")}>
              {t("home.hero.primaryAction")}
            </ToyButton>
          </div>
          <ToyIllustration
            topicId="numbers"
            assetRole="hero"
            className="mx-auto h-36 w-36 sm:h-44 sm:w-44"
          />
        </div>
      </section>

      <div className="mb-4 lg:mb-6">
        <RecommendationCard
          recentTopicKey={RECENT_TOPIC_KEY}
          onNavigateLearn={goToLearnTopic}
          onNavigateGame={goToGameTopic}
        />
      </div>

      {dailyPlay.enabled && (
        <div className="mb-4 lg:mb-6">
          <DailyPlayCard state={dailyPlay} />
        </div>
      )}

      <div className="mb-4 lg:mb-6">
        <ProgressSummaryCard progress={progress} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:mb-6 lg:gap-6">
        <ToyTile
          topic={LEARN_TOPICS[0]}
          variant="hero"
          titleKey="home.heroTiles.learn.title"
          descriptionKey="home.heroTiles.learn.description"
          ariaLabel={t("home.heroTiles.learn.title")}
          illustrationTopicId="letters"
          onSelect={() => goToHub("/learn")}
        />
        <ToyTile
          topic={GAME_TOPICS[0]}
          variant="hero"
          titleKey="home.heroTiles.play.title"
          descriptionKey="home.heroTiles.play.description"
          ariaLabel={t("home.heroTiles.play.title")}
          illustrationTopicId="flashcards"
          onSelect={() => goToHub("/game")}
        />
      </div>

      <section className="mb-4 lg:mb-8">
        <h2 className="mb-2 text-sm font-bold tracking-wide text-purple-700 uppercase sm:text-base lg:mb-4 lg:text-lg">
          {t("home.exploreTopics")}
        </h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
          {LEARN_TOPICS.map(topic => (
            <ToyTile key={topic.path} topic={topic} onSelect={() => goToLearnTopic(topic.path)} />
          ))}
          {flashcardsTopic && (
            <ToyTile topic={flashcardsTopic} onSelect={() => goToGameTopic(flashcardsTopic.path)} />
          )}
        </div>
      </section>
    </PageContainer>
  );
}
