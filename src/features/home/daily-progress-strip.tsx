import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

interface DailyProgressStripProps {
  totalCount: number;
  completedCount: number;
  nextIndex: number;
  className?: string;
}

export default function DailyProgressStrip({
  totalCount,
  completedCount,
  nextIndex,
  className,
}: DailyProgressStripProps) {
  const { t } = useTranslation();

  const tokens = Array.from({ length: totalCount }, (_, index) => {
    const isDone = index < completedCount;
    const isNext = !isDone && index === nextIndex;
    return { index, isDone, isNext };
  });

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="list"
      aria-label={t("daily.title")}
    >
      {tokens.map(token => (
        <span
          key={token.index}
          role="listitem"
          aria-label={
            token.isDone
              ? t("daily.done")
              : token.isNext
                ? t("daily.next")
                : t("daily.title")
          }
          className={cn(
            "h-3 w-8 rounded-full transition-colors motion-reduce:transition-none sm:h-3.5 sm:w-10",
            token.isDone
              ? "bg-emerald-400 ring-2 ring-emerald-300"
              : token.isNext
                ? "bg-purple-400 ring-2 ring-purple-300"
                : "bg-gray-200 ring-1 ring-gray-200"
          )}
        />
      ))}
    </div>
  );
}
