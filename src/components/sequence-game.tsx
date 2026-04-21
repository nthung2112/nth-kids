import { useEffect, useState } from "react";

import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import FeedbackModal from "@/components/games/feedback-modal";
import GameHud from "@/components/games/game-hud";
import GameResult from "@/components/games/game-result";
import GameTutorial from "@/components/games/game-tutorial";
import { SEQUENCE_EXAMPLES } from "@/components/games/tutorial-examples";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GAME_CONFIGS } from "@/config/games";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useSound } from "@/hooks/useSound";

interface SequenceQuestion {
  sequence: string[];
  correctAnswer: string;
  options: string[];
}

const config = { ...GAME_CONFIGS.sequence, feedbackMs: 2500 };

export default function SequenceGame() {
  const { t } = useTranslation();
  const { playClickSound, playLetterSound, playSequenceSound } = useSound();
  const engine = useGameEngine(config);

  const [currentQuestion, setCurrentQuestion] = useState<SequenceQuestion | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const generateQuestion = () => {
    const startIndex = Math.floor(Math.random() * 20);
    const sequence = [
      String.fromCharCode(65 + startIndex),
      String.fromCharCode(65 + startIndex + 1),
      String.fromCharCode(65 + startIndex + 2),
    ];
    const correctAnswer = String.fromCharCode(65 + startIndex + 3);

    const wrongAnswers: string[] = [];
    while (wrongAnswers.length < 2) {
      const wrongIndex = Math.floor(Math.random() * 26);
      const letter = String.fromCharCode(65 + wrongIndex);
      if (wrongIndex !== startIndex + 3 && !wrongAnswers.includes(letter)) {
        if (Math.abs(wrongIndex - (startIndex + 3)) <= 3 || Math.random() < 0.3) {
          wrongAnswers.push(letter);
        }
      }
    }

    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    setCurrentQuestion({ sequence, correctAnswer, options });

    setTimeout(() => playSequenceSound(sequence), 1000);
  };

  const handleAnswer = (selectedAnswer: string) => {
    if (!currentQuestion) return;
    playClickSound();

    if (selectedAnswer === currentQuestion.correctAnswer) {
      engine.handleCorrect({ onAdvance: generateQuestion });
    } else {
      engine.handleWrong({ onAdvance: generateQuestion });
    }
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  if (engine.gameOver) {
    return (
      <GameResult
        score={engine.score}
        maxScore={engine.maxScore}
        questionsAnswered={engine.questionsAnswered}
        totalQuestions={config.totalQuestions}
        superRatio={config.resultThresholds.superRatio}
        goodRatio={config.resultThresholds.goodRatio}
        pointsPerQuestion={config.pointsPerQuestion}
        onPlayAgain={() => engine.reset(generateQuestion)}
      />
    );
  }

  if (!currentQuestion) {
    return <div className="text-center text-2xl">{t("common.loading")}</div>;
  }

  const correctSequence = (
    <div>
      <div className="mb-2 text-lg text-purple-600">{t("games.sequence.completeSequence")}</div>
      <div className="flex items-center justify-center gap-2">
        {currentQuestion.sequence.map((letter, index) => (
          <div key={index} className="flex items-center">
            <div className="rounded-lg border-2 border-blue-300 bg-blue-100 p-2 text-2xl font-bold text-blue-600">
              {letter}
            </div>
            {index < currentQuestion.sequence.length && (
              <ArrowRight className="mx-1 text-blue-500" aria-hidden="true" />
            )}
          </div>
        ))}
        <div className="rounded-lg border-2 border-green-300 bg-green-100 p-2 text-2xl font-bold text-green-600">
          {currentQuestion.correctAnswer}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <GameHud
        score={engine.score}
        lives={engine.lives}
        livesStart={config.livesStart}
        current={engine.questionsAnswered}
        total={config.totalQuestions}
        onTutorial={() => setShowTutorial(true)}
      />

      {engine.showResult && (
        <FeedbackModal
          kind={engine.showResult}
          message={engine.resultMessage}
          extra={engine.showResult === "correct" ? correctSequence : null}
        />
      )}

      <Card className="mb-8 border-4 border-purple-300 bg-linear-to-br from-purple-100 to-pink-100 p-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-purple-800">
          {t("games.sequence.question")}
        </h2>

        <div className="mb-8 flex items-center justify-center gap-4 rounded-2xl bg-white p-6 shadow-inner">
          {currentQuestion.sequence.map((letter, index) => (
            <div key={index} className="flex items-center">
              <div
                className="animate-bounce rounded-2xl border-4 border-purple-300 bg-purple-100 p-4 text-6xl font-bold text-purple-700 motion-reduce:animate-none"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {letter}
              </div>
              {index < currentQuestion.sequence.length - 1 && (
                <ArrowRight className="mx-2 text-purple-500" aria-hidden="true" />
              )}
            </div>
          ))}
          <ArrowRight className="mx-2 text-purple-500" aria-hidden="true" />
          <div className="rounded-2xl border-4 border-dashed border-gray-300 bg-gray-100 p-4 text-6xl font-bold text-gray-400">
            ?
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map(letter => (
            <Button
              key={letter}
              onClick={() => handleAnswer(letter)}
              onMouseEnter={() => playLetterSound(letter)}
              className="h-24 transform rounded-2xl border-4 border-purple-300 bg-linear-to-br from-purple-200 to-pink-200 text-4xl font-bold text-purple-800 transition-all duration-300 hover:scale-105 hover:from-purple-300 hover:to-pink-300 active:scale-95"
              disabled={engine.showResult !== null}
              aria-label={letter}
            >
              <div className="flex flex-col items-center">
                <div>{letter}</div>
                <div className="text-2xl">{letter.toLowerCase()}</div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      <div className="rounded-2xl bg-white p-4 text-center text-lg text-purple-600 shadow-lg">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span aria-hidden="true">🧠</span>
          <span className="font-semibold">{t("games.sequence.instructionsTitle")}</span>
          <span aria-hidden="true">🧠</span>
        </div>
        <div className="text-sm text-purple-500">{t("games.sequence.instructionsSubtitle")}</div>
      </div>

      {showTutorial && (
        <GameTutorial
          onClose={() => setShowTutorial(false)}
          stepsKey="tutorial.sequence.steps"
          examples={SEQUENCE_EXAMPLES}
        />
      )}
    </div>
  );
}
