import { z } from "zod";

export const activityCompletionSchema = z.object({
  count: z.number().int().nonnegative(),
  lastCompletedAt: z.string(),
  bestScore: z.number().optional(),
  lastScore: z.number().optional(),
});

export const rewardUnlockSchema = z.object({
  stickerId: z.string(),
  activityId: z.string().min(1),
  unlockedAt: z.string(),
});

export const rewardProgressStateSchema = z.object({
  version: z.literal(1),
  activityCompletions: z.record(z.string(), activityCompletionSchema),
  unlockedStickerIds: z.array(z.string()),
  lastReward: rewardUnlockSchema.nullable(),
  updatedAt: z.iso.datetime(),
});

export type ActivityCompletion = z.infer<typeof activityCompletionSchema>;
export type RewardUnlock = z.infer<typeof rewardUnlockSchema>;
export type RewardProgressState = z.infer<typeof rewardProgressStateSchema>;

export const EMPTY_REWARD_PROGRESS: RewardProgressState = {
  version: 1,
  activityCompletions: {},
  unlockedStickerIds: [],
  lastReward: null,
  updatedAt: "1970-01-01T00:00:00.000Z",
};

export const parseRewardProgress = (value: unknown): RewardProgressState => {
  const result = rewardProgressStateSchema.safeParse(value);
  return result.success ? result.data : EMPTY_REWARD_PROGRESS;
};
