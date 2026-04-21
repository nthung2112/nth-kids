import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import FeedbackModal from "@/components/games/feedback-modal";
import GameHud from "@/components/games/game-hud";
import GameResult from "@/components/games/game-result";
import GameTutorial from "@/components/games/game-tutorial";
import { FLASHCARDS_EXAMPLES } from "@/components/games/tutorial-examples";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GAME_CONFIGS } from "@/config/games";
import { ALPHABET_GAME_SUBSET } from "@/data/alphabet";
import { COLOR_DEFS, COLOR_GUESS_IDS } from "@/data/colors";
import { SHAPE_DEFS, SHAPE_GAME_IDS } from "@/data/shapes";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useSound } from "@/hooks/useSound";

type CardKind = "number" | "letter" | "color" | "shape";

interface FlashcardOption {
  id: string;
  label: string;
  visual?: string;
  hex?: string;
}

interface FlashcardQuestion {
  kind: CardKind;
  prompt: string;
  visual?: string;
  hex?: string;
  correctOptionId: string;
  options: FlashcardOption[];
}

const config = GAME_CONFIGS.flashcards;

const pickWrong = <T,>(pool: T[], correct: T, n: number, key: (t: T) => string): T[] => {
  const wrongs: T[] = [];
  let safety = 0;
  while (wrongs.length < n && safety < 50) {
    safety += 1;
    const cand = pool[Math.floor(Math.random() * pool.length)];
    if (key(cand) !== key(correct) && !wrongs.some(w => key(w) === key(cand))) {
      wrongs.push(cand);
    }
  }
  return wrongs;
};

const buildNumber = (maxNumber: number, t: (key: string) => string): FlashcardQuestion => {
  const correct = Math.max(1, Math.floor(Math.random() * Math.min(maxNumber, 20)) + 1);
  const wrongs = pickWrong(
    Array.from({ length: Math.min(maxNumber, 20) }, (_, i) => i + 1),
    correct,
    2,
    n => String(n)
  );
  const options = [correct, ...wrongs]
    .sort(() => Math.random() - 0.5)
    .map(n => ({ id: String(n), label: String(n) }));
  return {
    kind: "number",
    prompt: t("flashcards.questionLabels.number"),
    visual: String(correct),
    correctOptionId: String(correct),
    options,
  };
};

const buildLetter = (t: (key: string) => string): FlashcardQuestion => {
  const correct = ALPHABET_GAME_SUBSET[Math.floor(Math.random() * ALPHABET_GAME_SUBSET.length)];
  const wrongs = pickWrong(ALPHABET_GAME_SUBSET, correct, 2, e => e.letter);
  const options = [correct, ...wrongs]
    .sort(() => Math.random() - 0.5)
    .map(entry => ({ id: entry.letter, label: entry.letter, visual: entry.emoji }));
  return {
    kind: "letter",
    prompt: t("flashcards.questionLabels.letter"),
    visual: correct.emoji,
    correctOptionId: correct.letter,
    options,
  };
};

const buildColor = (t: (key: string) => string): FlashcardQuestion => {
  const correctId = COLOR_GUESS_IDS[Math.floor(Math.random() * COLOR_GUESS_IDS.length)];
  const wrongs = pickWrong(COLOR_GUESS_IDS, correctId, 2, id => id);
  const options = [correctId, ...wrongs]
    .sort(() => Math.random() - 0.5)
    .map(id => ({
      id,
      label: t(`data.colors.${id}.name`),
      hex: COLOR_DEFS[id].hex,
    }));
  return {
    kind: "color",
    prompt: t("flashcards.questionLabels.color"),
    hex: COLOR_DEFS[correctId].hex,
    correctOptionId: correctId,
    options,
  };
};

