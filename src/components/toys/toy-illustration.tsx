import type { ReactNode } from "react";

import { useTranslation } from "react-i18next";

import ShapePrimitive from "@/components/toys/shape-primitive";
import type { ToyTopicProps } from "@/components/toys/toy-types";
import type { GameTopicId, ToyAssetRole } from "@/data/topics";
import { getTopicVisual } from "@/data/topics";
import { cn } from "@/lib/utils";

type Variant = "hero" | "tile" | "backdrop";

const getVariant = (role: ToyAssetRole): Variant => {
  if (role === "hero") return "hero";
  if (role === "tile") return "tile";
  return "backdrop";
};

const WRAPPER_CLASS: Record<Variant, string> = {
  hero: "relative aspect-square",
  tile: "relative aspect-square",
  backdrop: "relative aspect-[16/10] w-full overflow-hidden rounded-[1.75rem]",
};

const renderNumbers = (variant: Variant): ReactNode => {
  if (variant === "tile") {
    return (
      <>
        <div className="absolute top-[18%] left-[10%] h-[50%] w-[42%] rotate-[-10deg] rounded-2xl border-4 border-sky-400 bg-sky-300 shadow-md" />
        <div className="absolute right-[10%] bottom-[14%] h-[52%] w-[44%] rotate-[8deg] rounded-2xl border-4 border-yellow-400 bg-yellow-300 shadow-md" />
        <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-sky-900 drop-shadow-sm">
          1
        </div>
      </>
    );
  }
  if (variant === "hero") {
    return (
      <>
        <div className="absolute top-[34%] left-[6%] flex h-[46%] w-[34%] -rotate-6 items-center justify-center rounded-2xl border-4 border-sky-400 bg-sky-300 text-4xl font-black text-white shadow-md">
          1
        </div>
        <div className="absolute top-[18%] left-[34%] flex h-[52%] w-[36%] rotate-3 items-center justify-center rounded-[1.25rem] border-4 border-yellow-400 bg-yellow-300 text-5xl font-black text-sky-900 shadow-lg">
          2
        </div>
        <div className="absolute right-[6%] bottom-[12%] flex h-[44%] w-[34%] rotate-12 items-center justify-center rounded-2xl border-4 border-blue-400 bg-blue-300 text-4xl font-black text-white shadow-md">
          3
        </div>
      </>
    );
  }
  return (
    <div className="absolute inset-0 bg-linear-to-br from-sky-100 via-white to-yellow-100">
      <div className="absolute top-[14%] left-[8%] h-[54%] w-[22%] -rotate-6 rounded-xl border-4 border-sky-300 bg-sky-200/80" />
      <div className="absolute top-[26%] left-[36%] h-[54%] w-[20%] rotate-6 rounded-xl border-4 border-yellow-300 bg-yellow-200/80" />
      <div className="absolute top-[12%] right-[10%] h-[60%] w-[22%] -rotate-3 rounded-xl border-4 border-blue-300 bg-blue-200/80" />
    </div>
  );
};

const renderLetters = (variant: Variant): ReactNode => {
  if (variant === "tile") {
    return (
      <>
        <div className="absolute inset-[14%] rounded-[1.5rem] border-4 border-emerald-400 bg-emerald-300 shadow-md" />
        <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white drop-shadow-sm">
          A
        </div>
      </>
    );
  }
  if (variant === "hero") {
    return (
      <>
        <div className="absolute top-[14%] right-[12%] h-[48%] w-[40%] rotate-6 rounded-2xl border-4 border-orange-300 bg-orange-200 shadow-md" />
        <div className="absolute bottom-[12%] left-[10%] h-[50%] w-[40%] -rotate-6 rounded-2xl border-4 border-emerald-300 bg-emerald-200 shadow-md" />
        <div className="absolute top-[16%] right-[14%] flex h-[44%] w-[36%] rotate-6 items-center justify-center text-4xl font-black text-orange-700">
          B
        </div>
        <div className="absolute bottom-[14%] left-[12%] flex h-[46%] w-[36%] -rotate-6 items-center justify-center text-4xl font-black text-emerald-700">
          C
        </div>
        <div className="absolute top-1/2 left-1/2 flex h-[58%] w-[50%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-4 border-emerald-500 bg-emerald-400 text-6xl font-black text-white shadow-lg">
          A
        </div>
      </>
    );
  }
  return (
    <div className="absolute inset-0 bg-linear-to-br from-emerald-50 via-white to-orange-50">
      <div className="absolute top-[20%] left-[10%] flex h-[48%] w-[22%] -rotate-6 items-center justify-center rounded-xl border-4 border-emerald-300 bg-white/80 text-3xl font-black text-emerald-700">
        A
      </div>
      <div className="absolute top-[22%] left-[38%] flex h-[48%] w-[22%] rotate-6 items-center justify-center rounded-xl border-4 border-orange-300 bg-white/80 text-3xl font-black text-orange-700">
        B
      </div>
      <div className="absolute top-[18%] right-[10%] flex h-[48%] w-[22%] -rotate-3 items-center justify-center rounded-xl border-4 border-emerald-300 bg-white/80 text-3xl font-black text-emerald-700">
        C
      </div>
    </div>
  );
};

