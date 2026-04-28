import { useNavigate } from "@tanstack/react-router";

import PageContainer from "@/components/layout/page-container";
import { ToyBackdrop, ToyTile } from "@/components/toys";
import type { GameTopicId, GameTopicMeta, TopicMeta } from "@/data/topics";

interface TopicHubProps {
  title: string;
  subtitle: string;
  topics: ReadonlyArray<TopicMeta | GameTopicMeta>;
  recentKey: string;
}

export default function TopicHub({ title, subtitle, topics, recentKey }: TopicHubProps) {
  const navigate = useNavigate();

  const handlePick = (topic: TopicMeta | GameTopicMeta) => {
    try {
      window.localStorage.setItem(recentKey, topic.path);
    } catch {
      // ignore private-mode storage errors
    }
    navigate({ to: topic.path });
  };

  const backdropTopicId: GameTopicId = topics[0]?.id ?? "numbers";

  return (
    <PageContainer>
      <header className="mb-4 text-center sm:mb-5 lg:mb-8">
        <h1 className="text-2xl font-bold text-purple-800 sm:text-3xl lg:text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-purple-600 sm:text-base lg:text-lg">{subtitle}</p>
      </header>

      <div className="relative overflow-hidden rounded-[2rem] border-4 border-white/70 bg-white/60 p-3 shadow-xl sm:p-5 lg:p-6">
        <ToyBackdrop topicId={backdropTopicId} className="absolute inset-0 opacity-50" />
        <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topics.map(topic => (
            <ToyTile key={topic.path} topic={topic} onSelect={() => handlePick(topic)} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
