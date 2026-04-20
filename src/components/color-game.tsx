import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, RotateCcw, Trophy, Heart, Palette } from "lucide-react";
import { useSound } from "@/hooks/useSound";

const gameColors = [
  {
    name: "Đỏ",
    english: "Red",
    color: "#FF0000",
    bgColor: "bg-red-500",
    examples: ["🍎", "🌹", "❤️", "🍓"],
  },
  {
    name: "Vàng",
    english: "Yellow",
    color: "#FFFF00",
    bgColor: "bg-yellow-500",
    examples: ["☀️", "🍌", "⭐", "🌻"],
  },
  {
    name: "Xanh Lục",
    english: "Green",
    color: "#00FF00",
    bgColor: "bg-green-500",
    examples: ["🌳", "🍃", "🐸", "🥒"],
  },
  {
    name: "Xanh Lam",
    english: "Blue",
    color: "#0000FF",
    bgColor: "bg-blue-500",
    examples: ["🌊", "🐋", "💙", "🫐"],
  },
  {
    name: "Tím",
    english: "Purple",
    color: "#800080",
    bgColor: "bg-purple-500",
    examples: ["🍇", "💜", "🦄", "🔮"],
  },
];

const encouragements = [
  "🎨 Giỏi lắm!",
  "🌈 Tuyệt vời!",
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

interface ColorQuestion {
  emoji: string;
  correctColor: string;
  options: string[];
  colorName: string;
}

export default function ColorGame() {
  const { playSuccessSound, playErrorSound, playClickSound, playColorSound, playGameOverSound } =
    useSound();
  const [currentQuestion, setCurrentQuestion] = useState<ColorQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const generateQuestion = () => {
    const randomColor = gameColors[Math.floor(Math.random() * gameColors.length)];
    const randomEmoji =
      randomColor.examples[Math.floor(Math.random() * randomColor.examples.length)];

    // Tạo 2 màu sai
    const wrongColors: string[] = [];
    while (wrongColors.length < 2) {
      const wrongColor = gameColors[Math.floor(Math.random() * gameColors.length)];
      if (wrongColor.name !== randomColor.name && !wrongColors.includes(wrongColor.name)) {
        wrongColors.push(wrongColor.name);
      }
    }

    // Trộn các đáp án
    const options = [randomColor.name, ...wrongColors].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      emoji: randomEmoji,
      correctColor: randomColor.color,
      colorName: randomColor.name,
      options,
    });
  };

  const handleAnswer = (selectedColor: string) => {
    if (!currentQuestion) return;

    playClickSound();

    if (selectedColor === currentQuestion.colorName) {
      playSuccessSound();
      setScore(score + 15);
      setShowResult("correct");
      setResultMessage(encouragements[Math.floor(Math.random() * encouragements.length)]);
      setQuestionsAnswered(questionsAnswered + 1);

      setTimeout(() => {
        setShowResult(null);
        if (questionsAnswered + 1 >= 10) {
          playGameOverSound(true);
          setGameOver(true);
        } else {
          generateQuestion();
        }
      }, 2000);
      return;
    }
    playErrorSound();
    setLives(lives - 1);
    setShowResult("wrong");
    setResultMessage(tryAgainMessages[Math.floor(Math.random() * tryAgainMessages.length)]);

    if (lives - 1 <= 0) {
      setTimeout(() => {
        playGameOverSound(false);
        setGameOver(true);
      }, 2000);
    } else {
      setTimeout(() => {
        setShowResult(null);
        generateQuestion();
      }, 2000);
    }
  };

  const resetGame = () => {
    playClickSound();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setShowResult(null);
    setQuestionsAnswered(0);
    generateQuestion();
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8 bg-linear-to-br from-pink-100 to-purple-100 border-4 border-pink-300">
          <div className="text-6xl mb-4">{score >= 100 ? "🏆" : score >= 60 ? "🌈" : "🎨"}</div>

          <h2 className="text-4xl font-bold text-purple-800 mb-4">
            {score >= 100 ? "Siêu Xuất Sắc!" : score >= 60 ? "Giỏi Lắm!" : "Cố Gắng Lên!"}
          </h2>

          <div className="text-2xl text-purple-600 mb-6">
            <div className="mb-2">🎯 Điểm số: {score}</div>
            <div className="mb-2">📝 Câu đã trả lời: {questionsAnswered}/10</div>
            <div>🌈 Sao thưởng: {Math.floor(score / 15)}</div>
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

  if (!currentQuestion) {
    return <div className="text-center text-2xl">Đang tải...</div>;
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
          <span className="text-lg font-semibold text-purple-600">{questionsAnswered}/10</span>
        </div>
      </div>

      {/* Kết quả */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-md mx-4 text-center">
            <div className="text-8xl mb-4">{showResult === "correct" ? "🎨" : "😊"}</div>
            <div className="text-3xl font-bold text-purple-800 mb-4">{resultMessage}</div>
            {showResult === "correct" && (
              <div className="mb-4">
                <div className="text-lg text-purple-600 mb-2">Đúng rồi!</div>
                <div
                  className="w-16 h-16 mx-auto rounded-full border-4 border-purple-300"
                  style={{ backgroundColor: currentQuestion.correctColor }}
                />
                <div className="text-xl font-bold text-purple-700 mt-2">
                  {currentQuestion.colorName}
                </div>
              </div>
            )}
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

      {/* Câu hỏi */}
      <Card className="p-8 mb-8 bg-linear-to-br from-pink-100 to-orange-100 border-4 border-pink-300">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">Đây là màu gì?</h2>

        {/* Hiển thị emoji và màu */}
        <div className="text-center mb-8 p-6 bg-white rounded-2xl shadow-inner">
          <div className="text-8xl mb-4 animate-bounce">{currentQuestion.emoji}</div>
          <div
            className="w-24 h-24 mx-auto rounded-full border-4 border-gray-300 shadow-lg"
            style={{ backgroundColor: currentQuestion.correctColor }}
          />
        </div>

        {/* Các lựa chọn */}
        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map((colorName) => {
            const colorData = gameColors.find((c) => c.name === colorName);
            return (
              <Button
                key={colorName}
                onClick={() => handleAnswer(colorName)}
                onMouseEnter={() => playColorSound(colorName)}
                className="h-24 text-xl font-bold bg-linear-to-br from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-800 border-4 border-gray-300 rounded-2xl transform transition-all duration-300 hover:scale-105 active:scale-95"
                disabled={showResult !== null}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-400"
                    style={{ backgroundColor: colorData?.color }}
                  />
                  <div>{colorName}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Hướng dẫn */}
      <div className="text-center text-lg text-purple-600 bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Palette className="text-pink-500" />
          <span className="font-semibold">Nhìn màu và chọn tên đúng!</span>
          <Palette className="text-pink-500" />
        </div>
        <div className="text-sm text-purple-500">Nhận dạng màu sắc qua emoji và hình tròn màu</div>
      </div>
    </div>
  );
}
