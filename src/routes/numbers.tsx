import { useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, RotateCcw, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import CountingGame from "@/components/counting-game";
import PageLayout from "@/components/layout/page-layout";
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

export const Route = createFileRoute("/numbers")({
  component: NumbersPage,
});

function NumbersPage() {
  const { t, i18n } = useTranslation();
  const { playClickSound, playNumberSound } = useSound();
  const { prefs } = usePreferences();
  const maxNumber = prefs.maxNumber;
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [numbers, setNumbers] = useState<NumberData[]>([]);

  useEffect(() => {
    setNumbers(generateNumberData(maxNumber, i18n.language));
  }, [maxNumber, i18n.language]);

  useEffect(() => {
    preloadSpriteTopic("numbers");
  }, []);

  const handleNumberClick = (num: number) => {
    playClickSound();
    playNumberSound(num);
    setSelectedNumber(num);
    setShowCelebration(true);

    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
  };

  const resetSelection = () => {
    setSelectedNumber(null);
    setShowCelebration(false);
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

  return (
    <PageLayout>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4 sm:gap-3">
        <Button
          onClick={() => {
            playClickSound();
            setShowGame(!showGame);
          }}
          className="h-11 rounded-full bg-linear-to-r from-pink-500 to-purple-600 px-4 text-sm font-semibold text-white shadow-md hover:from-pink-600 hover:to-purple-700 sm:h-11 sm:px-5 sm:text-base"
        >
          {showGame ? t("common.playLesson") : t("common.playGame")}
        </Button>

        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-purple-700 shadow-sm sm:text-sm">
          {t("numbers.rangeLabel", { range: `1 - ${maxNumber}`, level: t(levelKey) })}
        </span>
      </div>

      {selectedNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="relative mx-4 max-w-md p-8 text-center">
            {showCelebration && (
              <div className="pointer-events-none absolute -top-4 -right-4 -bottom-4 -left-4">
                <div className="animate-bounce text-6xl motion-reduce:animate-none">🎉</div>
                <div className="absolute top-4 right-4 animate-spin text-4xl motion-reduce:animate-none">
                  ⭐
                </div>
                <div className="absolute bottom-4 left-4 animate-pulse text-4xl motion-reduce:animate-none">
                  🎊
                </div>
              </div>
            )}

            <div className="mb-4 text-8xl font-bold text-purple-800">{selectedNumber}</div>

            <div className="mb-4 text-3xl font-bold text-purple-600">
              {getNumberName(selectedNumber, i18n.language)}
            </div>

            <div className="mb-6 flex flex-wrap justify-center gap-2">
              <div className="text-center">
                <div className="mb-2 text-6xl">
                  {numbers.find(n => n.number === selectedNumber)?.emoji}
                </div>
                <div className="text-lg text-purple-600">
                  {selectedNumber} {numbers.find(n => n.number === selectedNumber)?.emoji}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => stepNumber(-1)}
                className="bg-blue-500 px-4 py-3 text-base text-white hover:bg-blue-600"
                aria-label={t("numbers.learning.prev")}
              >
                <ChevronLeft className="mr-1" />
                {t("numbers.learning.prev")}
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  playNumberSound(selectedNumber);
                }}
                className="bg-green-500 px-6 py-3 text-base text-white hover:bg-green-600"
              >
                <Volume2 className="mr-2" />
                {t("common.listen")}
              </Button>

              <Button
                onClick={() => stepNumber(1)}
                className="bg-blue-500 px-4 py-3 text-base text-white hover:bg-blue-600"
                aria-label={t("numbers.learning.next")}
              >
                {t("numbers.learning.next")}
                <ChevronRight className="ml-1" />
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  resetSelection();
                }}
                className="bg-purple-500 px-6 py-3 text-base text-white hover:bg-purple-600"
              >
                <RotateCcw className="mr-2" />
                {t("common.close")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {!showGame ? (
        <div className={`grid ${displayInfo.gridCols} mx-auto max-w-7xl gap-3`}>
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
              <div className={`${displayInfo.numberSize} mb-2 font-bold text-gray-800`}>
                {item.number}
              </div>
              <div className="mb-2 text-lg leading-tight font-bold text-gray-700 md:text-xl">
                {item.name}
              </div>
              <div className={`${displayInfo.emojiSize} mb-2`} aria-hidden="true">
                {item.emoji}
              </div>

              {item.number <= 10 && displayInfo.showAllItems && (
                <div className="flex flex-wrap justify-center gap-1" aria-hidden="true">
                  {item.items.slice(0, Math.min(5, item.items.length)).map((emoji, index) => (
                    <span key={`${item.number}-grid-${index}-${emoji}`} className="text-sm">
                      {emoji}
                    </span>
                  ))}
                  {item.items.length > 5 && <span className="text-xs text-gray-600">...</span>}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <CountingGame maxNumber={maxNumber} />
      )}
    </PageLayout>
  );
}
