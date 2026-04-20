import { createFileRoute } from "@tanstack/react-router";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, RotateCcw } from "lucide-react";
import CountingGame from "@/components/counting-game";
import { useSound } from "@/hooks/useSound";
import NumberSettings from "@/components/number-settings";
import PageLayout from "@/components/layout/page-layout";
import { generateNumberData, getNumberDisplayInfo, type NumberData } from "@/utils/numberGenerator";

export const Route = createFileRoute("/numbers")({
  component: NumbersPage,
});
function NumbersPage() {
  const { playClickSound, playNumberSound, playCountingSound } = useSound();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [maxNumber, setMaxNumber] = useState(10);
  const [numbers, setNumbers] = useState<NumberData[]>([]);

  // Tạo dữ liệu số khi maxNumber thay đổi
  useEffect(() => {
    setNumbers(generateNumberData(maxNumber));
  }, [maxNumber]);

  // Lưu cài đặt vào localStorage
  useEffect(() => {
    const saved = localStorage.getItem("maxNumber");
    if (saved) {
      setMaxNumber(Number.parseInt(saved));
    }
  }, []);

  const handleMaxNumberChange = (newMax: number) => {
    setMaxNumber(newMax);
    localStorage.setItem("maxNumber", newMax.toString());
  };

  const handleNumberClick = (num: number) => {
    playClickSound();
    playNumberSound(num);
    setSelectedNumber(num);
    setShowCelebration(true);

    // Phát âm thanh đếm (giới hạn cho số nhỏ)
    if (num <= 10) {
      setTimeout(() => {
        playCountingSound(num);
      }, 500);
    }

    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
  };

  const resetSelection = () => {
    setSelectedNumber(null);
    setShowCelebration(false);
  };

  const playSound = () => {
    console.log("Phát âm thanh số:", selectedNumber);
  };

  const displayInfo = getNumberDisplayInfo(maxNumber);

  return (
    <PageLayout onShowSettings={() => setShowSettings(true)} showSettingsButton={true}>
      {/* Mode toggle and settings info */}
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
        </div>

        {/* Hiển thị phạm vi hiện tại */}
        <div className="text-sm text-purple-600 bg-white/50 rounded-full px-4 py-1 inline-block">
          Đang học: 1 - {maxNumber} (
          {maxNumber <= 10 ? "Cơ bản" : maxNumber <= 30 ? "Nâng cao" : "Khó"})
        </div>
      </div>

      {/* Hiển thị số được chọn */}
      {selectedNumber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-md mx-4 text-center relative">
            {showCelebration && (
              <div className="absolute -top-4 -left-4 -right-4 -bottom-4 pointer-events-none">
                <div className="animate-bounce text-6xl">🎉</div>
                <div className="absolute top-4 right-4 animate-spin text-4xl">⭐</div>
                <div className="absolute bottom-4 left-4 animate-pulse text-4xl">🎊</div>
              </div>
            )}

            <div className="text-8xl font-bold text-purple-800 mb-4">{selectedNumber}</div>

            <div className="text-3xl font-bold text-purple-600 mb-4">
              {numbers.find((n) => n.number === selectedNumber)?.vietnamese}
            </div>

            {/* Hiển thị items (giới hạn cho số lớn) */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {selectedNumber <= 10 ? (
                // Hiển thị đầy đủ cho số nhỏ
                numbers
                  .find((n) => n.number === selectedNumber)
                  ?.items.map((item, index) => (
                    <span
                      key={`${selectedNumber}-item-${index}-${item}`}
                      className="text-4xl animate-bounce"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {item}
                    </span>
                  ))
              ) : (
                // Hiển thị rút gọn cho số lớn
                <div className="text-center">
                  <div className="text-6xl mb-2">
                    {numbers.find((n) => n.number === selectedNumber)?.emoji}
                  </div>
                  <div className="text-lg text-purple-600">
                    {selectedNumber} {numbers.find((n) => n.number === selectedNumber)?.emoji}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  playClickSound();
                  playSound();
                }}
                className="bg-green-500 hover:bg-green-600 text-white text-lg px-6 py-3"
              >
                <Volume2 className="mr-2" />
                Nghe
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  resetSelection();
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white text-lg px-6 py-3"
              >
                <RotateCcw className="mr-2" />
                Đóng
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Nội dung chính */}
      {!showGame ? (
        // Lưới số với layout động
        <div className={`grid ${displayInfo.gridCols} gap-3 max-w-7xl mx-auto`}>
          {numbers.map((item) => (
            <Card
              key={item.number}
              className={`${item.color} border-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 ${displayInfo.cardSize} text-center`}
              onClick={() => handleNumberClick(item.number)}
            >
              <div className={`${displayInfo.numberSize} font-bold text-gray-800 mb-2`}>
                {item.number}
              </div>
              <div className="text-lg md:text-xl font-bold text-gray-700 mb-2 leading-tight">
                {item.vietnamese}
              </div>
              <div className={`${displayInfo.emojiSize} mb-2`}>{item.emoji}</div>

              {/* Hiển thị items cho số nhỏ */}
              {item.number <= 10 && displayInfo.showAllItems && (
                <div className="flex flex-wrap justify-center gap-1">
                  {item.items.slice(0, Math.min(5, item.items.length)).map((emoji, index) => (
                    <span key={`${item.number}-grid-${index}-${emoji}`} className="text-sm">
                      {emoji}
                    </span>
                  ))}
                  {item.items.length > 5 && <span className="text-xs text-gray-600">...</span>}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <CountingGame maxNumber={maxNumber} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <NumberSettings
          currentMax={maxNumber}
          onMaxChange={handleMaxNumberChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </PageLayout>
  );
}
