import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import FeedbackModal from "@/components/games/feedback-modal";
import GameHud from "@/components/games/game-hud";
import GameResult from "@/components/games/game-result";
import GameTutorial from "@/components/games/game-tutorial";
import { COLOR_SORTING_EXAMPLES } from "@/components/games/tutorial-examples";
import { StickerReveal } from "@/components/rewards";
import { ToyButton } from "@/components/toys";
import { Card } from "@/components/ui/card";
import { GAME_CONFIGS } from "@/config/games";
import { COLOR_DEFS, type ColorId } from "@/data/colors";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useRecordGameCompletion } from "@/hooks/useRecordGameCompletion";
import { useSound } from "@/hooks/useSound";

const SORTING_COLOR_IDS: ColorId[] = ["red", "yellow", "green", "blue", "purple", "orange"];

interface SortingQuestion {
  emoji: string;
  correctId: ColorId;
  baskets: ColorId[];
}

const config = GAME_CONFIGS.colorSorting;

const pickBaskets = (correctId: ColorId, pool: ColorId[], size: number): ColorId[] => {
  const chosen: ColorId[] = [correctId];
  const remaining = pool.filter(id => id !== correctId);
  while (chosen.length < size && remaining.length > 0) {
    const index = Math.floor(Math.random() * remaining.length);
    chosen.push(remaining.splice(index, 1)[0]);
  }
  return chosen.sort(() => Math.random() - 0.5);
};

export default function ColorSortingGame() {
  const { t } = useTranslation();
  const engine = useGameEngine(config);
  const { playColorSound } = useSound();

  const [currentQuestion, setCurrentQuestion] = useState<SortingQuestion | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [sessionId, setSessionId] = useState(0);

  const { latestUnlock, latestSticker } = useRecordGameCompletion({
    activityId: "game:colors:sort",
    gameOver: engine.gameOver,
    score: engine.score,
    maxScore: engine.maxScore,
    resetKey: sessionId,
  });

  const generateQuestion = () => {
    const correctId = SORTING_COLOR_IDS[Math.floor(Math.random() * SORTING_COLOR_IDS.length)];
    const correct = COLOR_DEFS[correctId];
    const emoji = correct.examples[Math.floor(Math.random() * correct.examples.length)];
    const baskets = pickBaskets(correctId, SORTING_COLOR_IDS, 3);

    setCurrentQuestion({ emoji, correctId, baskets });
    playColorSound(correctId);
  };

  const handleAnswer = (selectedId: ColorId) => {
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
        variant="color"
        starsLabelKey="rainbowStars"
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

  const correctDef = COLOR_DEFS[currentQuestion.correctId];

  const correctExtra = (
    <div>
      <div className="mb-2 text-lg text-purple-600">{t("common.correct")}</div>
      <div
        className="mx-auto h-16 w-16 rounded-full border-4 border-purple-300"
        style={{ backgroundColor: correctDef.hex }}
        aria-hidden="true"
      />
      <div className="mt-2 text-xl font-bold text-purple-700">
        {t(`data.colors.${currentQuestion.correctId}.name`)}
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
          successEmoji="🧺"
          extra={engine.showResult === "correct" ? correctExtra : null}
        />
      )}

      <Card className="mb-8 border-4 border-pink-300 bg-linear-to-br from-pink-100 to-orange-100 p-6 sm:p-8">
        <h2 className="mb-6 text-center text-2xl font-black text-purple-800 sm:text-3xl">
          {t("games.colorSorting.question")}
        </h2>

        <div className="mb-8 rounded-2xl bg-white p-6 text-center shadow-inner">
          <div
            className="mx-auto mb-3 h-24 w-24 rounded-full border-8 shadow-lg sm:h-28 sm:w-28"
            style={{ backgroundColor: correctDef.hex }}
            aria-hidden="true"
          />
          <div className="text-5xl" aria-hidden="true">
            {currentQuestion.emoji}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.baskets.map(id => {
            const def = COLOR_DEFS[id];
            const colorName = t(`data.colors.${id}.name`);
            return (
              <ToyButton
                key={id}
                onClick={() => handleAnswer(id)}
                disabled={engine.showResult !== null}
                aria-label={t("games.colorSorting.basketLabel", { color: colorName })}
                tone="primary"
                size="lg"
                className="h-28 flex-col"
              >
                <div
                  className="h-14 w-14 rounded-3xl border-4 border-white/70 shadow-inner"
                  style={{ backgroundColor: def.hex }}
                  aria-hidden="true"
                />
                <span className="mt-1 text-sm font-bold sm:text-base">{colorName}</span>
              </ToyButton>
            );
          })}
        </div>
      </Card>

      <div className="rounded-2xl bg-white p-4 text-center text-lg text-purple-600 shadow-lg">
        <div className="mb-2 font-semibold">{t("games.colorSorting.instructionsTitle")}</div>
        <div className="text-sm text-purple-500">
          {t("games.colorSorting.instructionsSubtitle")}
        </div>
      </div>

      {showTutorial && (
        <GameTutorial
          onClose={() => setShowTutorial(false)}
          stepsKey="tutorial.colorSorting.steps"
          examples={COLOR_SORTING_EXAMPLES}
        />
      )}
    </div>
  );
}
