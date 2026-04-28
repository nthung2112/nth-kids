import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RewardProgressState } from "@/data/reward-progress.schema";
import { STICKER_REWARDS } from "@/data/rewards";
import { cn } from "@/lib/utils";

export interface ProgressSettingsPanelProps {
  progress: RewardProgressState;
  onReset: () => void;
  className?: string;
}

const countTotalCompletions = (progress: RewardProgressState): number =>
  Object.values(progress.activityCompletions).reduce(
    (sum, completion) => sum + completion.count,
    0
  );

export default function ProgressSettingsPanel({
  progress,
  onReset,
  className,
}: ProgressSettingsPanelProps) {
  const { t } = useTranslation();
  const totalCompletions = countTotalCompletions(progress);
  const unlockedCount = progress.unlockedStickerIds.length;

  const lastSticker = progress.lastReward
    ? STICKER_REWARDS.find(sticker => sticker.id === progress.lastReward?.stickerId)
    : undefined;

  const handleReset = () => {
    const confirmed = window.confirm(t("rewards.settings.resetConfirm"));
    if (confirmed) onReset();
  };

  return (
    <Card className={cn("border-2 border-purple-200 bg-purple-50/40 p-4", className)}>
      <div className="mb-3">
        <h2 className="text-base font-bold text-purple-800 sm:text-lg">
          {t("rewards.settings.title")}
        </h2>
        <p className="text-xs text-purple-600 sm:text-sm">{t("rewards.settings.description")}</p>
      </div>

      <ul className="mb-4 space-y-1.5 text-sm text-purple-800">
        <li>{t("rewards.settings.totalActivities", { count: totalCompletions })}</li>
        <li>{t("rewards.settings.unlockedStickers", { count: unlockedCount })}</li>
        {progress.lastReward && lastSticker && (
          <li>{t("rewards.settings.lastReward", { title: t(lastSticker.titleKey) })}</li>
        )}
      </ul>

      <Button
        type="button"
        variant="destructive"
        onClick={handleReset}
        className="h-10 w-full rounded-lg sm:w-auto"
      >
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
        {t("rewards.settings.resetButton")}
      </Button>
    </Card>
  );
}
