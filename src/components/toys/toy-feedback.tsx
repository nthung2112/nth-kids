import { Star } from "lucide-react";

import type { FeedbackModalProps } from "@/components/games/feedback-modal";
import ShapePrimitive from "@/components/toys/shape-primitive";
import { Card } from "@/components/ui/card";
import type { ToyPalette, ToyShapeKind } from "@/data/topics";

export type ToyFeedbackProps = FeedbackModalProps;

const CORRECT_PALETTE: ToyPalette = {
  primary: "bg-emerald-400",
  secondary: "bg-emerald-100",
  accent: "bg-yellow-300",
  onPrimary: "text-white",
  surface: "bg-white",
  border: "border-emerald-300",
  text: "text-emerald-800",
};

const WRONG_PALETTE: ToyPalette = {
  primary: "bg-rose-300",
  secondary: "bg-rose-100",
  accent: "bg-sky-300",
  onPrimary: "text-white",
  surface: "bg-white",
  border: "border-rose-300",
  text: "text-rose-800",
};

export default function ToyFeedback({ kind, message, extra }: ToyFeedbackProps) {
  const isCorrect = kind === "correct";
  const palette = isCorrect ? CORRECT_PALETTE : WRONG_PALETTE;
  const shape: ToyShapeKind = isCorrect ? "shapes" : "blocks";
  const label = isCorrect ? "!" : "?";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="status"
      aria-live="polite"
    >
      <Card className="relative mx-auto w-full max-w-md rounded-[2rem] border-4 border-white bg-white p-6 text-center shadow-2xl sm:p-8">
        <div className="mx-auto mb-4 h-32 w-32 sm:h-36 sm:w-36">
          <ShapePrimitive shape={shape} label={label} palette={palette} className="h-full w-full" />
        </div>

        <div className="mb-3 text-3xl font-black text-purple-800 sm:text-4xl">{message}</div>

        {extra && <div className="mb-4">{extra}</div>}

        {isCorrect && (
          <div className="flex justify-center gap-2" aria-hidden="true">
            {[...Array(3)].map((_, i) => (
              <Star
                key={i}
                className="h-8 w-8 animate-bounce fill-yellow-400 text-yellow-500"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
