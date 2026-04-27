import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col px-4 pt-[max(env(safe-area-inset-top),16px)] pb-6 sm:px-6 lg:px-8 lg:pt-10 lg:pb-12",
        className
      )}
    >
      {children}
    </div>
  );
}
