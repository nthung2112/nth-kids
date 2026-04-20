import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, RotateCcw, Trophy, Heart, Shuffle } from "lucide-react";
import { useSound } from "../hooks/useSound";

const gameColors = [
  { name: "Đỏ", color: "#FF0000", lightColor: "#FFE6E6" },
  { name: "Vàng", color: "#FFD700", lightColor: "#FFFACD" },
  { name: "Xanh Lục", color: "#00AA00", lightColor: "#E6FFE6" },
  { name: "Xanh Lam", color: "#0066FF", lightColor: "#E6F2FF" },
  { name: "Tím", color: "#8A2BE2", lightColor: "#F0E6FF" },
  { name: "Cam", color: "#FF8C00", lightColor: "#FFE6CC" },
];

const encouragements = [
  "🎨 Tuyệt vời!",
  "🌈 Giỏi lắm!",
  "✨ Đúng rồi!",
  "🎊 Xuất sắc!",
  "💖 Thông minh quá!",
  "🏆 Siêu đỉnh!",
];

const tryAgainMessages = [
  "💪 Thử lại nhé!",
  "🤗 Đừng lo, thử tiếp!",
  "😊 Cố gắng lên!",
  "🌈 Lần sau sẽ đúng!",
];

interface ColorPair {
  id: number;
  name: string;
  color: string;
  lightColor: string;
  matched: boolean;
}

export default function ColorMatchingGame() {
  const { playSuccessSound, playErrorSound, playClickSound, playColorSound, playGameOverSound } =
    useSound();
  const [colorPairs, setColorPairs] = useState<ColorPair[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const initializeGame = () => {
    // Chọn 3 màu ngẫu nhiên cho game dễ hơn
    const selectedColors = gameColors.slice(0, 3);
    const pairs: ColorPair[] = [];

    selectedColors.forEach((color, index) => {
      // Tạo 2 thẻ cho mỗi màu (tên và màu)
      pairs.push({
        id: index * 2,
        name: color.name,
        color: color.color,
        lightColor: color.lightColor,
        matched: false,
      });
      pairs.push({
        id: index * 2 + 1,
        name: color.name,
        color: color.color,
        lightColor: color.lightColor,
        matched: false,
      });
    });

    // Trộn thẻ
    const shuffledPairs = pairs.sort(() => Math.random() - 0.5);
    setColorPairs(shuffledPairs);
    setSelectedCards([]);
    setMatchedPairs(0);
    setIsProcessing(false);
  };

  const handleCardClick = (cardId: number) => {
    if (isProcessing || selectedCards.includes(cardId) || colorPairs[cardId]?.matched) {
      return;
    }

    playClickSound();
    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsProcessing(true);
      const [firstId, secondId] = newSelected;
      const firstCard = colorPairs[firstId];
      const secondCard = colorPairs[secondId];

      setTimeout(() => {
        if (firstCard.name === secondCard.name) {
          // Đúng - ghép thành công
          playSuccessSound();
          setScore(score + 20);
          setMatchedPairs(matchedPairs + 1);
          setShowResult("correct");
          setResultMessage(encouragements[Math.floor(Math.random() * encouragements.length)]);

          // Đánh dấu thẻ đã ghép
          const updatedPairs = colorPairs.map((pair, index) =>
            index === firstId || index === secondId ? { ...pair, matched: true } : pair
          );
          setColorPairs(updatedPairs);

          // Kiểm tra thắng
          if (matchedPairs + 1 >= 3) {
            setTimeout(() => {
              playGameOverSound(true);
              setGameOver(true);
            }, 1500);
          }
        } else {
          // Sai
          playErrorSound();
          setLives(lives - 1);
          setShowResult("wrong");
          setResultMessage(tryAgainMessages[Math.floor(Math.random() * tryAgainMessages.length)]);

          if (lives - 1 <= 0) {
            setTimeout(() => {
              playGameOverSound(false);
              setGameOver(true);
            }, 1500);
          }
        }

        setTimeout(() => {
          setSelectedCards([]);
          setShowResult(null);
          setIsProcessing(false);
        }, 1500);
      }, 1000);
    }
  };

  const resetGame = () => {
    playClickSound();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setShowResult(null);
    initializeGame();
  };

  useEffect(() => {
    initializeGame();
  }, []);

  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8 bg-linear-to-br from-pink-100 to-purple-100 border-4 border-pink-300">
          <div className="text-6xl mb-4">{score >= 60 ? "🏆" : score >= 40 ? "🌈" : "🎨"}</div>

          <h2 className="text-4xl font-bold text-purple-800 mb-4">
            {score >= 60 ? "Siêu Xuất Sắc!" : score >= 40 ? "Giỏi Lắm!" : "Cố Gắng Lên!"}
          </h2>

          <div className="text-2xl text-purple-600 mb-6">
            <div className="mb-2">🎯 Điểm số: {score}</div>
            <div className="mb-2">🎨 Cặp đã ghép: {matchedPairs}/3</div>
            <div>🌈 Sao thưởng: {Math.floor(score / 20)}</div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={resetGame}
              className="bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xl px-8 py-4 rounded-full"
            >
              <RotateCcw className="mr-2" />
              Chơi Lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Thanh trạng thái */}
      <div className="flex justify-between items-center mb-8 bg-white rounded-full p-4 shadow-lg">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          <span className="text-xl font-bold text-purple-800">{score}</span>
        </div>

        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              className={`w-8 h-8 ${i < lives ? "text-red-500 fill-red-500" : "text-gray-300"}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-purple-600">{matchedPairs}/3</span>
        </div>
      </div>

      {/* Kết quả */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-md mx-4 text-center">
            <div className="text-8xl mb-4">{showResult === "correct" ? "🎨" : "😊"}</div>
            <div className="text-3xl font-bold text-purple-800 mb-4">{resultMessage}</div>
            {showResult === "correct" && (
              <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className="text-yellow-500 fill-yellow-500 w-8 h-8 animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Game board */}
      <Card className="p-8 mb-8 bg-linear-to-br from-pink-100 to-orange-100 border-4 border-pink-300">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">
          Ghép Cặp Màu Giống Nhau!
        </h2>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {colorPairs.map((pair, index) => (
            <Card
              key={pair.id}
              className={`h-24 cursor-pointer transform transition-all duration-300 border-4 ${
                pair.matched
                  ? "bg-green-100 border-green-400 scale-95 opacity-50"
                  : selectedCards.includes(index)
                    ? "bg-yellow-100 border-yellow-400 scale-105"
                    : "bg-white border-gray-300 hover:scale-105 hover:shadow-lg"
              } ${isProcessing && !selectedCards.includes(index) ? "pointer-events-none" : ""}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="h-full flex items-center justify-center">
                {selectedCards.includes(index) || pair.matched ? (
                  <div className="text-center">
                    <div
                      className="w-12 h-12 mx-auto mb-2 rounded-full border-2 border-gray-400"
                      style={{ backgroundColor: pair.color }}
                    />
                    <div className="text-sm font-bold text-gray-700">{pair.name}</div>
                  </div>
                ) : (
                  <div className="text-4xl">❓</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Hướng dẫn */}
      <div className="text-center text-lg text-purple-600 bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shuffle className="text-pink-500" />
          <span className="font-semibold">Lật thẻ và ghép cặp màu giống nhau!</span>
          <Shuffle className="text-pink-500" />
        </div>
        <div className="text-sm text-purple-500">Nhớ vị trí các thẻ để ghép thành công</div>
      </div>
    </div>
  );
}
