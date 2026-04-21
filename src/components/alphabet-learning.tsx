import { useState } from "react";

import { ChevronLeft, ChevronRight, RotateCcw, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ALPHABET } from "@/data/alphabet";
import { useSound } from "@/hooks/useSound";

export default function AlphabetLearning() {
  const { t } = useTranslation();
  const { playClickSound, playLetterSound } = useSound();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleLetterClick = (letter: string) => {
    playClickSound();
    playLetterSound(letter);
    setSelectedLetter(letter);
    setShowCelebration(true);

    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
  };

  const resetSelection = () => {
    setSelectedLetter(null);
    setShowCelebration(false);
  };

  const stepLetter = (delta: number) => {
    if (!selectedLetter) return;
    const idx = ALPHABET.findIndex(item => item.letter === selectedLetter);
    const next = (idx + delta + ALPHABET.length) % ALPHABET.length;
    handleLetterClick(ALPHABET[next].letter);
  };

  const selectedLetterData = ALPHABET.find(item => item.letter === selectedLetter);

  return (
    <div className="mx-auto max-w-7xl">
      {selectedLetter && selectedLetterData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="relative mx-4 max-w-lg p-8 text-center">
            {showCelebration && (
              <div className="pointer-events-none absolute -top-4 -right-4 -bottom-4 -left-4">
                <div className="animate-bounce text-6xl">🎉</div>
                <div className="absolute top-4 right-4 animate-spin text-4xl">⭐</div>
                <div className="absolute bottom-4 left-4 animate-pulse text-4xl">🎊</div>
              </div>
            )}

            <div className="mb-4 flex items-center justify-center gap-4">
              <div className="text-8xl font-bold text-purple-800">{selectedLetter}</div>
              <div className="text-6xl font-bold text-purple-600">
                {selectedLetter.toLowerCase()}
              </div>
            </div>

            <div className="mb-4 text-6xl">{selectedLetterData.emoji}</div>

            <div className="mb-2 text-2xl font-bold text-purple-600">
              {t(`data.alphabet.${selectedLetter}.word`)}
            </div>

            <div className="mb-6 text-xl text-purple-500">
              {t(`data.alphabet.${selectedLetter}.vietnamese`)}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => stepLetter(-1)}
                className="bg-blue-500 px-4 py-3 text-base text-white hover:bg-blue-600"
                aria-label={t("letters.learning.prev")}
              >
                <ChevronLeft className="mr-1" />
                {t("letters.learning.prev")}
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  playLetterSound(selectedLetter);
                }}
                className="bg-green-500 px-6 py-3 text-base text-white hover:bg-green-600"
              >
                <Volume2 className="mr-2" />
                {t("common.listen")}
              </Button>

              <Button
                onClick={() => stepLetter(1)}
                className="bg-blue-500 px-4 py-3 text-base text-white hover:bg-blue-600"
                aria-label={t("letters.learning.next")}
              >
                {t("letters.learning.next")}
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

      {/* Alphabet grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
        {ALPHABET.map(item => (
          <Card
            key={item.letter}
            className={`${item.color} transform cursor-pointer border-4 p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95`}
            onClick={() => handleLetterClick(item.letter)}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="text-4xl font-bold text-gray-800 md:text-5xl">{item.letter}</div>
                <div className="text-2xl font-bold text-gray-600 md:text-3xl">
                  {item.letter.toLowerCase()}
                </div>
              </div>

              <div className="text-3xl md:text-4xl">{item.emoji}</div>

              <div className="text-center text-sm leading-tight font-semibold text-gray-700 md:text-base">
                {t(`data.alphabet.${item.letter}.vietnamese`)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-8 rounded-2xl bg-white p-4 text-center text-lg text-purple-600 shadow-lg">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span>{t("common.touch")}</span>
          <span className="font-semibold">{t("letters.learning.instructionsTitle")}</span>
          <span>{t("common.touch")}</span>
        </div>
        <div className="text-sm text-purple-500">{t("letters.learning.instructionsSubtitle")}</div>
      </div>
    </div>
  );
}
