import { useTranslation } from "react-i18next";

import ShapePrimitive from "@/components/toys/shape-primitive";
import type { RewardUnlock } from "@/data/reward-progress.schema";
import type { StickerReward } from "@/data/rewards";
import { getStickerLabel, getStickerPalette } from "@/data/rewards";
import { cn } from "@/lib/utils";

export interface StickerRevealProps {
  unlock: RewardUnlock;
  sticker: StickerReward;
  className?: string;
}

export default function StickerReveal({ unlock, sticker, className }: StickerRevealProps) {
  const { t } = useTranslation();
  const palette = getStickerPalette(sticker);
  const title = t(sticker.titleKey);

  return (
    <div
      key={unlock.stickerId}
      role="status"
      aria-live="polite"
      className={cn(
        "toy-pop mx-auto flex max-w-sm flex-col items-center gap-2 rounded-[2rem] border-4 border-white/80 bg-white/90 p-4 text-center shadow-xl motion-reduce:animate-none",
        className
      )}
    >
      <div className="toy-float motion-reduce:animate-none">
        <ShapePrimitive
          shape={sticker.shape}
          label={getStickerLabel(sticker)}
          palette={palette}
          className="h-24 w-24 sm:h-28 sm:w-28"
        />
      </div>
      <div className="text-lg font-black text-purple-800 sm:text-xl">
        {t("rewards.reveal.title")}
      </div>
      <div className="text-sm font-semibold text-purple-700 sm:text-base">
        {t("rewards.reveal.subtitle", { title })}
      </div>
    </div>
  );
}
