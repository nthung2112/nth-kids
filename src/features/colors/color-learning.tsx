import { useState } from "react";

import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StickerReveal } from "@/components/rewards";
import { ToyButton, ToyDetailCard } from "@/components/toys";
import { COLOR_DEFS, COLOR_LEARNING_IDS, type ColorId } from "@/data/colors";
import { getTopicVisual } from "@/data/topics";
import { useLearningActivityProgress } from "@/hooks/useLearningActivityProgress";
import { useSound } from "@/hooks/useSound";

export default function ColorLearning() {
  const { t } = useTranslation();
  const { playColorSound } = useSound();
  const [selectedId, setSelectedId] = useState<ColorId | null>(null);
  const { markInteraction, latestUnlock, latestSticker } = useLearningActivityProgress({
    activityId: "learn:colors",
    threshold: 3,
  });

  const speakLocalisedName = (id: ColorId) => {
    playColorSound(id);
  };

  const handleColorClick = (id: ColorId) => {
    speakLocalisedName(id);
    setSelectedId(id);
    markInteraction(id);
  };

  const resetSelection = () => {
    setSelectedId(null);
  };

  const stepColor = (delta: number) => {
    if (!selectedId) return;
    const idx = COLOR_LEARNING_IDS.indexOf(selectedId);
    const next = (idx + delta + COLOR_LEARNING_IDS.length) % COLOR_LEARNING_IDS.length;
    handleColorClick(COLOR_LEARNING_IDS[next]);
  };

  const selected = selectedId ? COLOR_DEFS[selectedId] : null;
  const visual = getTopicVisual("colors");

  return (
    <div className="mx-auto w-full max-w-6xl">
      {selectedId && selected && (
        <ToyDetailCard
          onClose={resetSelection}
          title={t(`data.colors.${selectedId}.name`)}
          palette={visual.palette}
          visual={
            <div className="relative flex aspect-square w-full items-center justify-center rounded-[2rem] border-4 border-pink-300 bg-pink-100 shadow-lg">
              <div
                className={`h-36 w-36 rounded-full border-8 ${selected.borderClass} shadow-lg sm:h-40 sm:w-40`}
                style={{ backgroundColor: selected.hex }}
                aria-hidden="true"
              />
            </div>
          }
          controls={
            <>
              <ToyButton
                tone="secondary"
                onClick={() => stepColor(-1)}
                aria-label={t("colors.learning.prev")}
                title={t("colors.learning.prev")}
                className="h-14 w-14 rounded-full px-0 py-0"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </ToyButton>

              <ToyButton
                tone="primary"
                onClick={() => speakLocalisedName(selectedId)}
                aria-label={t("common.listen")}
                title={t("common.listen")}
                className="h-16 w-16 rounded-full px-0 py-0"
              >
                <Volume2 className="h-7 w-7" aria-hidden="true" />
              </ToyButton>

              <ToyButton
                tone="secondary"
                onClick={() => stepColor(1)}
                aria-label={t("colors.learning.next")}
                title={t("colors.learning.next")}
                className="h-14 w-14 rounded-full px-0 py-0"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </ToyButton>
            </>
          }
        >
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-600 sm:text-base">
              {t(`data.colors.${selectedId}.description`)}
            </p>
            <div>
              <div className="mb-1 text-sm font-semibold text-gray-700">
                {t("colors.learning.exampleLabel")}
              </div>
              <div className="flex justify-center gap-2" aria-hidden="true">
                {[selected.hex, selected.lightHex, selected.hex].map((swatch, index) => (
                  <span
                    key={`${selectedId}-chip-${index}`}
                    className={`h-10 w-10 rounded-full border-4 ${selected.borderClass} shadow-md`}
                    style={{ backgroundColor: swatch }}
                  />
                ))}
              </div>
            </div>
          </div>
        </ToyDetailCard>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
        {COLOR_LEARNING_IDS.map(id => {
          const color = COLOR_DEFS[id];
          return (
            <button
              type="button"
              key={id}
              aria-label={t(`data.colors.${id}.name`)}
              onClick={() => handleColorClick(id)}
              className={`${color.lightBgClass} rounded-[2rem] border-4 ${color.borderClass} p-4 text-center shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-pink-300 focus-visible:outline-hidden active:translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 sm:p-5`}
            >
              <div
                className={`mx-auto mb-2 h-16 w-16 rounded-full border-4 ${color.borderClass} shadow-lg sm:mb-3 sm:h-20 sm:w-20`}
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              />

              <div className="mb-2 text-lg font-black text-gray-800 sm:text-xl md:text-2xl">
                {t(`data.colors.${id}.name`)}
              </div>

              <div className="flex justify-center gap-1" aria-hidden="true">
                {[color.hex, color.lightHex].map((swatch, index) => (
                  <span
                    key={`${id}-swatch-${index}`}
                    className={`h-5 w-5 rounded-full border-2 ${color.borderClass}`}
                    style={{ backgroundColor: swatch }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-white/80 p-3 text-center text-purple-600 shadow-sm">
        <div className="mb-1 flex items-center justify-center gap-2">
          <span aria-hidden="true">🎨</span>
          <span className="font-semibold">{t("colors.learning.instructionsTitle")}</span>
          <span aria-hidden="true">🎨</span>
        </div>
        <div className="text-xs text-purple-500 sm:text-sm">
          {t("colors.learning.instructionsSubtitle")}
        </div>
      </div>

      {latestUnlock && latestSticker && (
        <StickerReveal unlock={latestUnlock} sticker={latestSticker} className="mt-4" />
      )}
    </div>
  );
}