const renderColors = (variant: Variant): ReactNode => {
  if (variant === "tile") {
    return (
      <>
        <div className="absolute inset-[12%] rounded-[40%] border-4 border-pink-400 bg-pink-200 shadow-md" />
        <div className="absolute top-[24%] left-[26%] h-[20%] w-[20%] rounded-full border-2 border-white bg-red-400 shadow-sm" />
        <div className="absolute top-[26%] right-[22%] h-[20%] w-[20%] rounded-full border-2 border-white bg-amber-300 shadow-sm" />
        <div className="absolute bottom-[24%] left-[24%] h-[20%] w-[20%] rounded-full border-2 border-white bg-sky-400 shadow-sm" />
        <div className="absolute right-[22%] bottom-[22%] h-[20%] w-[20%] rounded-full border-2 border-white bg-purple-400 shadow-sm" />
        <div className="absolute top-1/2 left-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />
      </>
    );
  }
  if (variant === "hero") {
    return (
      <>
        <div className="absolute inset-[8%] rounded-[45%] border-4 border-pink-400 bg-pink-200 shadow-lg" />
        <div className="absolute top-[20%] left-[18%] h-[22%] w-[22%] rounded-full border-4 border-white bg-red-400 shadow-md" />
        <div className="absolute top-[18%] right-[16%] h-[24%] w-[24%] rounded-full border-4 border-white bg-amber-300 shadow-md" />
        <div className="absolute bottom-[22%] left-[14%] h-[24%] w-[24%] rounded-full border-4 border-white bg-sky-400 shadow-md" />
        <div className="absolute right-[18%] bottom-[18%] h-[22%] w-[22%] rounded-full border-4 border-white bg-purple-400 shadow-md" />
        <div className="absolute top-1/2 left-1/2 h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-emerald-400 shadow-md" />
        <div className="absolute top-[6%] right-[6%] h-[18%] w-[6%] rotate-12 rounded-full border-2 border-amber-700 bg-amber-500" />
      </>
    );
  }
  return (
    <div className="absolute inset-0 bg-linear-to-br from-pink-100 via-white to-cyan-100">
      <div className="absolute top-[18%] left-[8%] h-[34%] w-[18%] rounded-full bg-red-300/70 blur-[2px]" />
      <div className="absolute top-[16%] left-[32%] h-[40%] w-[22%] rounded-full bg-amber-200/80 blur-[2px]" />
      <div className="absolute top-[22%] right-[10%] h-[36%] w-[20%] rounded-full bg-sky-300/70 blur-[2px]" />
      <div className="absolute bottom-[14%] left-[22%] h-[32%] w-[20%] rounded-full bg-purple-300/70 blur-[2px]" />
      <div className="absolute right-[24%] bottom-[18%] h-[30%] w-[18%] rounded-full bg-emerald-300/70 blur-[2px]" />
    </div>
  );
};

const renderShapes = (variant: Variant): ReactNode => {
  if (variant === "tile") {
    return (
      <>
        <div className="absolute top-1/2 left-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-xl border-4 border-indigo-400 bg-indigo-300 shadow-md" />
        <div className="absolute top-1/2 left-1/2 h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-lime-400 bg-lime-300 shadow-sm" />
      </>
    );
  }
  if (variant === "hero") {
    return (
      <>
        <div className="absolute top-[14%] left-[8%] h-[38%] w-[38%] rounded-full border-4 border-indigo-400 bg-indigo-300 shadow-md" />
        <div className="absolute top-[18%] right-[10%] h-[34%] w-[34%] rotate-12 rounded-xl border-4 border-lime-400 bg-lime-300 shadow-md" />
        <div className="absolute bottom-[8%] left-1/2 h-0 w-0 -translate-x-1/2 border-r-[3.5rem] border-b-[5rem] border-l-[3.5rem] border-r-transparent border-b-indigo-500 border-l-transparent drop-shadow-md" />
        <div className="absolute top-[30%] left-[32%] h-[28%] w-[28%] rotate-45 rounded-md border-4 border-white bg-pink-300 shadow-md" />
      </>
    );
  }
  return (
    <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-white to-lime-50">
      <div className="absolute top-[20%] left-[8%] h-[56%] w-[22%] rounded-full border-4 border-indigo-300 bg-indigo-200/80" />
      <div className="absolute top-[22%] left-[38%] h-[56%] w-[24%] rotate-12 rounded-xl border-4 border-lime-300 bg-lime-200/80" />
      <div className="absolute top-[26%] right-[8%] h-0 w-0 border-r-[2.5rem] border-b-[4rem] border-l-[2.5rem] border-r-transparent border-b-indigo-400 border-l-transparent" />
    </div>
  );
};

