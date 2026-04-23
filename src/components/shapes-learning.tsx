import { useState } from "react";

import { ChevronLeft, ChevronRight, Volume2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SHAPE_DEFS, SHAPE_LEARNING_IDS, type ShapeId } from "@/data/shapes";
import { useSound } from "@/hooks/useSound";

export default function ShapesLearning() {
  const { t } = useTranslation();
  const { playShapeSound } = useSound();
  const [selectedId, setSelectedId] = useState<ShapeId | null>(null);

  const speakLocalisedName = (id: ShapeId) => {
    playShapeSound(id);
  };

  const handleClick = (id: ShapeId) => {
    speakLocalisedName(id);
    setSelectedId(id);
  };

  const stepShape = (delta: number) => {
    if (!selectedId) return;
    const idx = SHAPE_LEARNING_IDS.indexOf(selectedId);
    const next = (idx + delta + SHAPE_LEARNING_IDS.length) % SHAPE_LEARNING_IDS.length;
    handleClick(SHAPE_LEARNING_IDS[next]);
  };

  const selected = selectedId ? SHAPE_DEFS[selectedId] : null;

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
              onClick={() => setSelectedId(null)}
              className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 shadow-sm hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-hidden"
              aria-label={t("common.close")}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-3 text-7xl sm:text-8xl" aria-hidden="true">
              {selected.emoji}
            </div>

            <div className="mb-2 text-3xl font-bold text-gray-800 sm:text-4xl">
              {t(`data.shapes.${selectedId}.name`)}
            </div>
            <div className="mb-3 text-sm text-gray-600 sm:text-base">
              {t(`data.shapes.${selectedId}.description`)}
            </div>

            <div className="mb-4">
              <div className="mb-1 text-sm font-semibold text-gray-700">
                {t("shapes.learning.exampleLabel")}
              </div>
              <div className="flex justify-center gap-2">
                {selected.examples.map((example, index) => (
                  <span
                    key={`${selectedId}-ex-${index}`}
                    className="animate-bounce text-3xl motion-reduce:animate-none sm:text-4xl"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    aria-hidden="true"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                onClick={() => stepShape(-1)}
                className="h-14 w-14 rounded-full bg-blue-500 p-0 text-white shadow-md hover:bg-blue-600"
                aria-label={t("shapes.learning.prev")}
                title={t("shapes.learning.prev")}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                onClick={() => {
                  speakLocalisedName(selectedId);
                }}
                className="h-16 w-16 rounded-full bg-green-500 p-0 text-white shadow-lg hover:bg-green-600"
                aria-label={t("common.listen")}
                title={t("common.listen")}
              >
                <Volume2 className="h-7 w-7" />
              </Button>

              <Button
                onClick={() => stepShape(1)}
                className="h-14 w-14 rounded-full bg-blue-500 p-0 text-white shadow-md hover:bg-blue-600"
                aria-label={t("shapes.learning.next")}
                title={t("shapes.learning.next")}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
        {SHAPE_LEARNING_IDS.map(id => {
          const shape = SHAPE_DEFS[id];
          return (
            <Card
              key={id}
              role="button"
              tabIndex={0}
              aria-label={t(`data.shapes.${id}.name`)}
              className={`${shape.bgClass} border-4 ${shape.borderClass} cursor-pointer p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 motion-reduce:transition-none sm:p-5`}
              onClick={() => handleClick(id)}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleClick(id);
                }
              }}
            >
              <div className="mb-2 text-5xl sm:text-6xl md:text-7xl" aria-hidden="true">
                {shape.emoji}
              </div>
              <div className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">
                {t(`data.shapes.${id}.name`)}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-white/80 p-3 text-center text-purple-600 shadow-sm">
        <div className="mb-1 flex items-center justify-center gap-2">
          <span aria-hidden="true">🔷</span>
          <span className="font-semibold">{t("shapes.learning.instructionsTitle")}</span>
          <span aria-hidden="true">🔷</span>
        </div>
        <div className="text-xs text-purple-500 sm:text-sm">
          {t("shapes.learning.instructionsSubtitle")}
        </div>
      </div>
    </div>
  );
}
