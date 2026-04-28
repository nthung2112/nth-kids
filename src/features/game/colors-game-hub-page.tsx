import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";

interface ColorsModeCard {
  to:
    | "/game/colors/identify"
    | "/game/colors/matching"
    | "/game/colors/coloring"
    | "/game/colors/sort";
  labelKey: string;
  descriptionKey: string;
  emoji: string;
  cardClass: string;
  titleClass: string;
  descClass: string;
  arrowClass: string;
}

const COLORS_MODES: ColorsModeCard[] = [
  {
    to: "/game/colors/identify",
    labelKey: "colors.modes.identify",
    descriptionKey: "colors.modes.identifyDescription",
    emoji: "🎨",
    cardClass: "border-red-300 bg-linear-to-br from-red-100 to-red-200",
    titleClass: "text-red-800",
    descClass: "text-red-700/80",
    arrowClass: "text-red-500",
  },
  {
    to: "/game/colors/matching",
    labelKey: "colors.modes.matching",
    descriptionKey: "colors.modes.matchingDescription",
    emoji: "🎴",
    cardClass: "border-blue-300 bg-linear-to-br from-blue-100 to-blue-200",
    titleClass: "text-blue-800",
    descClass: "text-blue-700/80",
    arrowClass: "text-blue-500",
  },
  {
    to: "/game/colors/coloring",
    labelKey: "colors.modes.coloring",
    descriptionKey: "colors.modes.coloringDescription",
    emoji: "🖌️",
    cardClass: "border-green-300 bg-linear-to-br from-green-100 to-green-200",
    titleClass: "text-green-800",
    descClass: "text-green-700/80",
    arrowClass: "text-green-500",
  },
  {
    to: "/game/colors/sort",
    labelKey: "colors.modes.sort",
    descriptionKey: "colors.modes.sortDescription",
    emoji: "🧺",
    cardClass: "border-orange-300 bg-linear-to-br from-orange-100 to-orange-200",
    titleClass: "text-orange-800",
    descClass: "text-orange-700/80",
    arrowClass: "text-orange-500",
  },
];

export default function ColorsGameHubPage() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <header className="mb-4 text-center sm:mb-5 lg:mb-8">
        <h1 className="text-2xl font-bold text-purple-800 sm:text-3xl lg:text-4xl">
          {t("header.titles.colors")}
        </h1>
        <p className="mt-1 text-sm text-purple-600 sm:text-base lg:text-lg">{t("game.subtitle")}</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
        {COLORS_MODES.map(mode => (
          <Link key={mode.to} to={mode.to} className="block">
            <Card
              className={`flex h-full cursor-pointer flex-col items-center justify-center gap-2 border-4 p-4 text-center shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 motion-reduce:transition-none sm:gap-3 sm:p-5 lg:p-6 ${mode.cardClass}`}
            >
              <div className="text-5xl sm:text-6xl lg:text-7xl" aria-hidden="true">
                {mode.emoji}
              </div>
              <div>
                <h2 className={`text-lg font-bold sm:text-xl lg:text-2xl ${mode.titleClass}`}>
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
