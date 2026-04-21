import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import FeedbackModal from "@/components/games/feedback-modal";
import GameHud from "@/components/games/game-hud";
import GameResult from "@/components/games/game-result";
import GameTutorial from "@/components/games/game-tutorial";
import { ALPHABET_EXAMPLES } from "@/components/games/tutorial-examples";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GAME_CONFIGS } from "@/config/games";
import { ALPHABET_GAME_SUBSET } from "@/data/alphabet";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useSound } from "@/hooks/useSound";

interface AlphabetQuestion {
  emoji: string;
  letter: string;
  correctLetter: string;
  options: string[];
}

const config = GAME_CONFIGS.alphabet;

export default function AlphabetGame() {
  const { t } = useTranslation();
  const { playClickSound, playLetterSound } = useSound();
  const engine = useGameEngine(config);

  const [currentQuestion, setCurrentQuestion] = useState<AlphabetQuestion | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const generateQuestion = () => {
    const randomEntry =
      ALPHABET_GAME_SUBSET[Math.floor(Math.random() * ALPHABET_GAME_SUBSET.length)];
    const correctLetter = randomEntry.letter;

    const wrongLetters: string[] = [];
    while (wrongLetters.length < 2) {
      const idx = Math.floor(Math.random() * ALPHABET_GAME_SUBSET.length);
      const candidate = ALPHABET_GAME_SUBSET[idx].letter;
      if (candidate !== correctLetter && !wrongLetters.includes(candidate)) {
        wrongLetters.push(candidate);
      }
    }

    const options = [correctLetter, ...wrongLetters].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      emoji: randomEntry.emoji,
      letter: correctLetter,
      correctLetter,
      options,
    });
  };

  const handleAnswer = (selectedLetter: string) => {
    if (!currentQuestion) return;
    playClickSound();

    if (selectedLetter === currentQuestion.correctLetter) {
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

      {engine.showResult && <FeedbackModal kind={engine.showResult} message={engine.resultMessage} />}

      <Card className="mb-8 border-4 border-green-300 bg-linear-to-br from-green-100 to-blue-100 p-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-purple-800">
          {t("games.alphabet.question")}
        </h2>

        <div className="mb-8 rounded-2xl bg-white p-6 text-center shadow-inner">
          <div className="mb-4 animate-bounce text-8xl motion-reduce:animate-none" aria-hidden="true">
            {currentQuestion.emoji}
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {t(`data.alphabet.${currentQuestion.letter}.word`)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map(letter => (
            <Button
              key={letter}
              onClick={() => handleAnswer(letter)}
              onMouseEnter={() => playLetterSound(letter)}
              className="h-24 transform rounded-2xl border-4 border-green-300 bg-linear-to-br from-green-200 to-blue-200 text-4xl font-bold text-purple-800 transition-all duration-300 hover:scale-105 hover:from-green-300 hover:to-blue-300 active:scale-95"
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
          <span aria-hidden="true">{t("common.touch")}</span>
          <span className="font-semibold">{t("games.alphabet.instructionsTitle")}</span>
          <span aria-hidden="true">{t("common.touch")}</span>
        </div>
        <div className="text-sm text-purple-500">{t("games.alphabet.instructionsSubtitle")}</div>
      </div>

      {showTutorial && (
        <GameTutorial
          onClose={() => setShowTutorial(false)}
          stepsKey="tutorial.alphabet.steps"
          examples={ALPHABET_EXAMPLES}
        />
      )}
    </div>
  );
}
