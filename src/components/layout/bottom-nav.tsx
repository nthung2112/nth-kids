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
      className="absolute inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-purple-200/70 bg-white/90 backdrop-blur-md pb-[max(env(safe-area-inset-bottom),6px)]"
    >
      {NAV_ITEMS.map(item => {
        const active = isActivePath(pathname, item);
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "relative flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-bold transition-colors motion-reduce:transition-none",
              active ? "text-purple-700" : "text-gray-500 hover:text-purple-600"
            )}
            aria-current={active ? "page" : undefined}
            aria-label={t(item.labelKey)}
          >
            {active && (
              <span
                className="pointer-events-none absolute inset-x-4 top-0 h-[3px] rounded-b-full bg-purple-500"
                aria-hidden="true"
              />
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
