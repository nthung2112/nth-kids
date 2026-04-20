import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, RotateCcw, Trophy, Heart, HelpCircle, ArrowRight } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import GameTutorial from "./game-tutorial";

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

interface SequenceQuestion {
  sequence: string[];
  correctAnswer: string;
  options: string[];
}

export default function SequenceGame() {
  const {
    playSuccessSound,
    playErrorSound,
    playClickSound,
    playLetterSound,
    playGameOverSound,
    playSequenceSound,
  } = useSound();
  const [currentQuestion, setCurrentQuestion] = useState<SequenceQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const generateQuestion = () => {
    // Tạo chuỗi 3 chữ cái liên tiếp từ A-T (để đảm bảo có chữ tiếp theo)
    const startIndex = Math.floor(Math.random() * 20); // A=0, T=19
    const sequence = [
      String.fromCharCode(65 + startIndex), // Chữ đầu
      String.fromCharCode(65 + startIndex + 1), // Chữ thứ 2
      String.fromCharCode(65 + startIndex + 2), // Chữ thứ 3
    ];
    const correctAnswer = String.fromCharCode(65 + startIndex + 3); // Chữ tiếp theo

    // Tạo 2 đáp án sai
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
      const wrongIndex = Math.floor(Math.random() * 26);
      // Tránh đáp án đúng và các đáp án đã có
      if (wrongIndex !== startIndex + 3 && !wrongAnswers.includes(wrongIndex)) {
        // Ưu tiên các chữ cái gần để tăng độ khó
        if (Math.abs(wrongIndex - (startIndex + 3)) <= 3 || Math.random() < 0.3) {
          wrongAnswers.push(String.fromCharCode(65 + wrongIndex));
        }
      }
    }

    // Trộn các đáp án
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      sequence,
      correctAnswer,
      options,
    });

    // Phát âm thanh chuỗi sau 1 giây
    setTimeout(() => {
      playSequenceSound(sequence);
    }, 1000);
  };

  const handleAnswer = (selectedAnswer: string) => {
    if (!currentQuestion) return;

    playClickSound();

    if (selectedAnswer === currentQuestion.correctAnswer) {
      playSuccessSound();
      setScore(score + 15); // Điểm cao hơn vì khó hơn
      setShowResult("correct");
      setResultMessage(encouragements[Math.floor(Math.random() * encouragements.length)]);
      setQuestionsAnswered(questionsAnswered + 1);

      setTimeout(() => {
        setShowResult(null);
        if (questionsAnswered + 1 >= 8) {
          // Chỉ 8 câu vì khó hơn
          playGameOverSound(true);
          setGameOver(true);
        } else {
          generateQuestion();
        }
      }, 2500); // Thời gian dài hơn để trẻ hiểu
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
          <div className="text-6xl mb-4">{score >= 75 ? "🏆" : score >= 45 ? "🌟" : "💖"}</div>

          <h2 className="text-4xl font-bold text-purple-800 mb-4">
            {score >= 75 ? "Siêu Xuất Sắc!" : score >= 45 ? "Giỏi Lắm!" : "Cố Gắng Lên!"}
          </h2>

          <div className="text-2xl text-purple-600 mb-6">
            <div className="mb-2">🎯 Điểm số: {score}</div>
            <div className="mb-2">📝 Câu đã trả lời: {questionsAnswered}/8</div>
            <div>⭐ Sao thưởng: {Math.floor(score / 15)}</div>
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            <span className="text-xl font-bold text-purple-800">{score}</span>
          </div>

          <Button
            onClick={() => setShowTutorial(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-full"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Hướng dẫn
          </Button>
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
          <span className="text-lg font-semibold text-purple-600">{questionsAnswered}/8</span>
        </div>
      </div>

      {/* Kết quả */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-md mx-4 text-center">
            <div className="text-8xl mb-4">{showResult === "correct" ? "🎉" : "😊"}</div>
            <div className="text-3xl font-bold text-purple-800 mb-4">{resultMessage}</div>
            {showResult === "correct" && (
              <div className="mb-4">
                <div className="text-lg text-purple-600 mb-2">Chuỗi hoàn chỉnh:</div>
                <div className="flex justify-center items-center gap-2">
                  {currentQuestion.sequence.map((letter, index) => (
                    <div key={index} className="flex items-center">
                      <div className="text-2xl font-bold text-blue-600 bg-blue-100 rounded-lg p-2 border-2 border-blue-300">
                        {letter}
                      </div>
                      {index < currentQuestion.sequence.length && (
                        <ArrowRight className="text-blue-500 mx-1" />
                      )}
                    </div>
                  ))}
                  <div className="text-2xl font-bold text-green-600 bg-green-100 rounded-lg p-2 border-2 border-green-300">
                    {currentQuestion.correctAnswer}
                  </div>
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
      <Card className="p-8 mb-8 bg-linear-to-br from-purple-100 to-pink-100 border-4 border-purple-300">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">
          Chữ cái tiếp theo là gì?
        </h2>

        {/* Hiển thị chuỗi chữ cái */}
        <div className="flex justify-center items-center gap-4 mb-8 p-6 bg-white rounded-2xl shadow-inner">
          {currentQuestion.sequence.map((letter, index) => (
            <div key={index} className="flex items-center">
              <div
                className="text-6xl font-bold text-purple-700 bg-purple-100 rounded-2xl p-4 border-4 border-purple-300 animate-bounce"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {letter}
              </div>
              {index < currentQuestion.sequence.length - 1 && (
                <ArrowRight className="text-purple-500 mx-2" />
              )}
            </div>
          ))}
          <ArrowRight className="text-purple-500 mx-2" />
          <div className="text-6xl font-bold text-gray-400 bg-gray-100 rounded-2xl p-4 border-4 border-gray-300 border-dashed">
            ?
          </div>
        </div>

        {/* Các lựa chọn */}
        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map((letter) => (
            <Button
              key={letter}
              onClick={() => handleAnswer(letter)}
              onMouseEnter={() => playLetterSound(letter)}
              className="h-24 text-4xl font-bold bg-linear-to-br from-purple-200 to-pink-200 hover:from-purple-300 hover:to-pink-300 text-purple-800 border-4 border-purple-300 rounded-2xl transform transition-all duration-300 hover:scale-105 active:scale-95"
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
          <span>🧠</span>
          <span className="font-semibold">Tìm chữ cái tiếp theo trong chuỗi!</span>
          <span>🧠</span>
        </div>
        <div className="text-sm text-purple-500">Quan sát thứ tự và chọn chữ cái đúng</div>
      </div>

      {/* Tutorial */}
      {showTutorial && <GameTutorial onClose={() => setShowTutorial(false)} />}
    </div>
  );
}
