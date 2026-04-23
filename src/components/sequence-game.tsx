import { Fragment, useEffect, useState } from "react";

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
import { useSpeakOnChange } from "@/hooks/useTts";

interface SequenceQuestion {
  sequence: string[];
  correctAnswer: string;
  options: string[];
}

const config = { ...GAME_CONFIGS.sequence, feedbackMs: 2500 };

export default function SequenceGame() {
  const { t } = useTranslation();
  const engine = useGameEngine(config);

  const [currentQuestion, setCurrentQuestion] = useState<SequenceQuestion | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [questionId, setQuestionId] = useState(0);

  const questionPrompt = t("games.sequence.question");
  useSpeakOnChange(questionPrompt, currentQuestion ? questionId : null, { delayMs: 250 });

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
    setQuestionId(prev => prev + 1);
  };

  const handleAnswer = (selectedAnswer: string) => {
    if (!currentQuestion) return;

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
      <div className="mb-2 text-base text-purple-600 sm:text-lg">
        {t("games.sequence.completeSequence")}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {currentQuestion.sequence.map((letter, index) => (
          <Fragment key={index}>
            <div className="rounded-lg border-2 border-blue-300 bg-blue-100 px-2 py-1 text-xl font-bold text-blue-600 sm:text-2xl">
              {letter}
            </div>
            <ArrowRight className="h-3 w-3 shrink-0 text-blue-500 sm:h-4 sm:w-4" aria-hidden="true" />
          </Fragment>
        ))}
        <div className="rounded-lg border-2 border-green-300 bg-green-100 px-2 py-1 text-xl font-bold text-green-600 sm:text-2xl">
          {currentQuestion.correctAnswer}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
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

      <Card className="mb-4 border-4 border-purple-300 bg-linear-to-br from-purple-100 to-pink-100 p-4 @md:mb-6 @md:p-6 @lg:p-8">
        <h2 className="mb-3 text-center text-lg font-bold text-purple-800 @sm:text-xl @md:mb-6 @md:text-2xl @lg:text-3xl">
          {t("games.sequence.question")}
        </h2>

        <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-white p-3 shadow-inner @sm:gap-2 @md:mb-6 @md:gap-3 @md:p-4 @lg:p-6">
          {currentQuestion.sequence.map((letter, index) => (
            <Fragment key={index}>
              <div
                className="animate-bounce rounded-xl border-2 border-purple-300 bg-purple-100 px-2 py-1 text-2xl font-bold text-purple-700 motion-reduce:animate-none @sm:px-2.5 @sm:py-1.5 @sm:text-3xl @md:rounded-2xl @md:border-4 @md:p-3 @md:text-4xl @lg:p-4 @lg:text-5xl"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {letter}
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-purple-500 @sm:h-5 @sm:w-5 @md:h-6 @md:w-6 @lg:h-7 @lg:w-7"
                aria-hidden="true"
              />
            </Fragment>
          ))}
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 px-2 py-1 text-2xl font-bold text-gray-400 @sm:px-2.5 @sm:py-1.5 @sm:text-3xl @md:rounded-2xl @md:border-4 @md:p-3 @md:text-4xl @lg:p-4 @lg:text-5xl">
            ?
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 @sm:gap-3 @md:gap-4">
          {currentQuestion.options.map(letter => (
            <Button
              key={letter}
              onClick={() => handleAnswer(letter)}
              className="h-20 transform rounded-2xl border-4 border-purple-300 bg-linear-to-br from-purple-200 to-pink-200 text-2xl font-bold text-purple-800 transition-all duration-300 hover:scale-105 hover:from-purple-300 hover:to-pink-300 active:scale-95 @sm:text-3xl @md:h-24 @md:text-4xl"
              disabled={engine.showResult !== null}
              aria-label={letter}
            >
              <div className="flex flex-col items-center leading-tight">
                <div>{letter}</div>
                <div className="text-base @sm:text-lg @md:text-2xl">{letter.toLowerCase()}</div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      <div className="rounded-2xl bg-white p-3 text-center text-purple-600 shadow-lg @md:p-4">
        <div className="mb-1 flex items-center justify-center gap-2 text-sm @md:text-base">
          <span aria-hidden="true">🧠</span>
          <span className="font-semibold">{t("games.sequence.instructionsTitle")}</span>
          <span aria-hidden="true">🧠</span>
        </div>
        <div className="text-xs text-purple-500 @md:text-sm">
          {t("games.sequence.instructionsSubtitle")}
        </div>
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
