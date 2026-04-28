import { useEffect, useState } from "react";

import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StickerReveal } from "@/components/rewards";
import { ToyButton, ToyDetailCard } from "@/components/toys";
import { getTopicVisual } from "@/data/topics";
import {
  generateNumberData,
  getNumberDisplayInfo,
  getNumberName,
  type NumberData,
} from "@/features/numbers/number-generator";
import { useLearningActivityProgress } from "@/hooks/useLearningActivityProgress";
import { usePreferences } from "@/hooks/usePreferences";
import { useSound } from "@/hooks/useSound";

export default function NumbersLearning() {
  const { t, i18n } = useTranslation();
  const { prefs } = usePreferences();
  const { playNumberSound } = useSound();
  const maxNumber = prefs.maxNumber;
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [numbers, setNumbers] = useState<NumberData[]>([]);
  const { markInteraction, latestUnlock, latestSticker } = useLearningActivityProgress({
    activityId: "learn:numbers",
    threshold: 3,
  });

  useEffect(() => {
    setNumbers(generateNumberData(maxNumber, i18n.language));
  }, [maxNumber, i18n.language]);

  const speakNumberName = (num: number) => {
    playNumberSound(num);
  };

  const handleNumberClick = (num: number) => {
    speakNumberName(num);
    setSelectedNumber(num);
    markInteraction(String(num));
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

  const visual = getTopicVisual("numbers");

  return (
    <>
      <div className="mb-3 flex items-center justify-center">
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-purple-700 shadow-sm sm:text-sm">
          {t("numbers.rangeLabel", { range: `1 - ${maxNumber}`, level: t(levelKey) })}
        </span>
      </div>

      {selectedNumber !== null && (
        <ToyDetailCard
          onClose={resetSelection}
          title={getNumberName(selectedNumber, i18n.language)}
          palette={visual.palette}
          visual={
            <div className="relative flex aspect-square w-full items-center justify-center rounded-[2rem] border-4 border-sky-300 bg-sky-100 shadow-lg">
              <div className="absolute inset-6 rounded-[1.5rem] border-4 border-sky-300 bg-white shadow-inner" />
              <div className="relative text-8xl font-black text-sky-900 drop-shadow-sm">
                {selectedNumber}
              </div>
            </div>
          }
          controls={
            <>
              <ToyButton
                tone="secondary"
                onClick={() => stepNumber(-1)}
                aria-label={t("numbers.learning.prev")}
                title={t("numbers.learning.prev")}
                className="h-14 w-14 rounded-full px-0 py-0"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </ToyButton>

              <ToyButton
                tone="primary"
                onClick={() => speakNumberName(selectedNumber)}
                aria-label={t("common.listen")}
                title={t("common.listen")}
                className="h-16 w-16 rounded-full px-0 py-0"
              >
                <Volume2 className="h-7 w-7" aria-hidden="true" />
              </ToyButton>

              <ToyButton
                tone="secondary"
                onClick={() => stepNumber(1)}
                aria-label={t("numbers.learning.next")}
                title={t("numbers.learning.next")}
                className="h-14 w-14 rounded-full px-0 py-0"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </ToyButton>
            </>
          }
        />
      )}

      <div className={`grid ${displayInfo.gridCols} mx-auto w-full max-w-7xl gap-2 @sm:gap-3`}>
        {numbers.map(item => (
          <button
            type="button"
            key={item.number}
            aria-label={getNumberName(item.number, i18n.language)}
            onClick={() => handleNumberClick(item.number)}
            className="min-h-24 rounded-[2rem] border-4 border-sky-300 bg-white/90 p-3 text-center shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-hidden active:translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0"
          >
            <div className="text-4xl font-black text-sky-900 sm:text-5xl">{item.number}</div>
            <div className="mt-1 text-sm font-bold text-sky-700">{item.name}</div>
          </button>
        ))}
      </div>

      {latestUnlock && latestSticker && (
        <StickerReveal unlock={latestUnlock} sticker={latestSticker} className="mt-4" />
      )}
    </>
  );
}
