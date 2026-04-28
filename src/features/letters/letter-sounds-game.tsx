import { useEffect, useState } from "react";

import { Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import FeedbackModal from "@/components/games/feedback-modal";
import GameHud from "@/components/games/game-hud";
import GameResult from "@/components/games/game-result";
import GameTutorial from "@/components/games/game-tutorial";
import { LETTER_SOUNDS_EXAMPLES } from "@/components/games/tutorial-examples";
import { StickerReveal } from "@/components/rewards";
import { ToyButton } from "@/components/toys";
import { Card } from "@/components/ui/card";
import { GAME_CONFIGS } from "@/config/games";
import { ALPHABET_GAME_SUBSET } from "@/data/alphabet";
import { useGameEngine } from "@/hooks/useGameEngine";
import { usePreferences } from "@/hooks/usePreferences";
import { useRecordGameCompletion } from "@/hooks/useRecordGameCompletion";
import { useSound } from "@/hooks/useSound";

interface LetterSoundQuestion {
  correctLetter: string;
  options: string[];
}

const config = GAME_CONFIGS.letterSounds;
const AUTO_PLAY_DELAY_MS = 320;

const pickWrongLetters = (correct: string, pool: string[], size: number): string[] => {
  const chosen: string[] = [];
  const remaining = pool.filter(letter => letter !== correct);
  while (chosen.length < size && remaining.length > 0) {
    const index = Math.floor(Math.random() * remaining.length);
    chosen.push(remaining.splice(index, 1)[0]);
  }
  return chosen;
};

export default function LetterSoundsGame() {
  const { t } = useTranslation();
  const engine = useGameEngine(config);
  const { playLetterSound } = useSound();
  const { prefs } = usePreferences();

  const [currentQuestion, setCurrentQuestion] = useState<LetterSoundQuestion | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [sessionId, setSessionId] = useState(0);

  const { latestUnlock, latestSticker } = useRecordGameCompletion({
    activityId: "game:letters:sounds",
    gameOver: engine.gameOver,
    score: engine.score,
    maxScore: engine.maxScore,
    resetKey: sessionId,
  });

  const generateQuestion = () => {
    const letters = ALPHABET_GAME_SUBSET.map(entry => entry.letter);
    const correctLetter = letters[Math.floor(Math.random() * letters.length)];
    const wrongLetters = pickWrongLetters(correctLetter, letters, 2);
    const options = [correctLetter, ...wrongLetters].sort(() => Math.random() - 0.5);
    setCurrentQuestion({ correctLetter, options });
  };

  useEffect(() => {
    if (!currentQuestion) return;
    if (prefs.soundMuted) return;
    const timer = window.setTimeout(() => {
      playLetterSound(currentQuestion.correctLetter);
    }, AUTO_PLAY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [currentQuestion, prefs.soundMuted, playLetterSound]);

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleAnswer = (selectedLetter: string) => {
    if (!currentQuestion) return;
    if (selectedLetter === currentQuestion.correctLetter) {
      engine.handleCorrect({ onAdvance: generateQuestion });
    } else {
      engine.handleWrong({ onAdvance: generateQuestion });
    }
  };

  const replayCurrent = () => {
    if (!currentQuestion) return;
    playLetterSound(currentQuestion.correctLetter);
  };

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
        <FeedbackModal kind={engine.showResult} message={engine.resultMessage} successEmoji="🔊" />
      )}

      <Card className="mb-8 border-4 border-emerald-300 bg-linear-to-br from-emerald-100 to-sky-100 p-6 sm:p-8">
        <h2 className="mb-6 text-center text-2xl font-black text-purple-800 sm:text-3xl">
          {t("games.letterSounds.question")}
        </h2>

        <div className="mb-8 flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-inner">
          <div
            className="flex h-28 w-28 items-center justify-center rounded-[2rem] border-4 border-emerald-300 bg-emerald-50 text-6xl shadow-lg"
            aria-hidden="true"
          >
            🔊
          </div>
          <ToyButton
            tone="secondary"
            size="md"
            onClick={replayCurrent}
            disabled={prefs.soundMuted || engine.showResult !== null}
            aria-label={t("games.letterSounds.replayButton")}
          >
            <Volume2 className="h-5 w-5" aria-hidden="true" />
            <span>{t("games.letterSounds.replayButton")}</span>
          </ToyButton>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map(letter => (
            <ToyButton
              key={letter}
              onClick={() => handleAnswer(letter)}
              disabled={engine.showResult !== null}
              aria-label={letter}
              tone="primary"
              size="lg"
              className="h-24 flex-col"
            >
              <div className="text-4xl font-black leading-none">{letter}</div>
              <div className="mt-1 text-xl font-bold leading-none">{letter.toLowerCase()}</div>
            </ToyButton>
          ))}
        </div>
      </Card>

      <div className="rounded-2xl bg-white p-4 text-center text-lg text-purple-600 shadow-lg">
        <div className="mb-2 font-semibold">{t("games.letterSounds.instructionsTitle")}</div>
        <div className="text-sm text-purple-500">
          {t("games.letterSounds.instructionsSubtitle")}
        </div>
      </div>

      {showTutorial && (
        <GameTutorial
          onClose={() => setShowTutorial(false)}
          stepsKey="tutorial.letterSounds.steps"
          examples={LETTER_SOUNDS_EXAMPLES}
        />
      )}
    </div>
  );
}
