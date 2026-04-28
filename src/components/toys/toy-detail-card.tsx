import type { ReactNode } from "react";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import type { ToyPalette } from "@/data/topics";
import { cn } from "@/lib/utils";

interface ToyDetailCardProps {
  onClose: () => void;
  title: string;
  visual: ReactNode;
  controls: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  palette?: ToyPalette;
}

export default function ToyDetailCard({
  onClose,
  title,
  visual,
  controls,
  children,
  footer,
  palette,
}: ToyDetailCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <Card
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-[2rem] border-4 bg-white p-5 shadow-2xl sm:p-7",
          palette?.border
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border-4 border-gray-200 bg-white text-gray-600 shadow-md transition-transform hover:-translate-y-0.5 hover:bg-gray-50 focus-visible:ring-4 focus-visible:ring-purple-300 focus-visible:outline-hidden active:translate-y-0.5 motion-reduce:transition-none"
          aria-label={t("common.close")}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className={cn("w-full max-w-[14rem]")}>{visual}</div>

          <h2 className={cn("text-3xl font-black sm:text-4xl", palette?.text ?? "text-purple-800")}>
            {title}
          </h2>

          {children && (
            <div className="w-full text-base font-bold text-gray-600 sm:text-lg">{children}</div>
          )}

          <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-3">
            {controls}
          </div>

          {footer && <div className="mt-3 w-full">{footer}</div>}
        </div>
      </Card>
    </div>
  );
}
