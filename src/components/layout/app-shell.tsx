import { Outlet, useLocation } from "@tanstack/react-router";

import BottomNav from "@/components/layout/bottom-nav";
import { isImmersivePath } from "@/data/topics";
import { cn } from "@/lib/utils";

export default function AppShell() {
  const { pathname } = useLocation();
  const immersive = isImmersivePath(pathname);

  return (
    <div className="relative min-h-dvh bg-slate-200 lg:flex lg:items-center lg:justify-center lg:p-6">
      <div
        className="relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-linear-to-br from-sky-200 via-purple-200 to-pink-200 lg:h-[min(96dvh,920px)] lg:w-[min(480px,96vw)] lg:rounded-[2.75rem] lg:shadow-2xl lg:ring-8 lg:ring-slate-900/10"
        data-immersive={immersive ? "true" : "false"}
      >
        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto",
            !immersive && "pb-[calc(64px+env(safe-area-inset-bottom))]"
          )}
        >
          <Outlet />
        </main>

        {!immersive && <BottomNav />}
      </div>
    </div>
  );
}
