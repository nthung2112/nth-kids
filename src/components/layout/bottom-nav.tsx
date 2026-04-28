import { Link, useLocation } from "@tanstack/react-router";
import { Gamepad2, GraduationCap, Home, Settings, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

interface NavItem {
  path: "/" | "/learn" | "/game" | "/settings";
  labelKey: string;
  Icon: LucideIcon;
  matchPrefixes?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    path: "/",
    labelKey: "nav.home",
    Icon: Home,
  },
  {
    path: "/learn",
    labelKey: "nav.learn",
    Icon: GraduationCap,
    matchPrefixes: ["/learn"],
  },
  {
    path: "/game",
    labelKey: "nav.game",
    Icon: Gamepad2,
    matchPrefixes: ["/game"],
  },
  {
    path: "/settings",
    labelKey: "nav.settings",
    Icon: Settings,
    matchPrefixes: ["/settings"],
  },
];

const isActivePath = (pathname: string, item: NavItem): boolean => {
  if (item.path === "/") {
    return pathname === "/";
  }
  const prefixes = item.matchPrefixes ?? [item.path];
  return prefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

export default function BottomNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <nav
      aria-label={t("nav.mainNav")}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-purple-200/70 bg-white/90 pb-[max(env(safe-area-inset-bottom),6px)] backdrop-blur-md",
        "md:inset-x-auto md:right-auto md:bottom-4 md:left-1/2 md:w-[min(560px,calc(100vw-2rem))] md:-translate-x-1/2 md:rounded-full md:border md:border-purple-200/80 md:px-2 md:pb-2 md:shadow-2xl md:ring-1 md:ring-black/5"
      )}
    >
      {NAV_ITEMS.map(item => {
        const active = isActivePath(pathname, item);
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "relative flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-black transition-all motion-reduce:transition-none",
              "md:min-h-12 md:rounded-full md:px-3 md:py-2 md:text-xs",
              active ? "-translate-y-1 text-purple-800" : "text-gray-500 hover:text-purple-700"
            )}
            aria-current={active ? "page" : undefined}
            aria-label={t(item.labelKey)}
          >
            {active && (
              <>
                <span
                  className="pointer-events-none absolute bottom-0 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-purple-300 shadow-[0_2px_6px_rgba(139,92,246,0.35)] md:hidden"
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute inset-1 -z-10 hidden rounded-full bg-purple-100 md:block"
                  aria-hidden="true"
                />
              </>
            )}
            <item.Icon
              className={cn("h-6 w-6 sm:h-7 sm:w-7", active ? "stroke-[2.5]" : "stroke-2")}
              aria-hidden="true"
            />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
