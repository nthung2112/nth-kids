import { Link, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import AppShell from "@/components/layout/app-shell";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-lg font-semibold text-purple-800">Không tìm thấy trang.</p>
        <Link to="/" className="font-semibold text-purple-600 underline">
          Về trang chủ
        </Link>
      </div>
    );
  },
});

function RootComponent() {
  return (
    <>
      <AppShell />
      <TanStackRouterDevtools position="top-right" />
    </>
  );
}
