import { useEffect, useState } from "react";

import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ToyButton, ToyTile } from "@/components/toys";
import { GAME_TOPICS, LEARN_TOPICS, type GameTopicPath, type LearnTopicPath } from "@/data/topics";

interface RecommendationCardProps {
  recentTopicKey: string;
  onNavigateLearn: (path: LearnTopicPath) => void;
  onNavigateGame: (path: GameTopicPath) => void;
}

export default function RecommendationCard({
  recentTopicKey,
  onNavigateLearn,
  onNavigateGame,
}: RecommendationCardProps) {
  const { t } = useTranslation();
  const [recent, setRecent] = useState<string | null>(null);

  useEffect(() => {
    try {
      setRecent(window.localStorage.getItem(recentTopicKey));
    } catch {
      setRecent(null);
    }
  }, [recentTopicKey]);

  const continueTopic = LEARN_TOPICS.find(topic => topic.path === recent);
  const primaryLearnTopic = continueTopic ?? LEARN_TOPICS[0];

  const newSuggestion = LEARN_TOPICS.find(topic => topic.path !== recent) ?? LEARN_TOPICS[0];
  const newSuggestionGame =
    GAME_TOPICS.find(topic => topic.id === newSuggestion.id) ?? GAME_TOPICS[0];

  return (
    <div className="rounded-[2rem] border-4 border-white/70 bg-white/80 p-3 shadow-xl sm:p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="text-purple-600" aria-hidden="true" />
        <h3 className="text-base font-bold text-purple-800 sm:text-lg">
          {t("home.recommend.title")}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
        <ToyTile
          topic={primaryLearnTopic}
          onSelect={() => onNavigateLearn(primaryLearnTopic.path)}
        />
        <ToyTile
          topic={newSuggestionGame}
          onSelect={() => onNavigateGame(newSuggestionGame.path)}
        />
        <ToyButton tone="secondary" onClick={() => onNavigateGame("/game/flashcards")}>
          {t("home.recommend.tryFlashcards")}
        </ToyButton>
      </div>
    </div>
  );
}