const renderFlashcards = (variant: Variant): ReactNode => {
  if (variant === "tile") {
    return (
      <>
        <div className="absolute top-[18%] left-[16%] h-[64%] w-[42%] rotate-[-8deg] rounded-2xl border-4 border-orange-300 bg-white shadow-md" />
        <div className="absolute top-[14%] right-[10%] h-[68%] w-[44%] rotate-[8deg] rounded-2xl border-4 border-purple-300 bg-orange-200 shadow-md" />
        <div className="absolute top-1/2 left-1/2 flex h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-4 border-orange-400 bg-white text-3xl font-black text-orange-700 shadow-md">
          ABC
        </div>
      </>
    );
  }
  if (variant === "hero") {
    return (
      <>
        <div className="absolute top-[20%] left-[8%] flex h-[58%] w-[30%] -rotate-12 items-center justify-center rounded-2xl border-4 border-purple-300 bg-white text-3xl font-black text-purple-700 shadow-md">
          1
        </div>
        <div className="absolute top-[14%] left-[30%] flex h-[62%] w-[32%] -rotate-3 items-center justify-center rounded-2xl border-4 border-orange-300 bg-orange-200 text-3xl font-black text-orange-700 shadow-md">
          A
        </div>
        <div className="absolute top-[18%] right-[18%] flex h-[58%] w-[30%] rotate-6 items-center justify-center rounded-2xl border-4 border-pink-300 bg-white text-3xl font-black text-pink-600 shadow-md">
          ●
        </div>
        <div className="absolute top-[12%] right-[4%] flex h-[56%] w-[26%] rotate-12 items-center justify-center rounded-2xl border-4 border-indigo-300 bg-indigo-200 text-3xl font-black text-indigo-700 shadow-md">
          ◆
        </div>
      </>
    );
  }
  return (
    <div className="absolute inset-0 bg-linear-to-br from-orange-50 via-white to-purple-50">
      <div className="absolute top-[18%] left-[8%] h-[60%] w-[18%] -rotate-6 rounded-xl border-4 border-orange-300 bg-white/80 shadow-sm" />
      <div className="absolute top-[14%] left-[32%] h-[64%] w-[18%] rotate-3 rounded-xl border-4 border-purple-300 bg-white/80 shadow-sm" />
      <div className="absolute top-[18%] right-[28%] h-[60%] w-[18%] -rotate-3 rounded-xl border-4 border-pink-300 bg-white/80 shadow-sm" />
      <div className="absolute top-[14%] right-[6%] h-[62%] w-[18%] rotate-[9deg] rounded-xl border-4 border-indigo-300 bg-white/80 shadow-sm" />
    </div>
  );
};

const TOPIC_RENDERERS: Record<GameTopicId, (variant: Variant) => ReactNode> = {
  numbers: renderNumbers,
  letters: renderLetters,
  colors: renderColors,
  shapes: renderShapes,
  flashcards: renderFlashcards,
};

export default function ToyIllustration({ topicId, assetRole = "tile", className }: ToyTopicProps) {
  const { t } = useTranslation();
  const visual = getTopicVisual(topicId);
  const variant = getVariant(assetRole);
  const render = TOPIC_RENDERERS[topicId];
  const composition = render ? render(variant) : null;

  if (!composition) {
    return (
      <div role="img" aria-label={t(visual.altTextKey)} className={className}>
        <ShapePrimitive
          shape={visual.fallback.shape}
          label={visual.fallback.label}
          palette={visual.palette}
        />
      </div>
    );
  }

  return (
    <div role="img" aria-label={t(visual.altTextKey)} className={className}>
      <div className={cn(WRAPPER_CLASS[variant], "h-full w-full")}>{composition}</div>
    </div>
  );
}
