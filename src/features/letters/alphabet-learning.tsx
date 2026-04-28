import { useState } from "react";

import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StickerReveal } from "@/components/rewards";
import { ToyButton, ToyDetailCard } from "@/components/toys";
import { ALPHABET } from "@/data/alphabet";
import { getTopicVisual } from "@/data/topics";
import { useLearningActivityProgress } from "@/hooks/useLearningActivityProgress";
import { useSound } from "@/hooks/useSound";

export default function AlphabetLearning() {
  const { t } = useTranslation();
  const { playLetterSound } = useSound();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const { markInteraction, latestUnlock, latestSticker } = useLearningActivityProgress({
    activityId: "learn:letters",
    threshold: 3,
  });

  const speakLetterWord = (letter: string) => {
    playLetterSound(letter);
  };

  const handleLetterClick = (letter: string) => {
    speakLetterWord(letter);
    setSelectedLetter(letter);
    markInteraction(letter);
  };

  const resetSelection = () => {
    setSelectedLetter(null);
  };

  const stepLetter = (delta: number) => {
    if (!selectedLetter) return;
    const idx = ALPHABET.findIndex(item => item.letter === selectedLetter);
    const next = (idx + delta + ALPHABET.length) % ALPHABET.length;
    handleLetterClick(ALPHABET[next].letter);
  };

  const selectedLetterData = ALPHABET.find(item => item.letter === selectedLetter);
  const visual = getTopicVisual("letters");

  return (
    <div className="mx-auto w-full max-w-7xl">
      {selectedLetter && selectedLetterData && (
        <ToyDetailCard
          onClose={resetSelection}
          title={t(`data.alphabet.${selectedLetter}.word`)}
          palette={visual.palette}
          visual={
            <div className="relative flex aspect-square w-full items-center justify-center rounded-[2rem] border-4 border-emerald-300 bg-emerald-100 shadow-lg">
              <div className="absolute inset-6 rounded-[1.5rem] border-4 border-emerald-300 bg-white shadow-inner" />
              <div className="relative flex items-end gap-3 drop-shadow-sm">
                <span className="text-7xl font-black text-emerald-900 sm:text-8xl">
                  {selectedLetter}
                </span>
                <span className="text-5xl font-black text-emerald-700 sm:text-6xl">
                  {selectedLetter.toLowerCase()}
                </span>
              </div>
            </div>
          }
          controls={
            <>
              <ToyButton
                tone="secondary"
                onClick={() => stepLetter(-1)}
                aria-label={t("letters.learning.prev")}
                title={t("letters.learning.prev")}
                className="h-14 w-14 rounded-full px-0 py-0"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </ToyButton>

              <ToyButton
                tone="primary"
                onClick={() => speakLetterWord(selectedLetter)}
                aria-label={t("common.listen")}
                title={t("common.listen")}
                className="h-16 w-16 rounded-full px-0 py-0"
              >
                <Volume2 className="h-7 w-7" aria-hidden="true" />
              </ToyButton>

              <ToyButton
                tone="secondary"
                onClick={() => stepLetter(1)}
                aria-label={t("letters.learning.next")}
                title={t("letters.learning.next")}
                className="h-14 w-14 rounded-full px-0 py-0"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </ToyButton>
            </>
          }
        >
          <div className="text-xl font-bold text-emerald-700 sm:text-2xl">
            {t(`data.alphabet.${selectedLetter}.vietnamese`)}
          </div>
        </ToyDetailCard>
      )}

      <div className="grid grid-cols-3 gap-2 @sm:grid-cols-4 @sm:gap-3 @md:grid-cols-6 @lg:grid-cols-7">
        {ALPHABET.map(item => (
          <button
            type="button"
            key={item.letter}
            aria-label={item.letter}
            onClick={() => handleLetterClick(item.letter)}
            className="min-h-28 rounded-[2rem] border-4 border-emerald-300 bg-white/90 p-3 text-center shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-emerald-300 focus-visible:outline-hidden active:translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 sm:p-4"
          >
            <div className="flex items-end justify-center gap-1">
              <span className="text-3xl font-black text-emerald-900 sm:text-4xl md:text-5xl">
                {item.letter}
              </span>
              <span className="text-xl font-black text-emerald-700 sm:text-2xl md:text-3xl">
                {item.letter.toLowerCase()}
              </span>
            </div>
            <div className="mt-1 text-[11px] leading-tight font-bold text-emerald-700 sm:text-sm md:text-base">
              {t(`data.alphabet.${item.letter}.vietnamese`)}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-white/80 p-3 text-center text-purple-600 shadow-sm">
        <div className="mb-1 flex items-center justify-center gap-2">
          <span>{t("common.touch")}</span>
          <span className="font-semibold">{t("letters.learning.instructionsTitle")}</span>
          <span>{t("common.touch")}</span>
        </div>
        <div className="text-xs text-purple-500 sm:text-sm">
          {t("letters.learning.instructionsSubtitle")}
        </div>
      </div>

      {latestUnlock && latestSticker && (
        <StickerReveal unlock={latestUnlock} sticker={latestSticker} className="mt-4" />
      )}
    </div>
  );
}
