import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import FeedbackModal from "@/components/games/feedback-modal";
import GameHud from "@/components/games/game-hud";
import GameResult from "@/components/games/game-result";
import GameTutorial from "@/components/games/game-tutorial";
import { COUNTING_EXAMPLES } from "@/components/games/tutorial-examples";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCountingGameConfig } from "@/config/games";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useSpeakOnChange } from "@/hooks/useTts";

const gameEmojis = ["🍎", "🐱", "🌸", "🦋", "⭐", "🐠", "🎈", "🎁", "🌈", "🐝"];

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
  const { t } = useTranslation();

  const tier = getCountingGameConfig(maxNumber);
  const engine = useGameEngine({
    livesStart: tier.livesStart,
    totalQuestions: tier.totalQuestions,
    pointsPerQuestion: tier.pointsPerQuestion,
  });

  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [questionId, setQuestionId] = useState(0);

  const questionPrompt = t("games.counting.question");
  useSpeakOnChange(questionPrompt, currentQuestion ? questionId : null, { delayMs: 250 });

  const generateQuestion = () => {
    const count = Math.floor(Math.random() * tier.maxCount) + 1;
    const emoji = gameEmojis[Math.floor(Math.random() * gameEmojis.length)];
    const correctAnswer = count;

    const wrongAnswers: number[] = [];
    const maxOption = Math.min(maxNumber, tier.maxCount + 2);

    while (wrongAnswers.length < 2) {
      const wrong = Math.floor(Math.random() * maxOption) + 1;
      if (wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
        wrongAnswers.push(wrong);
      }
    }

    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    setCurrentQuestion({ emoji, count, options, correctAnswer });
    setQuestionId(prev => prev + 1);
  };

  const handleAnswer = (selectedAnswer: number) => {
    if (!currentQuestion) return;

    if (selectedAnswer === currentQuestion.correctAnswer) {
      engine.handleCorrect({ onAdvance: generateQuestion });
    } else {
      engine.handleWrong({ onAdvance: generateQuestion });
    }
  };

  useEffect(() => {
    generateQuestion();
  }, [maxNumber]);

  if (engine.gameOver) {
    return (
      <GameResult
        score={engine.score}
        maxScore={engine.maxScore}
        questionsAnswered={engine.questionsAnswered}
        totalQuestions={tier.totalQuestions}
        superRatio={tier.resultThresholds.superRatio}
        goodRatio={tier.resultThresholds.goodRatio}
        pointsPerQuestion={tier.pointsPerQuestion}
        onPlayAgain={() => engine.reset(generateQuestion)}
      />
    );
  }

  if (!currentQuestion) {
    return <div className="text-center text-2xl">{t("common.loading")}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <GameHud
        score={engine.score}
        lives={engine.lives}
        livesStart={tier.livesStart}
        current={engine.questionsAnswered}
        total={tier.totalQuestions}
        onTutorial={() => setShowTutorial(true)}
      />

      {engine.showResult && <FeedbackModal kind={engine.showResult} message={engine.resultMessage} />}

      <Card className="mb-8 border-4 border-blue-300 bg-linear-to-br from-blue-100 to-purple-100 p-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-purple-800">
          {t("games.counting.question")}
        </h2>

        <div className="mb-8 flex flex-wrap justify-center gap-4 rounded-2xl bg-white p-6 shadow-inner">
          {[...Array(currentQuestion.count)].map((_, index) => (
            <span
              key={index}
              className="animate-bounce text-6xl motion-reduce:animate-none"
              style={{ animationDelay: `${index * 0.1}s` }}
              aria-hidden="true"
            >
              {currentQuestion.emoji}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map(option => (
            <Button
              key={option}
              onClick={() => handleAnswer(option)}
              className="h-24 transform rounded-2xl border-4 border-purple-300 bg-linear-to-br from-pink-200 to-purple-200 text-4xl font-bold text-purple-800 transition-all duration-300 hover:scale-105 hover:from-pink-300 hover:to-purple-300 active:scale-95"
              disabled={engine.showResult !== null}
              aria-label={String(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </Card>

      <div className="rounded-2xl bg-white p-4 text-center text-lg text-purple-600 shadow-lg">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span aria-hidden="true">{t("common.touch")}</span>
          <span className="font-semibold">{t("games.counting.instructionsTitle")}</span>
          <span aria-hidden="true">{t("common.touch")}</span>
        </div>
        <div className="text-sm text-purple-500">
          {t("games.counting.instructionsSubtitle", {
            max: Math.min(maxNumber, tier.maxCount),
          })}
        </div>
      </div>

      {showTutorial && (
        <GameTutorial
          onClose={() => setShowTutorial(false)}
          stepsKey="tutorial.counting.steps"
          examples={COUNTING_EXAMPLES}
        />
      )}
    </div>
  );
}
