import { useCallback, useEffect, useState } from "react";

import type { ActivityId, StickerReward } from "@/data/rewards";
import { getRewardsForActivity, getTotalCompletionRewards, STICKER_REWARDS } from "@/data/rewards";
import {
  EMPTY_REWARD_PROGRESS,
  parseRewardProgress,
  type ActivityCompletion,
  type RewardProgressState,
  type RewardUnlock,
} from "@/data/reward-progress.schema";

const REWARD_PROGRESS_KEY = "nthkids:reward-progress:v1";
const REWARD_PROGRESS_EVENT = "nthkids:reward-progress-changed";

export interface RecordCompletionInput {
  activityId: ActivityId;
  score?: number;
  maxScore?: number;
  completedAt?: Date;
}

export interface UseRewardProgressReturn {
  progress: RewardProgressState;
  recordActivityCompletion: (input: RecordCompletionInput) => RewardUnlock | null;
  resetProgress: () => void;
  getStickerById: (id: string) => StickerReward | undefined;
}

interface ComputeNextStateResult {
  state: RewardProgressState;
  newUnlock: RewardUnlock | null;
}

const readRewardProgress = (): RewardProgressState => {
  if (typeof window === "undefined") return EMPTY_REWARD_PROGRESS;
  const raw = window.localStorage.getItem(REWARD_PROGRESS_KEY);
  if (raw === null) return EMPTY_REWARD_PROGRESS;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parseRewardProgress(parsed);
  } catch {
    return EMPTY_REWARD_PROGRESS;
  }
};

const writeRewardProgress = (state: RewardProgressState): boolean => {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(REWARD_PROGRESS_KEY, JSON.stringify(state));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(REWARD_PROGRESS_EVENT));
  return true;
};

const computeNextState = (
  current: RewardProgressState,
  input: RecordCompletionInput
): ComputeNextStateResult => {
  const completedAtDate = input.completedAt ?? new Date();
  const completedAtIso = completedAtDate.toISOString();

  const prev = current.activityCompletions[input.activityId];
  const nextCount = (prev?.count ?? 0) + 1;

  const nextBestScore =
    typeof input.score === "number"
      ? Math.max(prev?.bestScore ?? Number.NEGATIVE_INFINITY, input.score)
      : prev?.bestScore;
  const nextLastScore = input.score ?? prev?.lastScore;

  const nextCompletion: ActivityCompletion = {
    count: nextCount,
    lastCompletedAt: completedAtIso,
    ...(nextBestScore !== undefined ? { bestScore: nextBestScore } : {}),
    ...(nextLastScore !== undefined ? { lastScore: nextLastScore } : {}),
  };

  const nextActivityCompletions: Record<string, ActivityCompletion> = {
    ...current.activityCompletions,
    [input.activityId]: nextCompletion,
  };

  const totalCompletionCount = Object.values(nextActivityCompletions).reduce(
    (sum, completion) => sum + completion.count,
    0
  );

  const activityRewards = getRewardsForActivity(input.activityId).filter(reward => {
    if (reward.unlock.kind !== "activity") return false;
    return nextCount === reward.unlock.completionCount;
  });

  const totalRewards = getTotalCompletionRewards(totalCompletionCount).filter(reward => {
    if (reward.unlock.kind !== "total") return false;
    return totalCompletionCount === reward.unlock.completionCount;
  });

  const alreadyUnlocked = new Set(current.unlockedStickerIds);
  /**
   * Activity-specific stickers are considered before total-completion stickers so that a
   * single completion that crosses both kinds of thresholds shows the topic-specific reward
   * first, while still persisting every eligible sticker via `nextUnlockedStickerIds`.
   */
  const newlyEligible = [...activityRewards, ...totalRewards].filter(
    reward => !alreadyUnlocked.has(reward.id)
  );
  const newUnlockSticker = newlyEligible[0];

  const newUnlock: RewardUnlock | null = newUnlockSticker
    ? {
        stickerId: newUnlockSticker.id,
        activityId: input.activityId,
        unlockedAt: completedAtIso,
      }
    : null;

  const nextUnlockedStickerIds =
    newlyEligible.length > 0
      ? [...current.unlockedStickerIds, ...newlyEligible.map(reward => reward.id)]
      : current.unlockedStickerIds;

  const nextLastReward = newUnlock ?? current.lastReward;

  const nextState: RewardProgressState = {
    version: 1,
    activityCompletions: nextActivityCompletions,
    unlockedStickerIds: nextUnlockedStickerIds,
    lastReward: nextLastReward,
    updatedAt: completedAtIso,
  };

  return {
    state: nextState,
    newUnlock: newUnlock,
  };
};

export function useRewardProgress(): UseRewardProgressReturn {
  const [progress, setProgress] = useState<RewardProgressState>(() => readRewardProgress());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onChange = () => setProgress(readRewardProgress());
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== REWARD_PROGRESS_KEY) return;
      setProgress(readRewardProgress());
    };
    window.addEventListener(REWARD_PROGRESS_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(REWARD_PROGRESS_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const recordActivityCompletion = useCallback(
    (input: RecordCompletionInput): RewardUnlock | null => {
      const next = computeNextState(readRewardProgress(), input);
      const persisted = writeRewardProgress(next.state);
      return persisted ? next.newUnlock : null;
    },
    []
  );

  const resetProgress = useCallback(() => {
    writeRewardProgress(EMPTY_REWARD_PROGRESS);
  }, []);

  const getStickerById = useCallback(
    (id: string) => STICKER_REWARDS.find(sticker => sticker.id === id),
    []
  );

  return { progress, recordActivityCompletion, resetProgress, getStickerById };
}
