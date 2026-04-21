import { useEffect, useState } from "react";

import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import { TOPICS } from "@/data/topics";

interface RecommendationCardProps {
  recentTopicKey: string;
  onNavigate: (path: string) => void;
}

export default function RecommendationCard({
  recentTopicKey,
  onNavigate,
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

  const continueTopic = TOPICS.find(topic => topic.path === recent) ?? null;
  const newSuggestion = TOPICS.find(topic => topic.path !== recent) ?? TOPICS[0];

  return (
    <Card className="border-4 border-purple-300 bg-white/80 p-3 shadow-sm sm:p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="text-purple-600" aria-hidden="true" />
        <h3 className="text-base font-bold text-purple-800 sm:text-lg">
          {t("home.recommend.title")}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {continueTopic ? (
          <button
            type="button"
            onClick={() => onNavigate(continueTopic.path)}
            className="flex items-center gap-3 rounded-xl border-2 border-blue-300 bg-blue-50 p-3 text-left transition-all hover:scale-[1.02] hover:bg-blue-100 motion-reduce:transition-none"
          >
            <span className="text-3xl" aria-hidden="true">
              {continueTopic.icon}
            </span>
            <span className="flex-1">
              <span className="block text-xs text-blue-600">{t("home.recommend.continue")}</span>
              <span className="block text-sm font-bold text-blue-800">
                {t(continueTopic.homeTitleKey)}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-blue-500" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate(TOPICS[0].path)}
            className="flex items-center gap-3 rounded-xl border-2 border-blue-300 bg-blue-50 p-3 text-left transition-all hover:scale-[1.02] hover:bg-blue-100 motion-reduce:transition-none"
          >
            <span className="text-3xl" aria-hidden="true">
              {TOPICS[0].icon}
            </span>
            <span className="flex-1">
              <span className="block text-xs text-blue-600">{t("home.recommend.newcomer")}</span>
              <span className="block text-sm font-bold text-blue-800">
                {t(TOPICS[0].homeTitleKey)}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-blue-500" aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onNavigate(newSuggestion.path)}
          className="flex items-center gap-3 rounded-xl border-2 border-pink-300 bg-pink-50 p-3 text-left transition-all hover:scale-[1.02] hover:bg-pink-100 motion-reduce:transition-none"
        >
          <span className="text-3xl" aria-hidden="true">
            {newSuggestion.icon}
          </span>
          <span className="flex-1">
            <span className="block text-xs text-pink-600">{t("home.recommend.tryNew")}</span>
            <span className="block text-sm font-bold text-pink-800">
              {t(newSuggestion.homeTitleKey)}
            </span>
          </span>
          <ArrowRight className="h-4 w-4 text-pink-500" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate("/flashcards")}
          className="flex items-center gap-3 rounded-xl border-2 border-orange-300 bg-orange-50 p-3 text-left transition-all hover:scale-[1.02] hover:bg-orange-100 motion-reduce:transition-none"
        >
          <BookOpen className="text-orange-500" aria-hidden="true" />
          <span className="flex-1">
            <span className="block text-xs text-orange-600">
              {t("home.recommend.tryFlashcards")}
            </span>
            <span className="block text-sm font-bold text-orange-800">
              {t("nav.flashcards")}
            </span>
          </span>
          <ArrowRight className="h-4 w-4 text-orange-500" aria-hidden="true" />
        </button>
      </div>
    </Card>
  );
}
