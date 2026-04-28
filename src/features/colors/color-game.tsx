import { useEffect, useState } from "react";

import { Palette } from "lucide-react";
import { useTranslation } from "react-i18next";

import FeedbackModal from "@/components/games/feedback-modal";
import GameHud from "@/components/games/game-hud";
import GameResult from "@/components/games/game-result";
import GameTutorial from "@/components/games/game-tutorial";
import { COLOR_GUESS_EXAMPLES } from "@/components/games/tutorial-examples";
import { StickerReveal } from "@/components/rewards";
import { ToyButton } from "@/components/toys";
import { Card } from "@/components/ui/card";
import { GAME_CONFIGS } from "@/config/games";
import { COLOR_DEFS, COLOR_GUESS_IDS, type ColorId } from "@/data/colors";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useRecordGameCompletion } from "@/hooks/useRecordGameCompletion";
import { useSpeakPromptOnChange } from "@/hooks/useSpeakPrompt";

interface ColorQuestion {
  emoji: string;
  correctId: ColorId;
  options: ColorId[];
}

const config = GAME_CONFIGS.colorGuess;

export default function ColorGame() {
  const { t } = useTranslation();
  const engine = useGameEngine(config);

  const [currentQuestion, setCurrentQuestion] = useState<ColorQuestion | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [questionId, setQuestionId] = useState(0);
  const [sessionId, setSessionId] = useState(0);

  useSpeakPromptOnChange("colorGuess", currentQuestion ? questionId : null);

  const { latestUnlock, latestSticker } = useRecordGameCompletion({
    activityId: "game:colors:identify",
    gameOver: engine.gameOver,
    score: engine.score,
    maxScore: engine.maxScore,
    resetKey: sessionId,
  });

  const generateQuestion = () => {
    const correctId = COLOR_GUESS_IDS[Math.floor(Math.random() * COLOR_GUESS_IDS.length)];
    const correct = COLOR_DEFS[correctId];
    const randomEmoji = correct.examples[Math.floor(Math.random() * correct.examples.length)];

    const wrongIds: ColorId[] = [];
    while (wrongIds.length < 2) {
      const candidate = COLOR_GUESS_IDS[Math.floor(Math.random() * COLOR_GUESS_IDS.length)];
      if (candidate !== correctId && !wrongIds.includes(candidate)) {
        wrongIds.push(candidate);
      }
    }

    const options = [correctId, ...wrongIds].sort(() => Math.random() - 0.5);

    setCurrentQuestion({ emoji: randomEmoji, correctId, options });
    setQuestionId(prev => prev + 1);
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
          successEmoji="🎨"
          extra={engine.showResult === "correct" ? correctExtra : null}
        />
      )}

      <Card className="mb-8 border-4 border-pink-300 bg-linear-to-br from-pink-100 to-orange-100 p-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-purple-800">
          {t("games.colorGuess.question")}
        </h2>

        <div className="mb-8 rounded-2xl bg-white p-6 text-center shadow-inner">
          <div
            className="mb-4 animate-bounce text-8xl motion-reduce:animate-none"
            aria-hidden="true"
          >
            {currentQuestion.emoji}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map(id => {
            const def = COLOR_DEFS[id];
            const colorName = t(`data.colors.${id}.name`);
            return (
              <ToyButton
                key={id}
                onClick={() => handleAnswer(id)}
                disabled={engine.showResult !== null}
                aria-label={colorName}
                tone="primary"
                size="lg"
                className="h-28 flex-col"
              >
                <div
                  className="h-10 w-10 rounded-full border-4 border-white/70 shadow-inner"
                  style={{ backgroundColor: def.hex }}
                  aria-hidden="true"
                />
                <span className="mt-1 text-base font-bold">{colorName}</span>
              </ToyButton>
            );
          })}
        </div>
      </Card>

      <div className="rounded-2xl bg-white p-4 text-center text-lg text-purple-600 shadow-lg">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Palette className="text-pink-500" aria-hidden="true" />
          <span className="font-semibold">{t("games.colorGuess.instructionsTitle")}</span>
          <Palette className="text-pink-500" aria-hidden="true" />
        </div>
        <div className="text-sm text-purple-500">{t("games.colorGuess.instructionsSubtitle")}</div>
      </div>

      {showTutorial && (
        <GameTutorial
          onClose={() => setShowTutorial(false)}
          stepsKey="tutorial.colorGuess.steps"
          examples={COLOR_GUESS_EXAMPLES}
        />
      )}
    </div>
  );
}
