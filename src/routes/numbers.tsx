import { useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Volume2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import CountingGame from "@/components/counting-game";
import ImmersiveView from "@/components/layout/immersive-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePreferences } from "@/hooks/usePreferences";
import { useSound } from "@/hooks/useSound";
import { preloadSpriteTopic } from "@/lib/audio-sprite-player";
import {
  generateNumberData,
  getNumberDisplayInfo,
  getNumberName,
  type NumberData,
} from "@/utils/numberGenerator";

import { validateTopicSearch } from "./-topic-search";

export const Route = createFileRoute("/numbers")({
  component: NumbersPage,
  validateSearch: validateTopicSearch,
});

function NumbersPage() {
  const { t, i18n } = useTranslation();
  const { prefs } = usePreferences();
  const { playNumberSound } = useSound();
  const { mode } = Route.useSearch();
  const maxNumber = prefs.maxNumber;
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [numbers, setNumbers] = useState<NumberData[]>([]);

  useEffect(() => {
    setNumbers(generateNumberData(maxNumber, i18n.language));
  }, [maxNumber, i18n.language]);

  useEffect(() => {
    preloadSpriteTopic("numbers");
  }, []);

  const speakNumberName = (num: number) => {
    playNumberSound(num);
  };

  const handleNumberClick = (num: number) => {
    speakNumberName(num);
    setSelectedNumber(num);
  };

  const resetSelection = () => {
    setSelectedNumber(null);
  };

  const stepNumber = (delta: number) => {
    if (selectedNumber === null) return;
    const next = ((selectedNumber - 1 + delta + maxNumber) % maxNumber) + 1;
    handleNumberClick(next);
  };

  const displayInfo = getNumberDisplayInfo(maxNumber);
  const levelKey =
    maxNumber <= 10
      ? "numbers.levels.basic"
      : maxNumber <= 30
        ? "numbers.levels.intermediate"
        : "numbers.levels.hard";
  const exitTo = mode === "game" ? "/game" : "/learn";

  return (
    <ImmersiveView exitTo={exitTo}>
      {mode === "learn" ? (
        <>
          <div className="mb-3 flex items-center justify-center">
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-purple-700 shadow-sm sm:text-sm">
              {t("numbers.rangeLabel", { range: `1 - ${maxNumber}`, level: t(levelKey) })}
            </span>
          </div>

          {selectedNumber !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              role="dialog"
              aria-modal="true"
            >
              <Card className="relative w-full max-w-md p-6 text-center sm:p-8">
                <button
                  type="button"
                  onClick={resetSelection}
                  className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 shadow-sm hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-hidden"
                  aria-label={t("common.close")}
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="mb-2 text-7xl font-bold text-purple-800 sm:text-8xl">
                  {selectedNumber}
                </div>

                <div className="mb-3 text-2xl font-bold text-purple-600 sm:text-3xl">
                  {getNumberName(selectedNumber, i18n.language)}
                </div>

                <div className="mb-4 text-5xl sm:text-6xl" aria-hidden="true">
                  {numbers.find(n => n.number === selectedNumber)?.emoji}
                </div>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <Button
                    onClick={() => stepNumber(-1)}
                    className="h-14 w-14 rounded-full bg-blue-500 p-0 text-white shadow-md hover:bg-blue-600"
                    aria-label={t("numbers.learning.prev")}
                    title={t("numbers.learning.prev")}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  <Button
                    onClick={() => {
                      speakNumberName(selectedNumber);
                    }}
                    className="h-16 w-16 rounded-full bg-green-500 p-0 text-white shadow-lg hover:bg-green-600"
                    aria-label={t("common.listen")}
                    title={t("common.listen")}
                  >
                    <Volume2 className="h-7 w-7" />
                  </Button>

                  <Button
                    onClick={() => stepNumber(1)}
                    className="h-14 w-14 rounded-full bg-blue-500 p-0 text-white shadow-md hover:bg-blue-600"
                    aria-label={t("numbers.learning.next")}
                    title={t("numbers.learning.next")}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          <div className={`grid ${displayInfo.gridCols} mx-auto w-full max-w-7xl gap-2 @sm:gap-3`}>
            {numbers.map(item => (
              <Card
                key={item.number}
                role="button"
                tabIndex={0}
                aria-label={getNumberName(item.number, i18n.language)}
                className={`${item.color} transform cursor-pointer border-4 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 motion-reduce:transition-none ${displayInfo.cardSize} text-center`}
                onClick={() => handleNumberClick(item.number)}
                onKeyDown={event => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleNumberClick(item.number);
                  }
                }}
              >
                <div className={`${displayInfo.numberSize} mb-1 font-bold text-gray-800`}>
                  {item.number}
                </div>
                <div className="mb-1 text-sm leading-tight font-bold text-gray-700 sm:text-base">
                  {item.name}
                </div>
                <div className={`${displayInfo.emojiSize} mb-1`} aria-hidden="true">
                  {item.emoji}
                </div>

                {item.number <= 10 && displayInfo.showAllItems && (
                  <div className="flex flex-wrap justify-center gap-0.5" aria-hidden="true">
                    {item.items.slice(0, Math.min(5, item.items.length)).map((emoji, index) => (
                      <span key={`${item.number}-grid-${index}-${emoji}`} className="text-xs">
                        {emoji}
                      </span>
                    ))}
                    {item.items.length > 5 && <span className="text-xs text-gray-600">...</span>}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      ) : (
        <CountingGame maxNumber={maxNumber} />
      )}
    </ImmersiveView>
  );
}
