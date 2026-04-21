import { useState } from "react";

import { ChevronLeft, ChevronRight, RotateCcw, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COLOR_DEFS, COLOR_LEARNING_IDS, type ColorId } from "@/data/colors";
import { useSound } from "@/hooks/useSound";

export default function ColorLearning() {
  const { t } = useTranslation();
  const { playClickSound, playColorSound } = useSound();
  const [selectedId, setSelectedId] = useState<ColorId | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleColorClick = (id: ColorId) => {
    playClickSound();
    playColorSound(id);
    setSelectedId(id);
    setShowCelebration(true);

    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
  };

  const resetSelection = () => {
    setSelectedId(null);
    setShowCelebration(false);
  };

  const stepColor = (delta: number) => {
    if (!selectedId) return;
    const idx = COLOR_LEARNING_IDS.indexOf(selectedId);
    const next = (idx + delta + COLOR_LEARNING_IDS.length) % COLOR_LEARNING_IDS.length;
    handleColorClick(COLOR_LEARNING_IDS[next]);
  };

  const selected = selectedId ? COLOR_DEFS[selectedId] : null;

  return (
    <div className="mx-auto max-w-6xl">
      {selectedId && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="relative mx-4 max-w-lg p-8 text-center">
            {showCelebration && (
              <div className="pointer-events-none absolute -top-4 -right-4 -bottom-4 -left-4">
                <div className="animate-bounce text-6xl">🎨</div>
                <div className="absolute top-4 right-4 animate-spin text-4xl">🌈</div>
                <div className="absolute bottom-4 left-4 animate-pulse text-4xl">✨</div>
              </div>
            )}

            <div
              className={`mx-auto mb-4 h-32 w-32 rounded-full border-8 ${selected.borderClass} shadow-lg`}
              style={{ backgroundColor: selected.hex }}
            />

            <div className="mb-2 text-4xl font-bold text-gray-800">
              {t(`data.colors.${selectedId}.name`)}
            </div>
            <div className="mb-4 text-2xl text-gray-600">
              {t(`data.colors.${selectedId}.english`)}
            </div>

            <div className="mb-4 text-6xl">{selected.emoji}</div>

            <div className="mb-4 text-lg text-gray-600">
              {t(`data.colors.${selectedId}.description`)}
            </div>

            <div className="mb-6">
              <div className="mb-2 text-lg font-semibold text-gray-700">
                {t("colors.learning.exampleLabel")}
              </div>
              <div className="flex justify-center gap-3">
                {selected.examples.map((example, index) => (
                  <span
                    key={`${selectedId}-ex-${index}-${example}`}
                    className="animate-bounce text-4xl"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => stepColor(-1)}
                className="bg-blue-500 px-4 py-3 text-base text-white hover:bg-blue-600"
                aria-label={t("colors.learning.prev")}
              >
                <ChevronLeft className="mr-1" />
                {t("colors.learning.prev")}
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  playColorSound(selectedId);
                }}
                className="bg-green-500 px-6 py-3 text-base text-white hover:bg-green-600"
              >
                <Volume2 className="mr-2" />
                {t("common.listen")}
              </Button>

              <Button
                onClick={() => stepColor(1)}
                className="bg-blue-500 px-4 py-3 text-base text-white hover:bg-blue-600"
                aria-label={t("colors.learning.next")}
              >
                {t("colors.learning.next")}
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

      {/* Color grid */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {COLOR_LEARNING_IDS.map(id => {
          const color = COLOR_DEFS[id];
          return (
            <Card
              key={id}
              className={`${color.lightBgClass} border-4 ${color.borderClass} transform cursor-pointer p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95`}
              onClick={() => handleColorClick(id)}
            >
              <div
                className={`mx-auto mb-4 h-24 w-24 rounded-full border-4 ${color.borderClass} shadow-lg`}
                style={{ backgroundColor: color.hex }}
              />

              <div className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl">
                {t(`data.colors.${id}.name`)}
              </div>
              <div className="mb-3 text-lg text-gray-600">{t(`data.colors.${id}.english`)}</div>

              <div className="mb-3 text-4xl md:text-5xl">{color.emoji}</div>

              <div className="flex justify-center gap-1">
                {color.examples.slice(0, 3).map((example, index) => (
                  <span key={`${id}-preview-${index}`} className="text-2xl">
                    {example}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-8 rounded-2xl bg-white p-4 text-center text-lg text-purple-600 shadow-lg">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span>🎨</span>
          <span className="font-semibold">{t("colors.learning.instructionsTitle")}</span>
          <span>🎨</span>
        </div>
        <div className="text-sm text-purple-500">{t("colors.learning.instructionsSubtitle")}</div>
      </div>
    </div>
  );
}
