import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

interface ImmersiveViewProps {
  children: ReactNode;
  exitTo: "/learn" | "/game" | "/";
  exitLabel?: string;
  className?: string;
  onBeforeExit?: () => void;
  topRightExtra?: ReactNode;
}

export default function ImmersiveView({
  children,
  exitTo,
  exitLabel,
  className,
  onBeforeExit,
  topRightExtra,
}: ImmersiveViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleExit = () => {
    onBeforeExit?.();
    navigate({ to: exitTo });
  };

  const label = exitLabel ?? t("common.exit");

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col px-3 pt-[max(env(safe-area-inset-top),12px)] pb-4 sm:px-4",
        className
      )}
    >
      <div className="pointer-events-none absolute top-[max(env(safe-area-inset-top),10px)] right-3 z-30 flex items-center gap-2 sm:right-4">
        {topRightExtra && <div className="pointer-events-auto">{topRightExtra}</div>}
        <button
          type="button"
          onClick={handleExit}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg ring-1 ring-black/5 backdrop-blur-sm transition-all hover:scale-105 hover:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-purple-400 active:scale-95 motion-reduce:transition-none sm:h-14 sm:w-14"
          aria-label={label}
          title={label}
        >
          <X className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
