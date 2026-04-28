import type { ReactNode } from "react";
import { useState } from "react";

import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StickerReveal } from "@/components/rewards";
import { ToyButton, ToyDetailCard } from "@/components/toys";
import { SHAPE_DEFS, SHAPE_LEARNING_IDS, type ShapeId } from "@/data/shapes";
import { getTopicVisual } from "@/data/topics";
import { useLearningActivityProgress } from "@/hooks/useLearningActivityProgress";
import { useSound } from "@/hooks/useSound";
import { cn } from "@/lib/utils";

const SHAPE_TONES: Record<ShapeId, { fill: string; stroke: string }> = {
  circle: { fill: "fill-yellow-400", stroke: "stroke-yellow-600" },
  square: { fill: "fill-sky-400", stroke: "stroke-sky-600" },
  rectangle: { fill: "fill-emerald-400", stroke: "stroke-emerald-600" },
  triangle: { fill: "fill-rose-400", stroke: "stroke-rose-600" },
  star: { fill: "fill-amber-400", stroke: "stroke-amber-600" },
  heart: { fill: "fill-pink-400", stroke: "stroke-pink-600" },
  diamond: { fill: "fill-indigo-400", stroke: "stroke-indigo-600" },
  oval: { fill: "fill-orange-400", stroke: "stroke-orange-600" },
};

const renderShapeGraphic = (id: ShapeId, className?: string): ReactNode => {
  const tone = SHAPE_TONES[id];
  const commonStroke = "stroke-[6]";
  const svgClass = cn("h-full w-full", tone.fill, tone.stroke, commonStroke);

  switch (id) {
    case "circle":
      return (
        <svg viewBox="0 0 100 100" className={cn("h-full w-full", className)} aria-hidden="true">
          <circle cx="50" cy="50" r="40" className={cn(tone.fill, tone.stroke, commonStroke)} />
        </svg>
      );
    case "square":
      return (
        <svg viewBox="0 0 100 100" className={cn(svgClass, className)} aria-hidden="true">
          <rect x="14" y="14" width="72" height="72" rx="8" />
        </svg>
      );
    case "rectangle":
      return (
        <svg viewBox="0 0 100 100" className={cn(svgClass, className)} aria-hidden="true">
          <rect x="10" y="28" width="80" height="44" rx="8" />
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 100 100" className={cn(svgClass, className)} aria-hidden="true">
          <polygon points="50,14 88,82 12,82" strokeLinejoin="round" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 100 100" className={cn(svgClass, className)} aria-hidden="true">
          <polygon
            points="50,10 61,38 92,40 68,60 76,90 50,73 24,90 32,60 8,40 39,38"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 100 100" className={cn(svgClass, className)} aria-hidden="true">
          <path
            d="M50 84 C20 64 10 44 24 30 C34 20 46 24 50 36 C54 24 66 20 76 30 C90 44 80 64 50 84 Z"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 100 100" className={cn(svgClass, className)} aria-hidden="true">
          <polygon points="50,10 90,50 50,90 10,50" strokeLinejoin="round" />
        </svg>
      );
    case "oval":
      return (
        <svg viewBox="0 0 100 100" className={cn(svgClass, className)} aria-hidden="true">
          <ellipse cx="50" cy="50" rx="40" ry="28" />
        </svg>
      );
    default:
      return null;
  }
};

export default function ShapesLearning() {
  const { t } = useTranslation();
  const { playShapeSound } = useSound();
  const [selectedId, setSelectedId] = useState<ShapeId | null>(null);
  const { markInteraction, latestUnlock, latestSticker } = useLearningActivityProgress({
    activityId: "learn:shapes",
    threshold: 3,
  });

  const speakLocalisedName = (id: ShapeId) => {
    playShapeSound(id);
  };

  const handleClick = (id: ShapeId) => {
    speakLocalisedName(id);
    setSelectedId(id);
    markInteraction(id);
  };

  const resetSelection = () => {
    setSelectedId(null);
  };

  const stepShape = (delta: number) => {
    if (!selectedId) return;
    const idx = SHAPE_LEARNING_IDS.indexOf(selectedId);
    const next = (idx + delta + SHAPE_LEARNING_IDS.length) % SHAPE_LEARNING_IDS.length;
    handleClick(SHAPE_LEARNING_IDS[next]);
  };

  const selected = selectedId ? SHAPE_DEFS[selectedId] : null;
  const visual = getTopicVisual("shapes");

  return (
    <div className="mx-auto w-full max-w-6xl">
      {selectedId && selected && (
        <ToyDetailCard
          onClose={resetSelection}
          title={t(`data.shapes.${selectedId}.name`)}
          palette={visual.palette}
          visual={
            <div className="relative flex aspect-square w-full items-center justify-center rounded-[2rem] border-4 border-indigo-300 bg-indigo-100 shadow-lg">
              <div className="h-40 w-40 sm:h-48 sm:w-48">{renderShapeGraphic(selectedId)}</div>
            </div>
          }
          controls={
            <>
              <ToyButton
                tone="secondary"
                onClick={() => stepShape(-1)}
                aria-label={t("shapes.learning.prev")}
                title={t("shapes.learning.prev")}
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
                onClick={() => stepShape(1)}
                aria-label={t("shapes.learning.next")}
                title={t("shapes.learning.next")}
                className="h-14 w-14 rounded-full px-0 py-0"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </ToyButton>
            </>
          }
        >
          <p className="text-sm text-gray-600 sm:text-base">
            {t(`data.shapes.${selectedId}.description`)}
          </p>
        </ToyDetailCard>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
        {SHAPE_LEARNING_IDS.map(id => {
          const shape = SHAPE_DEFS[id];
          return (
            <button
              type="button"
              key={id}
              aria-label={t(`data.shapes.${id}.name`)}
              onClick={() => handleClick(id)}
              className={`${shape.bgClass} rounded-[2rem] border-4 ${shape.borderClass} p-4 text-center shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-indigo-300 focus-visible:outline-hidden active:translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 sm:p-5`}
            >
              <div className="mx-auto mb-2 h-20 w-20 sm:h-24 sm:w-24">{renderShapeGraphic(id)}</div>
              <div className="text-lg font-black text-gray-800 sm:text-xl md:text-2xl">
                {t(`data.shapes.${id}.name`)}
              </div>
            </button>
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

      {latestUnlock && latestSticker && (
        <StickerReveal unlock={latestUnlock} sticker={latestSticker} className="mt-4" />
      )}
    </div>
  );
}
