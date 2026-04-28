import type { ActivityId } from "@/data/rewards";
import type { GameTopicId } from "@/data/topics";

export type DailyPlayKind = "learn" | "game" | "mixed";

export interface DailyPlayActivity {
  id: string;
  activityId: ActivityId;
  route: string;
  topicId: GameTopicId;
  titleKey: string;
  descriptionKey: string;
  kind: DailyPlayKind;
  estimatedMinutes: 1 | 2 | 3;
  enabled?: boolean;
}

export const ENABLE_COLOR_SORTING_DAILY_ACTIVITY = true;
export const ENABLE_LETTER_SOUNDS_DAILY_ACTIVITY = false;

export const DAILY_PLAY_ACTIVITIES: readonly DailyPlayActivity[] = [
  {
    id: "learn-numbers",
    activityId: "learn:numbers",
    route: "/learn/numbers",
    topicId: "numbers",
    titleKey: "daily.activities.learn-numbers.title",
    descriptionKey: "daily.activities.learn-numbers.description",
    kind: "learn",
    estimatedMinutes: 2,
  },
  {
    id: "learn-letters",
    activityId: "learn:letters",
    route: "/learn/letters",
    topicId: "letters",
    titleKey: "daily.activities.learn-letters.title",
    descriptionKey: "daily.activities.learn-letters.description",
    kind: "learn",
    estimatedMinutes: 2,
  },
  {
    id: "learn-colors",
    activityId: "learn:colors",
    route: "/learn/colors",
    topicId: "colors",
    titleKey: "daily.activities.learn-colors.title",
    descriptionKey: "daily.activities.learn-colors.description",
    kind: "learn",
    estimatedMinutes: 2,
  },
  {
    id: "learn-shapes",
    activityId: "learn:shapes",
    route: "/learn/shapes",
    topicId: "shapes",
    titleKey: "daily.activities.learn-shapes.title",
    descriptionKey: "daily.activities.learn-shapes.description",
    kind: "learn",
    estimatedMinutes: 2,
  },
  {
    id: "game-numbers",
    activityId: "game:numbers",
    route: "/game/numbers",
    topicId: "numbers",
    titleKey: "daily.activities.game-numbers.title",
    descriptionKey: "daily.activities.game-numbers.description",
    kind: "game",
    estimatedMinutes: 3,
  },
  {
    id: "game-letters-alphabet",
    activityId: "game:letters:alphabet",
    route: "/game/letters/alphabet",
    topicId: "letters",
    titleKey: "daily.activities.game-letters-alphabet.title",
    descriptionKey: "daily.activities.game-letters-alphabet.description",
    kind: "game",
    estimatedMinutes: 3,
  },
  {
    id: "game-colors-identify",
    activityId: "game:colors:identify",
    route: "/game/colors/identify",
    topicId: "colors",
    titleKey: "daily.activities.game-colors-identify.title",
    descriptionKey: "daily.activities.game-colors-identify.description",
    kind: "game",
    estimatedMinutes: 3,
  },
  {
    id: "game-shapes",
    activityId: "game:shapes",
    route: "/game/shapes",
    topicId: "shapes",
    titleKey: "daily.activities.game-shapes.title",
    descriptionKey: "daily.activities.game-shapes.description",
    kind: "game",
    estimatedMinutes: 3,
  },
  {
    id: "game-flashcards",
    activityId: "game:flashcards",
    route: "/game/flashcards",
    topicId: "flashcards",
    titleKey: "daily.activities.game-flashcards.title",
    descriptionKey: "daily.activities.game-flashcards.description",
    kind: "mixed",
    estimatedMinutes: 3,
  },
  {
    id: "game-colors-sort",
    activityId: "game:colors:sort",
    route: "/game/colors/sort",
    topicId: "colors",
    titleKey: "daily.activities.game-colors-sort.title",
    descriptionKey: "daily.activities.game-colors-sort.description",
    kind: "game",
    estimatedMinutes: 3,
    enabled: ENABLE_COLOR_SORTING_DAILY_ACTIVITY,
  },
  {
    id: "game-letters-sounds",
    activityId: "game:letters:sounds",
    route: "/game/letters/sounds",
    topicId: "letters",
    titleKey: "daily.activities.game-letters-sounds.title",
    descriptionKey: "daily.activities.game-letters-sounds.description",
    kind: "game",
    estimatedMinutes: 3,
    enabled: ENABLE_LETTER_SOUNDS_DAILY_ACTIVITY,
  },
];

export const DAILY_PLAYLIST_SIZE = 3;

const hashDateKey = (dateKey: string): number => {
  let hash = 0;
  for (let index = 0; index < dateKey.length; index += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const pickIndexFromPool = <T,>(pool: readonly T[], seed: number): number => {
  if (pool.length === 0) return -1;
  return seed % pool.length;
};

export const getLocalDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getDailyPlaylist = (
  dateKey: string,
  activities: readonly DailyPlayActivity[] = DAILY_PLAY_ACTIVITIES
): DailyPlayActivity[] => {
  const available = activities.filter(activity => activity.enabled !== false);
  if (available.length === 0) return [];

  const learnPool = available.filter(activity => activity.kind === "learn");
  const gamePool = available.filter(activity => activity.kind === "game");
  const mixedPool = available.filter(activity => activity.kind === "mixed");

  const seed = hashDateKey(dateKey);
  const playlist: DailyPlayActivity[] = [];
  const usedIds = new Set<string>();
  const usedTopics = new Map<GameTopicId, number>();

  const tryPick = (pool: readonly DailyPlayActivity[], offset: number): void => {
    if (pool.length === 0) return;
    for (let attempt = 0; attempt < pool.length; attempt += 1) {
      const index = pickIndexFromPool(pool, seed + offset + attempt);
      if (index < 0) return;
      const candidate = pool[index];
      if (usedIds.has(candidate.id)) continue;
      const topicCount = usedTopics.get(candidate.topicId) ?? 0;
      if (topicCount >= 2) continue;
      playlist.push(candidate);
      usedIds.add(candidate.id);
      usedTopics.set(candidate.topicId, topicCount + 1);
      return;
    }
  };

  tryPick(learnPool, 0);
  tryPick(gamePool, 7);
  tryPick(mixedPool.length > 0 ? mixedPool : [...learnPool, ...gamePool], 13);

  if (playlist.length < DAILY_PLAYLIST_SIZE) {
    const fallback = available.filter(activity => !usedIds.has(activity.id));
    for (let index = 0; index < fallback.length && playlist.length < DAILY_PLAYLIST_SIZE; index += 1) {
      const candidate = fallback[(seed + index) % fallback.length];
      if (usedIds.has(candidate.id)) continue;
      playlist.push(candidate);
      usedIds.add(candidate.id);
    }
  }

  return playlist.slice(0, DAILY_PLAYLIST_SIZE);
};

export const isActivityCompletedOnDate = (
  lastCompletedAt: string | undefined,
  dateKey: string
): boolean => {
  if (!lastCompletedAt) return false;
  const date = new Date(lastCompletedAt);
  if (Number.isNaN(date.getTime())) return false;
  return getLocalDateKey(date) === dateKey;
};
