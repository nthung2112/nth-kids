import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import FeedbackModal from "@/components/games/feedback-modal";
import GameHud from "@/components/games/game-hud";
import GameResult from "@/components/games/game-result";
import GameTutorial from "@/components/games/game-tutorial";
import { SHAPES_EXAMPLES } from "@/components/games/tutorial-examples";
import { StickerReveal } from "@/components/rewards";
import { ToyButton } from "@/components/toys";
import { Card } from "@/components/ui/card";
import { GAME_CONFIGS } from "@/config/games";
import { SHAPE_DEFS, SHAPE_GAME_IDS, type ShapeId } from "@/data/shapes";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useRecordGameCompletion } from "@/hooks/useRecordGameCompletion";
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
  const [sessionId, setSessionId] = useState(0);

  useSpeakPromptOnChange("shapesGame", currentQuestion ? questionId : null);

  const { latestUnlock, latestSticker } = useRecordGameCompletion({
    activityId: "game:shapes",
    gameOver: engine.gameOver,
    score: engine.score,
    maxScore: engine.maxScore,
    resetKey: sessionId,
  });

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
        onPlayAgain={() => {
          setSessionId(prev => prev + 1);
          engine.reset(generateQuestion);
        }}
        extraStats={
          latestUnlock && latestSticker ? (
            <StickerReveal unlock={latestUnlock} sticker={latestSticker} />
          ) : undefined
        }
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
          <div className="animate-bounce text-9xl motion-reduce:animate-none" aria-hidden="true">
            {correct.emoji}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map(id => {
            const def = SHAPE_DEFS[id];
            const name = t(`data.shapes.${id}.name`);
            return (
              <ToyButton
                key={id}
                onClick={() => handleAnswer(id)}
                disabled={engine.showResult !== null}
                aria-label={name}
                tone="primary"
                size="lg"
                className="h-24 flex-col"
              >
                <span className="text-base font-bold">{name}</span>
                <span className="text-lg" aria-hidden="true">
                  {def.emoji}
                </span>
              </ToyButton>
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
