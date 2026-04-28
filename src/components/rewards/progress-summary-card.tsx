import { Clock, Sparkles, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { RewardProgressState } from "@/data/reward-progress.schema";
import { STICKER_REWARDS } from "@/data/rewards";
import { cn } from "@/lib/utils";

export interface ProgressSummaryCardProps {
  progress: RewardProgressState;
  className?: string;
}

const countTotalCompletions = (progress: RewardProgressState): number =>
  Object.values(progress.activityCompletions).reduce(
    (sum, completion) => sum + completion.count,
    0
  );

const findStickerTitleKey = (stickerId: string): string | undefined =>
  STICKER_REWARDS.find(sticker => sticker.id === stickerId)?.titleKey;

export default function ProgressSummaryCard({ progress, className }: ProgressSummaryCardProps) {
  const { t } = useTranslation();
  const totalCompletions = countTotalCompletions(progress);
  const unlockedCount = progress.unlockedStickerIds.length;
  const isEmpty = unlockedCount === 0 && totalCompletions === 0;

  const lastStickerTitleKey = progress.lastReward
    ? findStickerTitleKey(progress.lastReward.stickerId)
    : undefined;

  return (
    <section
      aria-label={t("rewards.summary.title")}
      className={cn(
        "rounded-[2rem] border-4 border-white/70 bg-white/90 p-4 shadow-xl sm:p-5",
        className
      )}
    >
      <h2 className="mb-3 text-center text-lg font-black text-purple-800 sm:text-xl">
        {t("rewards.summary.title")}
      </h2>

      {isEmpty ? (
        <p className="text-center text-sm font-semibold text-purple-700 sm:text-base">
          {t("rewards.summary.empty")}
        </p>
      ) : (
        <ul className="space-y-2 text-sm font-semibold text-purple-800 sm:text-base">
          <li className="flex items-center gap-2">
            <Trophy
              className="h-5 w-5 shrink-0 fill-yellow-300 text-yellow-600"
              aria-hidden="true"
            />
            <span>{t("rewards.summary.totalActivities", { count: totalCompletions })}</span>
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 shrink-0 text-pink-500" aria-hidden="true" />
            <span>{t("rewards.summary.unlockedStickers", { count: unlockedCount })}</span>
          </li>
          {progress.lastReward && lastStickerTitleKey && (
            <li className="flex items-center gap-2">
              <Clock className="h-5 w-5 shrink-0 text-sky-500" aria-hidden="true" />
              <span>
                {t("rewards.summary.lastActivity", { title: t(lastStickerTitleKey) })}
              </span>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