const buildShape = (t: (key: string) => string): FlashcardQuestion => {
  const correctId = SHAPE_GAME_IDS[Math.floor(Math.random() * SHAPE_GAME_IDS.length)];
  const wrongs = pickWrong(SHAPE_GAME_IDS, correctId, 2, id => id);
  const options = [correctId, ...wrongs]
    .sort(() => Math.random() - 0.5)
    .map(id => ({
      id,
      label: t(`data.shapes.${id}.name`),
      visual: SHAPE_DEFS[id].emoji,
    }));
  return {
    kind: "shape",
    prompt: t("flashcards.questionLabels.shape"),
    visual: SHAPE_DEFS[correctId].emoji,
    correctOptionId: correctId,
    options,
  };
};

interface FlashcardsGameProps {
  maxNumber: number;
}

export default function FlashcardsGame({ maxNumber }: FlashcardsGameProps) {
  const { t } = useTranslation();
  const { playClickSound, playNumberSound, playLetterSound, playColorSound, playShapeSound } = useSound();
  const engine = useGameEngine(config);

  const [currentQuestion, setCurrentQuestion] = useState<FlashcardQuestion | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const generateQuestion = () => {
    const builders = [
      () => buildNumber(maxNumber, t),
      () => buildLetter(t),
      () => buildColor(t),
      () => buildShape(t),
    ];
    const question = builders[Math.floor(Math.random() * builders.length)]();
    setCurrentQuestion(question);
    // Speak the prompt so the kid can hear what to look for
    setTimeout(() => playOptionPreview(question.kind, question.correctOptionId), 350);
  };

  const handleAnswer = (optionId: string) => {
    if (!currentQuestion) return;
    playClickSound();
    if (optionId === currentQuestion.correctOptionId) {
      engine.handleCorrect({ onAdvance: generateQuestion });
    } else {
      engine.handleWrong({ onAdvance: generateQuestion });
    }
  };

  const playOptionPreview = (kind: CardKind, optionId: string) => {
    if (kind === "number") {
      const n = Number.parseInt(optionId, 10);
      if (!Number.isNaN(n)) playNumberSound(n);
    } else if (kind === "letter") {
      playLetterSound(optionId);
    } else if (kind === "color") {
      playColorSound(optionId);
    } else if (kind === "shape") {
      playShapeSound(optionId);
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

      <Card className="mb-8 border-4 border-orange-300 bg-linear-to-br from-orange-100 to-yellow-100 p-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-purple-800 sm:text-3xl">
          {currentQuestion.prompt}
        </h2>

        <div className="mb-8 flex min-h-40 items-center justify-center rounded-2xl bg-white p-6 shadow-inner">
          {currentQuestion.hex ? (
            <div
              className="h-28 w-28 rounded-full border-4 border-gray-300 shadow-lg"
              style={{ backgroundColor: currentQuestion.hex }}
              aria-hidden="true"
            />
          ) : (
            <div className="text-9xl" aria-hidden="true">
              {currentQuestion.visual}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map(option => (
            <Button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              onMouseEnter={() => playOptionPreview(currentQuestion.kind, option.id)}
              className="h-24 transform rounded-2xl border-4 border-orange-300 bg-white text-base font-bold text-orange-800 transition-all duration-300 hover:scale-105 hover:bg-orange-50 active:scale-95"
              disabled={engine.showResult !== null}
              aria-label={option.label}
            >
              <div className="flex flex-col items-center gap-1">
                {option.hex ? (
                  <div
                    className="h-7 w-7 rounded-full border-2 border-gray-400"
                    style={{ backgroundColor: option.hex }}
                    aria-hidden="true"
                  />
                ) : option.visual ? (
                  <span className="text-2xl" aria-hidden="true">
                    {option.visual}
                  </span>
                ) : null}
                <span>{option.label}</span>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      <div className="rounded-2xl bg-white p-4 text-center text-lg text-purple-600 shadow-lg">
        <div className="text-sm">{t("flashcards.intro")}</div>
      </div>

      {showTutorial && (
        <GameTutorial
          onClose={() => setShowTutorial(false)}
          stepsKey="tutorial.flashcards.steps"
          examples={FLASHCARDS_EXAMPLES}
        />
      )}
    </div>
  );
}
