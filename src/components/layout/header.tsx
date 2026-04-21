import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { TOPICS, getTopicByPath, type TopicPath } from "@/data/topics";
import { useSound } from "@/hooks/useSound";

export default function Header() {
  const { playClickSound } = useSound();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const getTitle = () => {
    const topic = TOPICS.find(item => pathname.startsWith(item.path));
    if (topic) return t(topic.headerTitleKey);
    if (pathname.startsWith("/flashcards")) return t("header.titles.flashcards");
    return t("header.titles.home");
  };

  const navigateTo = (path: TopicPath) => {
    playClickSound();
    navigate({ to: path });
  };

  return (
    <header className="px-3 pt-3 pb-2 text-center sm:px-4 sm:pt-4 sm:pb-3">
      <Link
        to="/"
        onClick={() => playClickSound()}
        className="inline-block text-2xl font-bold text-purple-800 transition-transform hover:scale-105 motion-reduce:transition-none sm:text-3xl md:text-4xl"
      >
        {getTitle()}
      </Link>

      <nav
        className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:mt-3 sm:gap-3"
        aria-label={t("nav.numbers")}
      >
        {TOPICS.map(topic => {
          const isActive = pathname.startsWith(topic.path);
          return (
            <Button
              key={topic.path}
              onClick={() => navigateTo(topic.path)}
              className={`h-11 rounded-full px-3 text-sm font-semibold sm:px-5 sm:text-base ${
                isActive ? topic.theme.active : topic.theme.inactive
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span aria-hidden="true">{topic.icon}</span>
              <span>{t(topic.navLabelKey)}</span>
            </Button>
          );
        })}
      </nav>
    </header>
  );
}

// Re-export so consumers can keep importing from header
export { getTopicByPath };
