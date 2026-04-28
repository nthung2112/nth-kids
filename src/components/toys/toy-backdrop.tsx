import type { ReactNode } from "react";

import type { GameTopicId, ToyBackdropPattern, ToyPalette } from "@/data/topics";
import { getTopicVisual } from "@/data/topics";
import { cn } from "@/lib/utils";

interface ToyBackdropProps {
  topicId: GameTopicId;
  className?: string;
}

const renderDots = (palette: ToyPalette) => (
  <div className="absolute inset-0">
    {Array.from({ length: 16 }).map((_, i) => (
      <span
        key={i}
        className={cn("absolute h-3 w-3 rounded-full opacity-60", palette.accent)}
        style={{
          top: `${(i * 37) % 95}%`,
          left: `${(i * 59) % 95}%`,
        }}
      />
    ))}
  </div>
);

const renderBlocks = (palette: ToyPalette) => (
  <div className="absolute inset-0">
    <div
      className={cn(
        "absolute top-[12%] left-[8%] h-16 w-16 rotate-[-10deg] rounded-2xl border-4 opacity-60",
        palette.secondary,
        palette.border
      )}
    />
    <div
      className={cn(
        "absolute top-[20%] right-[10%] h-14 w-14 rotate-[8deg] rounded-xl border-4 opacity-60",
        palette.accent,
        palette.border
      )}
    />
    <div
      className={cn(
        "absolute bottom-[14%] left-[22%] h-12 w-12 rotate-[14deg] rounded-xl border-4 opacity-60",
        palette.primary,
        palette.border
      )}
    />
    <div
      className={cn(
        "absolute right-[18%] bottom-[10%] h-16 w-16 rotate-[-6deg] rounded-2xl border-4 opacity-60",
        palette.secondary,
        palette.border
      )}
    />
  </div>
);

const renderBlobs = (palette: ToyPalette) => (
  <div className="absolute inset-0">
    <div
      className={cn(
        "absolute top-[-6%] left-[-8%] h-40 w-40 rounded-[45%] opacity-60 blur-[2px]",
        palette.accent
      )}
    />
    <div
      className={cn(
        "absolute top-[20%] right-[-10%] h-48 w-48 rounded-[55%] opacity-50 blur-[2px]",
        palette.secondary
      )}
    />
    <div
      className={cn(
        "absolute bottom-[-10%] left-[20%] h-44 w-44 rounded-[50%] opacity-50 blur-[2px]",
        palette.primary
      )}
    />
  </div>
);

const renderWaves = (palette: ToyPalette) => (
  <div className="absolute inset-0">
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full opacity-60"
      aria-hidden="true"
    >
      <path
        d="M0 40 Q 25 20 50 40 T 100 40 T 150 40 T 200 40 L 200 0 L 0 0 Z"
        className={cn("fill-current", palette.text)}
        opacity="0.25"
      />
      <path
        d="M0 80 Q 25 60 50 80 T 100 80 T 150 80 T 200 80 L 200 40 L 0 40 Z"
        className={cn("fill-current", palette.text)}
        opacity="0.18"
      />
      <path
        d="M0 120 Q 25 100 50 120 T 100 120 T 150 120 T 200 120 L 200 80 L 0 80 Z"
        className={cn("fill-current", palette.text)}
        opacity="0.12"
      />
    </svg>
  </div>
);

const renderStars = (palette: ToyPalette) => (
  <div className="absolute inset-0">
    {Array.from({ length: 10 }).map((_, i) => (
      <svg
        key={i}
        viewBox="0 0 24 24"
        className={cn("absolute h-5 w-5 opacity-70", palette.text)}
        style={{
          top: `${(i * 43) % 90}%`,
          left: `${(i * 71) % 92}%`,
        }}
        aria-hidden="true"
      >
        <path
          d="M12 2 L14.5 9 L22 9 L16 13.5 L18.2 21 L12 16.8 L5.8 21 L8 13.5 L2 9 L9.5 9 Z"
          className="fill-current"
        />
      </svg>
    ))}
  </div>
);

const PATTERNS: Record<ToyBackdropPattern, (palette: ToyPalette) => ReactNode> = {
  dots: renderDots,
  blocks: renderBlocks,
  blobs: renderBlobs,
  waves: renderWaves,
  stars: renderStars,
};

export default function ToyBackdrop({ topicId, className }: ToyBackdropProps) {
  const visual = getTopicVisual(topicId);
  const render = PATTERNS[visual.backdrop.pattern];

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {render(visual.palette)}
    </div>
  );
}
