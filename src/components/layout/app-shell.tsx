import { Outlet, useLocation } from "@tanstack/react-router";

import BottomNav from "@/components/layout/bottom-nav";
import { isImmersivePath } from "@/data/topics";
import { cn } from "@/lib/utils";

export default function AppShell() {
  const { pathname } = useLocation();
  const immersive = isImmersivePath(pathname);

  return (
    <div
      className="relative flex min-h-dvh w-full flex-col bg-linear-to-br from-sky-200 via-purple-200 to-pink-200"
      data-immersive={immersive ? "true" : "false"}
    >
      <main
        className={cn(
          "flex flex-1 flex-col",
          !immersive && "pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-28"
        )}
      >
        <Outlet />
      </main>

      {!immersive && <BottomNav />}
    </div>
  );
}
