import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import ColorLearning from "@/components/color-learning";
import ColorGame from "@/components/color-game";
import ColorMatchingGame from "@/components/color-matching-game";
import ColoringGame from "@/components/coloring-game";
import PageLayout from "@/components/layout/page-layout";
import { useSound } from "@/hooks/useSound";

export const Route = createFileRoute("/colors")({
  component: ColorsPage,
});

function ColorsPage() {
  const { playClickSound } = useSound();
  const [showGame, setShowGame] = useState(false);
  const [colorGameMode, setColorGameMode] = useState<"basic" | "matching" | "coloring">("basic");

  return (
    <PageLayout>
      {/* Mode toggle and game mode selection */}
      <div className="text-center mb-6">
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <Button
            onClick={() => {
              playClickSound();
              setShowGame(!showGame);
            }}
            className="bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-6 py-3 rounded-full"
          >
            {showGame ? "📚 Học Bài" : "🎮 Chơi Game"}
          </Button>

          {/* Game mode cho màu sắc */}
          {showGame && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  playClickSound();
                  setColorGameMode("basic");
                }}
                className={`text-sm px-3 py-2 rounded-full ${
                  colorGameMode === "basic"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white hover:bg-gray-100 text-red-500 border-2 border-red-500"
                }`}
              >
                🎯 Nhận Dạng
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  setColorGameMode("matching");
                }}
                className={`text-sm px-3 py-2 rounded-full ${
                  colorGameMode === "matching"
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-100 text-blue-500 border-2 border-blue-500"
                }`}
              >
                🧩 Ghép Cặp
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  setColorGameMode("coloring");
                }}
                className={`text-sm px-3 py-2 rounded-full ${
                  colorGameMode === "coloring"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-white hover:bg-gray-100 text-green-500 border-2 border-green-500"
                }`}
              >
                🎨 Tô Màu
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Nội dung chính */}
      {!showGame ? (
        <ColorLearning />
      ) : colorGameMode === "basic" ? (
        <ColorGame />
      ) : colorGameMode === "matching" ? (
        <ColorMatchingGame />
      ) : (
        <ColoringGame />
      )}
    </PageLayout>
  );
}
