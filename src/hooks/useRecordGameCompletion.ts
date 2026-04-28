import { useEffect, useRef, useState } from "react";

import type { RewardUnlock } from "@/data/reward-progress.schema";
import type { ActivityId, StickerReward } from "@/data/rewards";
import { useRewardProgress } from "@/hooks/useRewardProgress";

export interface UseRecordGameCompletionInput {
  activityId: ActivityId;
  gameOver: boolean;
  score: number;
  maxScore: number;
  resetKey: number | string;
}

export interface UseRecordGameCompletionReturn {
  latestUnlock: RewardUnlock | null;
  latestSticker: StickerReward | null;
}

export function useRecordGameCompletion({
  activityId,
  gameOver,
  score,
  maxScore,
  resetKey,
}: UseRecordGameCompletionInput): UseRecordGameCompletionReturn {
  const { recordActivityCompletion, getStickerById } = useRewardProgress();
  const [latestUnlock, setLatestUnlock] = useState<RewardUnlock | null>(null);
  const recordedResetKeyRef = useRef<number | string | null>(null);

  useEffect(() => {
    if (recordedResetKeyRef.current === resetKey) return;

    if (!gameOver) {
      setLatestUnlock(null);
      return;
    }

    const unlock = recordActivityCompletion({ activityId, score, maxScore });
    recordedResetKeyRef.current = resetKey;
    setLatestUnlock(unlock);
  }, [activityId, gameOver, maxScore, recordActivityCompletion, resetKey, score]);

  const latestSticker = latestUnlock ? (getStickerById(latestUnlock.stickerId) ?? null) : null;

  return { latestUnlock, latestSticker };
}
