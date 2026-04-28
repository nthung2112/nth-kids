import { useMemo } from "react";

import {
  DAILY_PLAY_ACTIVITIES,
  getDailyPlaylist,
  getLocalDateKey,
  isActivityCompletedOnDate,
  type DailyPlayActivity,
} from "@/data/daily-play";
import { usePreferences } from "@/hooks/usePreferences";
import { useRewardProgress } from "@/hooks/useRewardProgress";

export interface UseDailyPlaylistReturn {
  enabled: boolean;
  dateKey: string;
  activities: DailyPlayActivity[];
  completedActivityIds: ReadonlySet<string>;
  nextActivity: DailyPlayActivity | null;
  completedCount: number;
  totalCount: number;
  allDone: boolean;
}

export function useDailyPlaylist(): UseDailyPlaylistReturn {
  const { prefs } = usePreferences();
  const { progress } = useRewardProgress();

  const dateKey = useMemo(() => getLocalDateKey(), []);

  const activities = useMemo(
    () => getDailyPlaylist(dateKey, DAILY_PLAY_ACTIVITIES),
    [dateKey]
  );

  const completedActivityIds = useMemo(() => {
    const completed = new Set<string>();
    for (const activity of activities) {
      const entry = progress.activityCompletions[activity.activityId];
      if (isActivityCompletedOnDate(entry?.lastCompletedAt, dateKey)) {
        completed.add(activity.id);
      }
    }
    return completed;
  }, [activities, dateKey, progress.activityCompletions]);

  const nextActivity = activities.find(activity => !completedActivityIds.has(activity.id)) ?? null;
  const totalCount = activities.length;
  const completedCount = completedActivityIds.size;
  const allDone = totalCount > 0 && completedCount >= totalCount;

  return {
    enabled: prefs.showGuidedPlay && activities.length > 0,
    dateKey,
    activities,
    completedActivityIds,
    nextActivity,
    completedCount,
    totalCount,
    allDone,
  };
}
