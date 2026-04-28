import { useTranslation } from "react-i18next";

import ShapePrimitive from "@/components/toys/shape-primitive";
import type { StickerReward } from "@/data/rewards";
import { getStickerLabel, getStickerPalette, STICKER_REWARDS } from "@/data/rewards";
import { cn } from "@/lib/utils";

export interface StickerBoardProps {
  stickers?: readonly StickerReward[];
  unlockedStickerIds: readonly string[];
  compact?: boolean;
  className?: string;
}

export default function StickerBoard({
  stickers = STICKER_REWARDS,
  unlockedStickerIds,
  compact = false,
  className,
}: StickerBoardProps) {
  const { t } = useTranslation();
  const unlockedSet = new Set(unlockedStickerIds);

  const gridClass = compact
    ? "grid-cols-4"
    : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6";

  const shapeSize = compact ? "h-16 w-16" : "h-20 w-20";

  return (
    <section
      aria-label={t("rewards.board.title")}
      className={cn(
        "rounded-[2rem] border-4 border-white/70 bg-white/90 p-4 shadow-xl sm:p-6",
        className
      )}
    >
      <h2 className="mb-4 text-center text-lg font-black text-purple-800 sm:text-xl">
        {t("rewards.board.title")}
      </h2>

      <ul className={cn("grid gap-3 sm:gap-4", gridClass)}>
        {stickers.map(sticker => {
          const isUnlocked = unlockedSet.has(sticker.id);
          const palette = getStickerPalette(sticker);
          const title = t(sticker.titleKey);
          const lockedText = t("rewards.locked");
          const tileAriaLabel = isUnlocked ? title : `${lockedText}: ${title}`;

          return (
            <li
              key={sticker.id}
              aria-label={tileAriaLabel}
              className="flex flex-col items-center gap-1 rounded-2xl bg-white/60 p-2 text-center"
            >
              <div className={cn("relative", !isUnlocked && "opacity-40 grayscale")}>
                <ShapePrimitive
                  shape={sticker.shape}
                  label={getStickerLabel(sticker)}
                  palette={palette}
                  className={shapeSize}
                />
              </div>
              <div className="line-clamp-2 text-xs font-bold text-purple-800 sm:text-sm">
                {title}
              </div>
              {!isUnlocked && (
                <div className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase">
                  {lockedText}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
