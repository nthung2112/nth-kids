import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, RotateCcw, Trophy, Heart } from "lucide-react";
import { useSound } from "../hooks/useSound";

const gameEmojis = ["🍎", "🐱", "🌸", "🦋", "⭐", "🐠", "🎈", "🎁", "🌈", "🐝"];

const encouragements = [
  "🎉 Giỏi lắm!",
  "⭐ Tuyệt vời!",
  "🌟 Đúng rồi!",
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

interface GameQuestion {
  emoji: string;
  count: number;
  options: number[];
  correctAnswer: number;
}

interface CountingGameProps {
  maxNumber: number;
}

export default function CountingGame({ maxNumber }: CountingGameProps) {
  const {
    playSuccessSound,
    playErrorSound,
    playClickSound,
    playNumberSound,
    playGameOverSound,
    playCountingSound,
  } = useSound();
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  // Điều chỉnh độ khó dựa trên maxNumber
  const getGameSettings = () => {
    if (maxNumber <= 10) {
      return {
        maxCount: 5,
        totalQuestions: 10,
        pointsPerQuestion: 10,
      };
    } else if (maxNumber <= 30) {
      return {
        maxCount: 8,
        totalQuestions: 12,
        pointsPerQuestion: 12,
      };
    } else {
      return {
        maxCount: 10,
        totalQuestions: 15,
        pointsPerQuestion: 15,
      };
    }
  };

  const gameSettings = getGameSettings();

  const generateQuestion = () => {
    const count = Math.floor(Math.random() * gameSettings.maxCount) + 1;
    const emoji = gameEmojis[Math.floor(Math.random() * gameEmojis.length)];
    const correctAnswer = count;

    // Tạo 2 đáp án sai trong phạm vi phù hợp
    const wrongAnswers = [];
    const maxOption = Math.min(maxNumber, gameSettings.maxCount + 2);

    while (wrongAnswers.length < 2) {
      const wrong = Math.floor(Math.random() * maxOption) + 1;
      if (wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
        wrongAnswers.push(wrong);
      }
    }

    // Trộn các đáp án
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      emoji,
      count,
      options,
      correctAnswer,
    });

    // Phát âm thanh đếm (chỉ cho số nhỏ)
    if (count <= 10) {
      setTimeout(() => {
        playCountingSound(count);
      }, 1000);
    }
  };

  const handleAnswer = (selectedAnswer: number) => {
    if (!currentQuestion) return;

    playClickSound();

    if (selectedAnswer === currentQuestion.correctAnswer) {
      playSuccessSound();
      setScore(score + gameSettings.pointsPerQuestion);
      setShowResult("correct");
      setResultMessage(encouragements[Math.floor(Math.random() * encouragements.length)]);
      setQuestionsAnswered(questionsAnswered + 1);

      setTimeout(() => {
        setShowResult(null);
        if (questionsAnswered + 1 >= gameSettings.totalQuestions) {
          playGameOverSound(true);
          setGameOver(true);
        } else {
          generateQuestion();
        }
      }, 2000);
    } else {
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
  }, [maxNumber]);

  if (gameOver) {
    const maxScore = gameSettings.totalQuestions * gameSettings.pointsPerQuestion;
    const winThreshold = maxScore * 0.7;
    const goodThreshold = maxScore * 0.5;

    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8 bg-linear-to-br from-yellow-100 to-orange-100 border-4 border-yellow-300">
          <div className="text-6xl mb-4">
            {score >= winThreshold ? "🏆" : score >= goodThreshold ? "🌟" : "💖"}
          </div>

          <h2 className="text-4xl font-bold text-purple-800 mb-4">
            {score >= winThreshold
              ? "Siêu Xuất Sắc!"
              : score >= goodThreshold
                ? "Giỏi Lắm!"
                : "Cố Gắng Lên!"}
          </h2>

          <div className="text-2xl text-purple-600 mb-6">
            <div className="mb-2">
              🎯 Điểm số: {score}/{maxScore}
            </div>
            <div className="mb-2">
              📝 Câu đã trả lời: {questionsAnswered}/{gameSettings.totalQuestions}
            </div>
            <div>⭐ Sao thưởng: {Math.floor(score / gameSettings.pointsPerQuestion)}</div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={resetGame}
              className="bg-linear-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-xl px-8 py-4 rounded-full"
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
          <span className="text-lg font-semibold text-purple-600">
            {questionsAnswered}/{gameSettings.totalQuestions}
          </span>
        </div>
      </div>

      {/* Kết quả */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-md mx-4 text-center">
            <div className="text-8xl mb-4">{showResult === "correct" ? "🎉" : "😊"}</div>
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

      {/* Câu hỏi */}
      <Card className="p-8 mb-8 bg-linear-to-br from-blue-100 to-purple-100 border-4 border-blue-300">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">
          Đếm xem có bao nhiêu?
        </h2>

        {/* Hiển thị emoji để đếm */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 p-6 bg-white rounded-2xl shadow-inner">
          {[...Array(currentQuestion.count)].map((_, index) => (
            <span
              key={index}
              className="text-6xl animate-bounce"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {currentQuestion.emoji}
            </span>
          ))}
        </div>

        {/* Các lựa chọn */}
        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map((option) => (
            <Button
              key={option}
              onClick={() => handleAnswer(option)}
              onMouseEnter={() => playNumberSound(option)}
              className="h-24 text-4xl font-bold bg-linear-to-br from-pink-200 to-purple-200 hover:from-pink-300 hover:to-purple-300 text-purple-800 border-4 border-purple-300 rounded-2xl transform transition-all duration-300 hover:scale-105 active:scale-95"
              disabled={showResult !== null}
            >
              {option}
            </Button>
          ))}
        </div>
      </Card>

      {/* Hướng dẫn */}
      <div className="text-center text-lg text-purple-600 bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>👆</span>
          <span className="font-semibold">Nhấn vào số đúng nhé!</span>
          <span>👆</span>
        </div>
        <div className="text-sm text-purple-500">
          Đếm các hình và chọn số tương ứng (1-
          {Math.min(maxNumber, gameSettings.maxCount)})
        </div>
      </div>
    </div>
  );
}
