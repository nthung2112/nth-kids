import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import FeedbackModal from "@/components/games/feedback-modal";
import GameHud from "@/components/games/game-hud";
import GameResult from "@/components/games/game-result";
import GameTutorial from "@/components/games/game-tutorial";
import { SHAPES_EXAMPLES } from "@/components/games/tutorial-examples";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GAME_CONFIGS } from "@/config/games";
import { SHAPE_DEFS, SHAPE_GAME_IDS, type ShapeId } from "@/data/shapes";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useSpeakPromptOnChange } from "@/hooks/useSpeakPrompt";

interface ShapeQuestion {
  correctId: ShapeId;
  options: ShapeId[];
}

const config = GAME_CONFIGS.shapes;

export default function ShapesGame() {
  const { t } = useTranslation();
  const engine = useGameEngine(config);

  const [currentQuestion, setCurrentQuestion] = useState<ShapeQuestion | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [questionId, setQuestionId] = useState(0);

  useSpeakPromptOnChange("shapesGame", currentQuestion ? questionId : null);

  const generateQuestion = () => {
    const correctId = SHAPE_GAME_IDS[Math.floor(Math.random() * SHAPE_GAME_IDS.length)];
    const wrongIds: ShapeId[] = [];
    while (wrongIds.length < 2) {
      const candidate = SHAPE_GAME_IDS[Math.floor(Math.random() * SHAPE_GAME_IDS.length)];
      if (candidate !== correctId && !wrongIds.includes(candidate)) {
        wrongIds.push(candidate);
      }
    }
    const options = [correctId, ...wrongIds].sort(() => Math.random() - 0.5);
    setCurrentQuestion({ correctId, options });
    setQuestionId(prev => prev + 1);
  };

  const handleAnswer = (selectedId: ShapeId) => {
    if (!currentQuestion) return;
    if (selectedId === currentQuestion.correctId) {
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

  const correct = SHAPE_DEFS[currentQuestion.correctId];

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
        <FeedbackModal kind={engine.showResult} message={engine.resultMessage} />
      )}

      <Card className="mb-8 border-4 border-indigo-300 bg-linear-to-br from-indigo-100 to-blue-100 p-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-purple-800">
          {t("shapes.game.question")}
        </h2>

        <div className="mb-8 rounded-2xl bg-white p-6 text-center shadow-inner">
          <div
            className="animate-bounce text-9xl motion-reduce:animate-none"
            aria-hidden="true"
          >
            {correct.emoji}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map(id => {
            const def = SHAPE_DEFS[id];
            const name = t(`data.shapes.${id}.name`);
            return (
              <Button
                key={id}
                onClick={() => handleAnswer(id)}
                className="h-24 transform rounded-2xl border-4 border-indigo-300 bg-white text-base font-bold text-indigo-800 transition-all duration-300 hover:scale-105 hover:bg-indigo-50 active:scale-95"
                disabled={engine.showResult !== null}
                aria-label={name}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl" aria-hidden="true">
                    {def.emoji}
                  </span>
                  <span>{name}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </Card>

      <div className="rounded-2xl bg-white p-4 text-center text-lg text-purple-600 shadow-lg">
        <div className="mb-2 font-semibold">{t("shapes.game.instructionsTitle")}</div>
        <div className="text-sm text-purple-500">{t("shapes.game.instructionsSubtitle")}</div>
      </div>

      {showTutorial && (
        <GameTutorial
          onClose={() => setShowTutorial(false)}
          stepsKey="tutorial.shapes.steps"
          examples={SHAPES_EXAMPLES}
        />
      )}
    </div>
  );
}
