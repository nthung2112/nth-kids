import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toyButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-3xl border-4 font-black shadow-[0_8px_0_rgba(88,28,135,0.14)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_0_rgba(88,28,135,0.16)] focus-visible:ring-4 focus-visible:ring-purple-300 focus-visible:outline-hidden active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0",
  {
    variants: {
      tone: {
        primary: "border-purple-300 bg-linear-to-br from-purple-200 to-pink-200 text-purple-900",
        secondary: "border-sky-300 bg-linear-to-br from-sky-100 to-blue-200 text-sky-900",
        success:
          "border-emerald-300 bg-linear-to-br from-emerald-100 to-green-200 text-emerald-900",
        neutral: "border-gray-200 bg-white text-gray-800",
      },
      size: {
        md: "min-h-14 px-5 py-3 text-base",
        lg: "min-h-20 px-6 py-4 text-2xl",
      },
    },
    defaultVariants: {
      tone: "primary",
      size: "md",
    },
  }
);

interface ToyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof toyButtonVariants> {}

const ToyButton = React.forwardRef<HTMLButtonElement, ToyButtonProps>(
  ({ className, tone, size, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(toyButtonVariants({ tone, size }), className)}
      {...props}
    />
  )
);
ToyButton.displayName = "ToyButton";

export default ToyButton;
