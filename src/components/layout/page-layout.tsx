import type { ReactNode } from "react";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import SettingsTrigger from "@/components/settings/settings-trigger";

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-linear-to-br from-sky-200 via-purple-200 to-pink-200">
      <SettingsTrigger />
      <Header />
      <main className="flex flex-1 flex-col px-3 pb-3 sm:px-4 sm:pb-4">{children}</main>
      <Footer />
    </div>
  );
}
