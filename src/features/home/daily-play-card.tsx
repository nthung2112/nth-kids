import { Link } from "@tanstack/react-router";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ToyBackdrop, ToyIllustration } from "@/components/toys";
import type { DailyPlayActivity } from "@/data/daily-play";
import { getTopicVisual } from "@/data/topics";
import DailyProgressStrip from "@/features/home/daily-progress-strip";
import type { UseDailyPlaylistReturn } from "@/hooks/useDailyPlaylist";
import { cn } from "@/lib/utils";

interface DailyPlayCardProps {
  state: UseDailyPlaylistReturn;
  className?: string;
}

interface DailyActivityTileProps {
  activity: DailyPlayActivity;
  status: "done" | "next" | "remaining";
}

function DailyActivityTile({ activity, status }: DailyActivityTileProps) {
  const { t } = useTranslation();
  const visual = getTopicVisual(activity.topicId);

  return (
    <Link
      to={activity.route}
      aria-label={t(activity.titleKey)}
      className={cn(
        "relative flex min-h-24 items-center gap-3 overflow-hidden rounded-[2rem] border-4 p-3 shadow-xl transition-all hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-purple-300 focus-visible:outline-hidden active:translate-y-1 motion-reduce:transition-none sm:p-4",
        visual.palette.surface,
        visual.palette.border,
        status === "done" && "opacity-80",
        status === "next" && "ring-2 ring-purple-400"
      )}
    >
      <ToyIllustration
        topicId={activity.topicId}
        assetRole="tile"
        className="h-14 w-14 shrink-0 sm:h-16 sm:w-16"
      />
      <div className="min-w-0 flex-1">
        <h3 className={cn("text-base font-black sm:text-lg", visual.palette.text)}>
          {t(activity.titleKey)}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-xs font-bold text-gray-600 sm:text-sm">
          {t(activity.descriptionKey)}
        </p>
      </div>
      {status === "done" ? (
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
          aria-hidden="true"
        >
          <Check className="h-5 w-5" />
        </span>
      ) : (
        <ChevronRight className={cn("h-6 w-6 shrink-0", visual.palette.text)} aria-hidden="true" />
      )}
    </Link>
  );
}

export default function DailyPlayCard({ state, className }: DailyPlayCardProps) {
  const { t } = useTranslation();
  const { activities, completedActivityIds, completedCount, totalCount, allDone, nextActivity } =
    state;

  const nextId = nextActivity?.id;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] border-4 border-white/70 bg-white/70 p-4 shadow-xl sm:p-5 lg:p-6",
        className
      )}
      aria-label={t("daily.title")}
    >
      <ToyBackdrop topicId={activities[0]?.topicId ?? "numbers"} className="absolute inset-0 opacity-50" />
      <div className="relative z-10 space-y-4">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-xs font-black tracking-wide text-purple-500 uppercase sm:text-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("daily.subtitle")}
            </p>
            <h2 className="mt-1 text-lg font-black text-purple-800 sm:text-xl">
              {t("daily.title")}
            </h2>
          </div>
          <DailyProgressStrip
            totalCount={totalCount}
            completedCount={completedCount}
            nextIndex={
              nextId ? activities.findIndex(activity => activity.id === nextId) : totalCount
            }
          />
        </header>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map(activity => {
            const isDone = completedActivityIds.has(activity.id);
            const isNext = activity.id === nextId;
            const status: DailyActivityTileProps["status"] = isDone
              ? "done"
              : isNext
                ? "next"
                : "remaining";
            return (
              <li key={activity.id}>
                <DailyActivityTile activity={activity} status={status} />
              </li>
            );
          })}
        </ul>

        {allDone && (
          <p className="text-center text-sm font-bold text-emerald-700 sm:text-base">
            {t("daily.allDone")} {t("daily.freePlay")}
          </p>
        )}
      </div>
    </section>
  );
}
