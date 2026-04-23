import { useState } from "react";

import { ChevronLeft, ChevronRight, Volume2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ALPHABET } from "@/data/alphabet";
import { useTts } from "@/hooks/useTts";

export default function AlphabetLearning() {
  const { t } = useTranslation();
  const tts = useTts();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const speakLetterWord = (letter: string) => {
    if (!tts.canSpeakInstantly) return;
    // Speak the word the picture represents (e.g., "Apple") so the kid
    // associates the letter with a familiar sound.
    tts.speak(t(`data.alphabet.${letter}.word`));
  };

  const handleLetterClick = (letter: string) => {
    speakLetterWord(letter);
    setSelectedLetter(letter);
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

  return (
    <div className="mx-auto w-full max-w-7xl">
      {selectedLetter && selectedLetterData && (
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

            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="text-7xl font-bold text-purple-800 sm:text-8xl">{selectedLetter}</div>
              <div className="text-5xl font-bold text-purple-600 sm:text-6xl">
                {selectedLetter.toLowerCase()}
              </div>
            </div>

            <div className="mb-3 text-5xl sm:text-6xl" aria-hidden="true">
              {selectedLetterData.emoji}
            </div>

            <div className="mb-4 text-xl font-bold text-purple-600 sm:text-2xl">
              {t(`data.alphabet.${selectedLetter}.word`)}
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                onClick={() => stepLetter(-1)}
                className="h-14 w-14 rounded-full bg-blue-500 p-0 text-white shadow-md hover:bg-blue-600"
                aria-label={t("letters.learning.prev")}
                title={t("letters.learning.prev")}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                onClick={() => {
                  speakLetterWord(selectedLetter);
                }}
                className="h-16 w-16 rounded-full bg-green-500 p-0 text-white shadow-lg hover:bg-green-600"
                aria-label={t("common.listen")}
                title={t("common.listen")}
              >
                <Volume2 className="h-7 w-7" />
              </Button>

              <Button
                onClick={() => stepLetter(1)}
                className="h-14 w-14 rounded-full bg-blue-500 p-0 text-white shadow-md hover:bg-blue-600"
                aria-label={t("letters.learning.next")}
                title={t("letters.learning.next")}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 @sm:grid-cols-4 @sm:gap-3 @md:grid-cols-6 @lg:grid-cols-7">
        {ALPHABET.map(item => (
          <Card
            key={item.letter}
            role="button"
            tabIndex={0}
            aria-label={item.letter}
            className={`${item.color} transform cursor-pointer border-4 p-3 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 motion-reduce:transition-none sm:p-4`}
            onClick={() => handleLetterClick(item.letter)}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleLetterClick(item.letter);
              }
            }}
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1">
                <div className="text-3xl font-bold text-gray-800 sm:text-4xl md:text-5xl">
                  {item.letter}
                </div>
                <div className="text-xl font-bold text-gray-600 sm:text-2xl md:text-3xl">
                  {item.letter.toLowerCase()}
                </div>
              </div>

              <div className="text-2xl sm:text-3xl md:text-4xl" aria-hidden="true">
                {item.emoji}
              </div>

              <div className="text-center text-[11px] leading-tight font-semibold text-gray-700 sm:text-sm md:text-base">
                {t(`data.alphabet.${item.letter}.vietnamese`)}
              </div>
            </div>
          </Card>
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
    </div>
  );
}
