import type { ToyPalette, ToyShapeKind } from "@/data/topics";
import { DEFAULT_TOY_PALETTE, getTopicVisual } from "@/data/topics";

export type ActivityId =
  | "learn:numbers"
  | "learn:letters"
  | "learn:colors"
  | "learn:shapes"
  | "game:numbers"
  | "game:letters:alphabet"
  | "game:letters:sequence"
  | "game:letters:sounds"
  | "game:colors:identify"
  | "game:colors:matching"
  | "game:colors:coloring"
  | "game:colors:sort"
  | "game:shapes"
  | "game:flashcards";

export type RewardTopicId = "numbers" | "letters" | "colors" | "shapes" | "mixed";

export type StickerUnlockRule =
  | { kind: "activity"; activityId: ActivityId; completionCount: number }
  | { kind: "total"; completionCount: number };

export interface StickerReward {
  id: string;
  topicId: RewardTopicId;
  titleKey: string;
  descriptionKey: string;
  shape: ToyShapeKind;
  unlock: StickerUnlockRule;
}

const createSticker = (
  id: string,
  topicId: RewardTopicId,
  shape: ToyShapeKind,
  unlock: StickerUnlockRule,
): StickerReward => ({
  id,
  topicId,
  titleKey: `rewards.stickers.${id}.title`,
  descriptionKey: `rewards.stickers.${id}.description`,
  shape,
  unlock,
});

export const STICKER_REWARDS: readonly StickerReward[] = [
  createSticker("numbers-first", "numbers", "blocks", {
    kind: "activity",
    activityId: "learn:numbers",
    completionCount: 1,
  }),
  createSticker("numbers-3", "numbers", "blocks", {
    kind: "activity",
    activityId: "game:numbers",
    completionCount: 3,
  }),
  createSticker("letters-first", "letters", "letters", {
    kind: "activity",
    activityId: "learn:letters",
    completionCount: 1,
  }),
  createSticker("letters-3", "letters", "letters", {
    kind: "activity",
    activityId: "game:letters:alphabet",
    completionCount: 3,
  }),
  createSticker("colors-first", "colors", "palette", {
    kind: "activity",
    activityId: "learn:colors",
    completionCount: 1,
  }),
  createSticker("colors-3", "colors", "palette", {
    kind: "activity",
    activityId: "game:colors:identify",
    completionCount: 3,
  }),
  createSticker("shapes-first", "shapes", "shapes", {
    kind: "activity",
    activityId: "learn:shapes",
    completionCount: 1,
  }),
  createSticker("shapes-3", "shapes", "shapes", {
    kind: "activity",
    activityId: "game:shapes",
    completionCount: 3,
  }),
  createSticker("flashcards-first", "mixed", "cards", {
    kind: "activity",
    activityId: "game:flashcards",
    completionCount: 1,
  }),
  createSticker("coloring-first", "colors", "palette", {
    kind: "activity",
    activityId: "game:colors:coloring",
    completionCount: 1,
  }),
  createSticker("color-sort-first", "colors", "palette", {
    kind: "activity",
    activityId: "game:colors:sort",
    completionCount: 1,
  }),
  createSticker("letter-sounds-first", "letters", "letters", {
    kind: "activity",
    activityId: "game:letters:sounds",
    completionCount: 1,
  }),
  createSticker("toy-explorer-5", "mixed", "cards", { kind: "total", completionCount: 5 }),
  createSticker("toy-explorer-12", "mixed", "cards", { kind: "total", completionCount: 12 }),
];

export const getRewardsForActivity = (activityId: ActivityId): StickerReward[] =>
  STICKER_REWARDS.filter(
    (reward) => reward.unlock.kind === "activity" && reward.unlock.activityId === activityId,
  );

export const getTotalCompletionRewards = (totalCompletionCount: number): StickerReward[] =>
  STICKER_REWARDS.filter(
    (reward) =>
      reward.unlock.kind === "total" && reward.unlock.completionCount === totalCompletionCount,
  );

export const getStickerPalette = (sticker: StickerReward): ToyPalette =>
  sticker.topicId === "mixed"
    ? DEFAULT_TOY_PALETTE
    : getTopicVisual(sticker.topicId).palette;

export const getStickerLabel = (sticker: StickerReward): string =>
  sticker.id.startsWith("toy-explorer") ? "★" : sticker.id.charAt(0).toUpperCase();
