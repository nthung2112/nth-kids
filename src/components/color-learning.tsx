import { useState } from "react";

import { ChevronLeft, ChevronRight, Volume2, X } from "lucide-react";
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
    <div className="mx-auto w-full max-w-6xl">
      {selectedId && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <Card className="relative w-full max-w-md p-6 text-center sm:p-8">
            <button
              type="button"
              onClick={resetSelection}
              className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 shadow-sm hover:bg-gray-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-purple-400"
              aria-label={t("common.close")}
            >
              <X className="h-5 w-5" />
            </button>

            {showCelebration && (
              <div className="pointer-events-none absolute -top-4 -right-4 -bottom-4 -left-4">
                <div className="animate-bounce text-6xl motion-reduce:animate-none">🎨</div>
                <div className="absolute top-4 right-4 animate-spin text-4xl motion-reduce:animate-none">
                  🌈
                </div>
                <div className="absolute bottom-4 left-4 animate-pulse text-4xl motion-reduce:animate-none">
                  ✨
                </div>
              </div>
            )}

            <div
              className={`mx-auto mb-3 h-24 w-24 rounded-full border-8 ${selected.borderClass} shadow-lg sm:h-28 sm:w-28`}
              style={{ backgroundColor: selected.hex }}
            />

            <div className="mb-2 text-3xl font-bold text-gray-800 sm:text-4xl">
              {t(`data.colors.${selectedId}.name`)}
            </div>

            <div className="mb-3 text-sm text-gray-600 sm:text-base">
              {t(`data.colors.${selectedId}.description`)}
            </div>

            <div className="mb-4">
              <div className="mb-1 text-sm font-semibold text-gray-700">
                {t("colors.learning.exampleLabel")}
              </div>
              <div className="flex justify-center gap-2">
                {selected.examples.map((example, index) => (
                  <span
                    key={`${selectedId}-ex-${index}-${example}`}
                    className="animate-bounce text-3xl motion-reduce:animate-none sm:text-4xl"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                onClick={() => stepColor(-1)}
                className="h-14 w-14 rounded-full bg-blue-500 p-0 text-white shadow-md hover:bg-blue-600"
                aria-label={t("colors.learning.prev")}
                title={t("colors.learning.prev")}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  playColorSound(selectedId);
                }}
                className="h-16 w-16 rounded-full bg-green-500 p-0 text-white shadow-lg hover:bg-green-600"
                aria-label={t("common.listen")}
                title={t("common.listen")}
              >
                <Volume2 className="h-7 w-7" />
              </Button>

              <Button
                onClick={() => stepColor(1)}
                className="h-14 w-14 rounded-full bg-blue-500 p-0 text-white shadow-md hover:bg-blue-600"
                aria-label={t("colors.learning.next")}
                title={t("colors.learning.next")}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
        {COLOR_LEARNING_IDS.map(id => {
          const color = COLOR_DEFS[id];
          return (
            <Card
              key={id}
              role="button"
              tabIndex={0}
              aria-label={t(`data.colors.${id}.name`)}
              className={`${color.lightBgClass} border-4 ${color.borderClass} transform cursor-pointer p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 motion-reduce:transition-none sm:p-5`}
              onClick={() => handleColorClick(id)}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleColorClick(id);
                }
              }}
            >
              <div
                className={`mx-auto mb-2 h-16 w-16 rounded-full border-4 ${color.borderClass} shadow-lg sm:mb-3 sm:h-20 sm:w-20`}
                style={{ backgroundColor: color.hex }}
              />

              <div className="mb-1 text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">
                {t(`data.colors.${id}.name`)}
              </div>

              <div className="flex justify-center gap-1">
                {color.examples.slice(0, 3).map((example, index) => (
                  <span key={`${id}-preview-${index}`} className="text-lg sm:text-xl">
                    {example}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-white/80 p-3 text-center text-purple-600 shadow-sm">
        <div className="mb-1 flex items-center justify-center gap-2">
          <span>🎨</span>
          <span className="font-semibold">{t("colors.learning.instructionsTitle")}</span>
          <span>🎨</span>
        </div>
        <div className="text-xs text-purple-500 sm:text-sm">
          {t("colors.learning.instructionsSubtitle")}
        </div>
      </div>
    </div>
  );
}
