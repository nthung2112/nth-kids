import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AlphabetLearning from "@/components/alphabet-learning";
import AlphabetGame from "@/components/alphabet-game";
import SequenceGame from "@/components/sequence-game";
import PageLayout from "@/components/layout/page-layout";
import { useSound } from "@/hooks/useSound";

export const Route = createFileRoute("/letters")({
  component: LettersPage,
});

function LettersPage() {
  const { playClickSound } = useSound();
  const [showGame, setShowGame] = useState(false);
  const [gameMode, setGameMode] = useState<"basic" | "sequence">("basic");

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

          {/* Game mode cho chữ cái */}
          {showGame && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  playClickSound();
                  setGameMode("basic");
                }}
                className={`text-sm px-4 py-2 rounded-full ${
                  gameMode === "basic"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-white hover:bg-gray-100 text-orange-500 border-2 border-orange-500"
                }`}
              >
                🎯 Cơ Bản
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  setGameMode("sequence");
                }}
                className={`text-sm px-4 py-2 rounded-full ${
                  gameMode === "sequence"
                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                    : "bg-white hover:bg-gray-100 text-purple-500 border-2 border-purple-500"
                }`}
              >
                🧠 Chuỗi Chữ
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Nội dung chính */}
      {!showGame ? (
        <AlphabetLearning />
      ) : gameMode === "basic" ? (
        <AlphabetGame />
      ) : (
        <SequenceGame />
      )}
    </PageLayout>
  );
}
