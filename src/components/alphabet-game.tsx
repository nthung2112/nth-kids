import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, RotateCcw, Trophy, Heart } from "lucide-react";
import { useSound } from "../hooks/useSound";

const gameLetters = [
  { letter: "A", emoji: "🍎", word: "Apple" },
  { letter: "B", emoji: "⚽", word: "Ball" },
  { letter: "C", emoji: "🐱", word: "Cat" },
  { letter: "D", emoji: "🐶", word: "Dog" },
  { letter: "E", emoji: "🐘", word: "Elephant" },
  { letter: "F", emoji: "🐠", word: "Fish" },
  { letter: "G", emoji: "🍇", word: "Grape" },
  { letter: "H", emoji: "🐴", word: "Horse" },
  { letter: "I", emoji: "🍦", word: "Ice cream" },
  { letter: "J", emoji: "🍬", word: "Jelly" },
];

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

interface AlphabetQuestion {
  emoji: string;
  word: string;
  correctLetter: string;
  options: string[];
}

export default function AlphabetGame() {
  const { playSuccessSound, playErrorSound, playClickSound, playLetterSound, playGameOverSound } =
    useSound();
  const [currentQuestion, setCurrentQuestion] = useState<AlphabetQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const generateQuestion = () => {
    const randomLetter = gameLetters[Math.floor(Math.random() * gameLetters.length)];
    const correctLetter = randomLetter.letter;

    // Tạo 2 đáp án sai
    const wrongLetters: string[] = [];
    while (wrongLetters.length < 2) {
      const wrongLetter = String.fromCharCode(65 + Math.floor(Math.random() * 10)); // A-J
      if (wrongLetter !== correctLetter && !wrongLetters.includes(wrongLetter)) {
        wrongLetters.push(wrongLetter);
      }
    }

    // Trộn các đáp án
    const options = [correctLetter, ...wrongLetters].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      emoji: randomLetter.emoji,
      word: randomLetter.word,
      correctLetter,
      options,
    });
  };

  const handleAnswer = (selectedLetter: string) => {
    if (!currentQuestion) return;

    playClickSound();

    if (selectedLetter === currentQuestion.correctLetter) {
      playSuccessSound();
      setScore(score + 10);
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
  }, []);

  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8 bg-linear-to-br from-yellow-100 to-orange-100 border-4 border-yellow-300">
          <div className="text-6xl mb-4">{score >= 50 ? "🏆" : score >= 30 ? "🌟" : "💖"}</div>

          <h2 className="text-4xl font-bold text-purple-800 mb-4">
            {score >= 50 ? "Siêu Xuất Sắc!" : score >= 30 ? "Giỏi Lắm!" : "Cố Gắng Lên!"}
          </h2>

          <div className="text-2xl text-purple-600 mb-6">
            <div className="mb-2">🎯 Điểm số: {score}</div>
            <div className="mb-2">📝 Câu đã trả lời: {questionsAnswered}/10</div>
            <div>⭐ Sao thưởng: {Math.floor(score / 10)}</div>
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
          <span className="text-lg font-semibold text-purple-600">{questionsAnswered}/10</span>
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
      <Card className="p-8 mb-8 bg-linear-to-br from-green-100 to-blue-100 border-4 border-green-300">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">
          Chữ cái nào bắt đầu từ này?
        </h2>

        {/* Hiển thị emoji và từ */}
        <div className="text-center mb-8 p-6 bg-white rounded-2xl shadow-inner">
          <div className="text-8xl mb-4 animate-bounce">{currentQuestion.emoji}</div>
          <div className="text-2xl font-bold text-purple-700">{currentQuestion.word}</div>
        </div>

        {/* Các lựa chọn */}
        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map((letter) => (
            <Button
              key={letter}
              onClick={() => handleAnswer(letter)}
              onMouseEnter={() => playLetterSound(letter)}
              className="h-24 text-4xl font-bold bg-linear-to-br from-green-200 to-blue-200 hover:from-green-300 hover:to-blue-300 text-purple-800 border-4 border-green-300 rounded-2xl transform transition-all duration-300 hover:scale-105 active:scale-95"
              disabled={showResult !== null}
            >
              <div className="flex flex-col items-center">
                <div>{letter}</div>
                <div className="text-2xl">{letter.toLowerCase()}</div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Hướng dẫn */}
      <div className="text-center text-lg text-purple-600 bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>👆</span>
          <span className="font-semibold">Chọn chữ cái đúng nhé!</span>
          <span>👆</span>
        </div>
        <div className="text-sm text-purple-500">Tìm chữ cái bắt đầu của từ</div>
      </div>
    </div>
  );
}
