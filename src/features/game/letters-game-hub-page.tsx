import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";

interface LettersModeCard {
  to: "/game/letters/alphabet" | "/game/letters/sequence" | "/game/letters/sounds";
  labelKey: string;
  descriptionKey: string;
  emoji: string;
  cardClass: string;
  titleClass: string;
  descClass: string;
  arrowClass: string;
}

const LETTERS_MODES: LettersModeCard[] = [
  {
    to: "/game/letters/alphabet",
    labelKey: "letters.modes.basic",
    descriptionKey: "letters.modes.basicDescription",
    emoji: "🔤",
    cardClass: "border-orange-300 bg-linear-to-br from-orange-100 to-orange-200",
    titleClass: "text-orange-800",
    descClass: "text-orange-700/80",
    arrowClass: "text-orange-500",
  },
  {
    to: "/game/letters/sequence",
    labelKey: "letters.modes.sequence",
    descriptionKey: "letters.modes.sequenceDescription",
    emoji: "🧠",
    cardClass: "border-purple-300 bg-linear-to-br from-purple-100 to-purple-200",
    titleClass: "text-purple-800",
    descClass: "text-purple-700/80",
    arrowClass: "text-purple-500",
  },
  {
    to: "/game/letters/sounds",
    labelKey: "letters.modes.sounds",
    descriptionKey: "letters.modes.soundsDescription",
    emoji: "🔊",
    cardClass: "border-emerald-300 bg-linear-to-br from-emerald-100 to-emerald-200",
    titleClass: "text-emerald-800",
    descClass: "text-emerald-700/80",
    arrowClass: "text-emerald-500",
  },
];

export default function LettersGameHubPage() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <header className="mb-4 text-center sm:mb-5 lg:mb-8">
        <h1 className="text-2xl font-bold text-purple-800 sm:text-3xl lg:text-4xl">
          {t("header.titles.letters")}
        </h1>
        <p className="mt-1 text-sm text-purple-600 sm:text-base lg:text-lg">{t("game.subtitle")}</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-6">
        {LETTERS_MODES.map(mode => (
          <Link key={mode.to} to={mode.to} className="block">
            <Card
              className={`flex cursor-pointer items-center gap-3 border-4 p-4 text-left shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 motion-reduce:transition-none ${mode.cardClass}`}
            >
              <div className="shrink-0 text-4xl sm:text-5xl" aria-hidden="true">
                {mode.emoji}
              </div>
              <div className="flex-1">
                <h2 className={`text-lg font-bold sm:text-xl ${mode.titleClass}`}>
                  {t(mode.labelKey)}
                </h2>
                <p className={`mt-0.5 text-xs sm:text-sm ${mode.descClass}`}>
                  {t(mode.descriptionKey, { defaultValue: "" })}
                </p>
              </div>
              <ChevronRight className={`h-5 w-5 shrink-0 ${mode.arrowClass}`} aria-hidden="true" />
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
