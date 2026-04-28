import type { ToyPalette, ToyShapeKind } from "@/data/topics";
import { cn } from "@/lib/utils";

interface ShapePrimitiveProps {
  shape: ToyShapeKind;
  label: string;
  palette: ToyPalette;
  className?: string;
}

export default function ShapePrimitive({ shape, label, palette, className }: ShapePrimitiveProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-[2rem] border-4 shadow-lg",
        palette.secondary,
        palette.border,
        className
      )}
      aria-hidden="true"
    >
      {shape === "blocks" && (
        <>
          <div
            className={cn(
              "absolute top-[16%] left-[14%] h-[42%] w-[42%] rotate-[-8deg] rounded-2xl border-4 shadow-md",
              palette.primary,
              palette.border
            )}
          />
          <div
            className={cn(
              "absolute right-[14%] bottom-[16%] h-[42%] w-[42%] rotate-[8deg] rounded-2xl border-4 shadow-md",
              palette.accent,
              palette.border
            )}
          />
          <div
            className={cn(
              "relative z-10 flex h-[52%] w-[52%] items-center justify-center rounded-2xl border-4 bg-white text-4xl font-black drop-shadow-sm",
              palette.border,
              palette.text
            )}
          >
            {label}
          </div>
        </>
      )}

      {shape === "letters" && (
        <>
          <div
            className={cn(
              "absolute inset-[14%] rounded-[1.75rem] border-4 shadow-md",
              palette.primary,
              palette.border
            )}
          />
          <div
            className={cn("relative z-10 text-6xl font-black drop-shadow-sm", palette.onPrimary)}
          >
            {label}
          </div>
        </>
      )}

      {shape === "palette" && (
        <>
          <div
            className={cn(
              "absolute inset-[18%] rounded-[40%] border-4 shadow-md",
              palette.primary,
              palette.border
            )}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-2">
              <span className="h-5 w-5 rounded-full border-2 border-white bg-red-400 shadow-sm" />
              <span className="h-5 w-5 rounded-full border-2 border-white bg-amber-300 shadow-sm" />
              <span className="h-5 w-5 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />
              <span className="h-5 w-5 rounded-full border-2 border-white bg-sky-400 shadow-sm" />
              <span className="h-5 w-5 rounded-full border-2 border-white bg-purple-400 shadow-sm" />
              <span className="h-5 w-5 rounded-full border-2 border-white bg-pink-400 shadow-sm" />
            </div>
          </div>
          <div
            className={cn(
              "absolute right-3 bottom-2 rounded-full bg-white/90 px-2 py-0.5 text-sm font-black",
              palette.text
            )}
          >
            {label}
          </div>
        </>
      )}

      {shape === "shapes" && (
        <>
          <div
            className={cn(
              "absolute top-1/2 left-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-xl border-4 shadow-md",
              palette.primary,
              palette.border
            )}
          />
          <div
            className={cn(
              "absolute top-1/2 left-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 shadow-sm",
              palette.accent,
              palette.border
            )}
          />
          <div className={cn("relative z-10 text-4xl font-black drop-shadow-sm", palette.text)}>
            {label}
          </div>
        </>
      )}

      {shape === "cards" && (
        <>
          <div
            className={cn(
              "absolute top-[22%] left-[18%] h-[58%] w-[48%] -rotate-6 rounded-2xl border-4 bg-white shadow-md",
              palette.border
            )}
          />
          <div
            className={cn(
              "absolute top-[18%] right-[18%] h-[62%] w-[48%] rotate-6 rounded-2xl border-4 shadow-md",
              palette.primary,
              palette.border
            )}
          />
          <div
            className={cn(
              "relative z-10 flex h-[46%] w-[46%] items-center justify-center rounded-2xl border-4 bg-white text-4xl font-black",
              palette.border,
              palette.text
            )}
          >
            {label}
          </div>
        </>
      )}
    </div>
  );
}
