import type { ReactNode } from "react";

import { Star } from "lucide-react";

import { Card } from "@/components/ui/card";

interface FeedbackModalProps {
  kind: "correct" | "wrong";
  message: string;
  successEmoji?: string;
  wrongEmoji?: string;
  extra?: ReactNode;
}

export default function FeedbackModal({
  kind,
  message,
  successEmoji = "🎉",
  wrongEmoji = "😊",
  extra,
}: FeedbackModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="status"
      aria-live="polite"
    >
      <Card className="mx-4 max-w-md p-8 text-center">
        <div className="mb-4 text-8xl" aria-hidden="true">
          {kind === "correct" ? successEmoji : wrongEmoji}
        </div>

        <div className="mb-4 text-3xl font-bold text-purple-800">{message}</div>

        {extra && <div className="mb-4">{extra}</div>}

        {kind === "correct" && (
          <div className="flex justify-center gap-2" aria-hidden="true">
            {[...Array(3)].map((_, i) => (
              <Star
                key={i}
                className="h-8 w-8 animate-bounce fill-yellow-500 text-yellow-500"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
