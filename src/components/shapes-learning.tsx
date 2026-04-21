import { useState } from "react";

import { ChevronLeft, ChevronRight, RotateCcw, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SHAPE_DEFS, SHAPE_LEARNING_IDS, type ShapeId } from "@/data/shapes";
import { useSound } from "@/hooks/useSound";

export default function ShapesLearning() {
  const { t } = useTranslation();
  const { playClickSound, playShapeSound } = useSound();
  const [selectedId, setSelectedId] = useState<ShapeId | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleClick = (id: ShapeId) => {
    playClickSound();
    playShapeSound(id);
    setSelectedId(id);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const stepShape = (delta: number) => {
    if (!selectedId) return;
    const idx = SHAPE_LEARNING_IDS.indexOf(selectedId);
    const next = (idx + delta + SHAPE_LEARNING_IDS.length) % SHAPE_LEARNING_IDS.length;
    handleClick(SHAPE_LEARNING_IDS[next]);
  };

  const selected = selectedId ? SHAPE_DEFS[selectedId] : null;

  return (
    <div className="mx-auto max-w-6xl">
      {selectedId && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="relative mx-4 max-w-lg p-8 text-center">
            {showCelebration && (
              <div className="pointer-events-none absolute -top-4 -right-4 -bottom-4 -left-4">
                <div className="animate-bounce text-6xl motion-reduce:animate-none">🎉</div>
                <div className="absolute top-4 right-4 animate-spin text-4xl motion-reduce:animate-none">
                  ⭐
                </div>
              </div>
            )}

            <div className="mb-4 text-9xl" aria-hidden="true">
              {selected.emoji}
            </div>

            <div className="mb-2 text-4xl font-bold text-gray-800">
              {t(`data.shapes.${selectedId}.name`)}
            </div>
            <div className="mb-4 text-lg text-gray-600">
              {t(`data.shapes.${selectedId}.description`)}
            </div>

            <div className="mb-6">
              <div className="mb-2 text-lg font-semibold text-gray-700">
                {t("shapes.learning.exampleLabel")}
              </div>
              <div className="flex justify-center gap-3">
                {selected.examples.map((example, index) => (
                  <span
                    key={`${selectedId}-ex-${index}`}
                    className="animate-bounce text-4xl motion-reduce:animate-none"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    aria-hidden="true"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => stepShape(-1)}
                className="bg-blue-500 px-4 py-3 text-base text-white hover:bg-blue-600"
                aria-label={t("shapes.learning.prev")}
              >
                <ChevronLeft className="mr-1" />
                {t("shapes.learning.prev")}
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  playShapeSound(selectedId);
                }}
                className="bg-green-500 px-6 py-3 text-base text-white hover:bg-green-600"
              >
                <Volume2 className="mr-2" />
                {t("common.listen")}
              </Button>

              <Button
                onClick={() => stepShape(1)}
                className="bg-blue-500 px-4 py-3 text-base text-white hover:bg-blue-600"
                aria-label={t("shapes.learning.next")}
              >
                {t("shapes.learning.next")}
                <ChevronRight className="ml-1" />
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  setSelectedId(null);
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

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {SHAPE_LEARNING_IDS.map(id => {
          const shape = SHAPE_DEFS[id];
          return (
            <Card
              key={id}
              role="button"
              tabIndex={0}
              aria-label={t(`data.shapes.${id}.name`)}
              className={`${shape.bgClass} border-4 ${shape.borderClass} cursor-pointer p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 motion-reduce:transition-none`}
              onClick={() => handleClick(id)}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleClick(id);
                }
              }}
            >
              <div className="mb-3 text-7xl" aria-hidden="true">
                {shape.emoji}
              </div>
              <div className="text-xl font-bold text-gray-800 md:text-2xl">
                {t(`data.shapes.${id}.name`)}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-4 text-center text-lg text-purple-600 shadow-lg">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span aria-hidden="true">🔷</span>
          <span className="font-semibold">{t("shapes.learning.instructionsTitle")}</span>
          <span aria-hidden="true">🔷</span>
        </div>
        <div className="text-sm text-purple-500">{t("shapes.learning.instructionsSubtitle")}</div>
      </div>
    </div>
  );
}
