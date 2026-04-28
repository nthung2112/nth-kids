import { useCallback, useRef, useState } from "react";

import type { RewardUnlock } from "@/data/reward-progress.schema";
import type { ActivityId, StickerReward } from "@/data/rewards";
import { useRewardProgress } from "@/hooks/useRewardProgress";

export interface UseLearningActivityProgressInput {
  activityId: ActivityId;
  threshold: number;
}

export interface UseLearningActivityProgressReturn {
  markInteraction: (id: string) => void;
  latestUnlock: RewardUnlock | null;
  latestSticker: StickerReward | null;
}

export function useLearningActivityProgress({
  activityId,
  threshold,
}: UseLearningActivityProgressInput): UseLearningActivityProgressReturn {
  const { recordActivityCompletion, getStickerById } = useRewardProgress();
  const uniqueIdsRef = useRef<Set<string>>(new Set());
  const recordedRef = useRef<boolean>(false);
  const [latestUnlock, setLatestUnlock] = useState<RewardUnlock | null>(null);

  const markInteraction = useCallback(
    (id: string) => {
      uniqueIdsRef.current.add(id);
      if (recordedRef.current) return;
      if (uniqueIdsRef.current.size < threshold) return;
      recordedRef.current = true;
      const unlock = recordActivityCompletion({ activityId });
      setLatestUnlock(unlock);
    },
    [activityId, threshold, recordActivityCompletion]
  );

  const latestSticker = latestUnlock ? (getStickerById(latestUnlock.stickerId) ?? null) : null;

  return { markInteraction, latestUnlock, latestSticker };
}
