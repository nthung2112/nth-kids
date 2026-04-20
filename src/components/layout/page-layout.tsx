import SoundControl from "@/components/sound-control";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import type { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  onShowSettings?: () => void;
  showSettingsButton?: boolean;
}

export default function PageLayout({
  children,
  onShowSettings,
  showSettingsButton = false,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-sky-200 via-purple-200 to-pink-200 p-4">
      <SoundControl />
      <Header onShowSettings={onShowSettings} showSettingsButton={showSettingsButton} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
