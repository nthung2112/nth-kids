import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import ToyIllustration from "@/components/toys/toy-illustration";
import type { ToyStatus, ToyTileVariant } from "@/components/toys/toy-types";
import type { GameTopicId, GameTopicMeta, TopicMeta, ToyAssetRole } from "@/data/topics";
import { getTopicVisual } from "@/data/topics";
import { cn } from "@/lib/utils";

interface ToyTileProps {
  topic: TopicMeta | GameTopicMeta;
  variant?: ToyTileVariant;
  status?: ToyStatus;
  onSelect: () => void;
  className?: string;
  titleKey?: string;
  descriptionKey?: string;
  ariaLabel?: string;
  illustrationTopicId?: GameTopicId;
  illustrationAssetRole?: ToyAssetRole;
}

const STATUS_LABEL: Record<ToyStatus, string> = {
  new: "NEW",
  continue: "CONTINUE",
  locked: "LOCKED",
};

export default function ToyTile({
  topic,
  variant = "tile",
  status,
  onSelect,
  className,
  titleKey,
  descriptionKey,
  ariaLabel,
  illustrationTopicId,
  illustrationAssetRole,
}: ToyTileProps) {
  const { t } = useTranslation();
  const visual = getTopicVisual(topic.id);
  const isHero = variant === "hero";
  const isMini = variant === "mini";
  const resolvedTitleKey = titleKey ?? topic.homeTitleKey;
  const resolvedDescriptionKey = descriptionKey ?? topic.homeDescriptionKey;
  const resolvedAriaLabel = ariaLabel ?? t(resolvedTitleKey);
  const resolvedIllustrationTopicId = illustrationTopicId ?? topic.id;
  const resolvedIllustrationAssetRole = illustrationAssetRole ?? (isHero ? "hero" : "tile");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border-4 p-4 text-left shadow-xl transition-all hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-purple-300 focus-visible:outline-hidden active:translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0",
        visual.palette.surface,
        visual.palette.border,
        isHero ? "min-h-40 sm:min-h-48" : isMini ? "min-h-24" : "min-h-32",
        className
      )}
      aria-label={resolvedAriaLabel}
    >
      <div className="relative z-10 flex h-full items-center gap-4">
        <ToyIllustration
          topicId={resolvedIllustrationTopicId}
          assetRole={resolvedIllustrationAssetRole}
          className={cn(
            "shrink-0",
            isHero ? "h-28 w-28 sm:h-32 sm:w-32" : isMini ? "h-14 w-14" : "h-20 w-20"
          )}
        />
        <div className="min-w-0 flex-1">
          {status && (
            <div className="mb-1 text-xs font-black tracking-wide text-purple-500 uppercase">
              {STATUS_LABEL[status]}
            </div>
          )}
          <h3
            className={cn(
              "font-black",
              isHero ? "text-2xl sm:text-3xl" : isMini ? "text-lg" : "text-xl sm:text-2xl",
              visual.palette.text
            )}
          >
            {t(resolvedTitleKey)}
          </h3>
          {!isMini && (
            <p className="mt-1 line-clamp-2 text-sm font-bold text-gray-600">
              {t(resolvedDescriptionKey)}
            </p>
          )}
        </div>
        <ChevronRight
          className={cn("shrink-0", isHero ? "h-8 w-8" : "h-7 w-7", visual.palette.text)}
          aria-hidden="true"
        />
      </div>
    </button>
  );
}
