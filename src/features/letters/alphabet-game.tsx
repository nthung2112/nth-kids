import { useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import FeedbackModal from "@/components/games/feedback-modal";
import GameHud from "@/components/games/game-hud";
import GameResult from "@/components/games/game-result";
import GameTutorial from "@/components/games/game-tutorial";
import { ALPHABET_EXAMPLES } from "@/components/games/tutorial-examples";
import { StickerReveal } from "@/components/rewards";
import { ToyButton } from "@/components/toys";
import { Card } from "@/components/ui/card";
import { GAME_CONFIGS } from "@/config/games";
import { ALPHABET_GAME_SUBSET } from "@/data/alphabet";
import { useGameEngine } from "@/hooks/useGameEngine";
import { usePreferences } from "@/hooks/usePreferences";
import { useRecordGameCompletion } from "@/hooks/useRecordGameCompletion";
import { useSound } from "@/hooks/useSound";
import { useSpeakPromptOnChange } from "@/hooks/useSpeakPrompt";

interface AlphabetQuestion {
  emoji: string;
  letter: string;
  correctLetter: string;
  options: string[];
}

const config = GAME_CONFIGS.alphabet;
const WORD_HINT_DELAY_MS = 2900;

export default function AlphabetGame() {
  const { t, i18n } = useTranslation();
  const engine = useGameEngine(config);
  const { playAlphabetWord } = useSound();
  const { prefs } = usePreferences();
  const delayTime = i18n.language === "en" ? WORD_HINT_DELAY_MS : WORD_HINT_DELAY_MS - 800;

  const [currentQuestion, setCurrentQuestion] = useState<AlphabetQuestion | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [questionId, setQuestionId] = useState(0);
  const [sessionId, setSessionId] = useState(0);
  const wordHintTimer = useRef<number | null>(null);

  useSpeakPromptOnChange("alphabetGame", currentQuestion ? questionId : null);

  const { latestUnlock, latestSticker } = useRecordGameCompletion({
    activityId: "game:letters:alphabet",
    gameOver: engine.gameOver,
    score: engine.score,
    maxScore: engine.maxScore,
    resetKey: sessionId,
  });

  useEffect(() => {
    if (!currentQuestion) return;
    if (prefs.soundMuted) return;

    if (wordHintTimer.current !== null) {
      window.clearTimeout(wordHintTimer.current);
    }

    wordHintTimer.current = window.setTimeout(() => {
      playAlphabetWord(currentQuestion.correctLetter);
    }, delayTime);

    return () => {
      if (wordHintTimer.current !== null) {
        window.clearTimeout(wordHintTimer.current);
        wordHintTimer.current = null;
      }
    };
  }, [questionId, currentQuestion, prefs.soundMuted, playAlphabetWord]);

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
    setQuestionId(prev => prev + 1);
  };

  const handleAnswer = (selectedLetter: string) => {
    if (!currentQuestion) return;

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
        <FeedbackModal kind={engine.showResult} message={engine.resultMessage} />
      )}

      <Card className="mb-8 border-4 border-green-300 bg-linear-to-br from-green-100 to-blue-100 p-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-purple-800">
          {t("games.alphabet.question")}
        </h2>

        <div className="mb-8 rounded-2xl bg-white p-6 text-center shadow-inner">
          <div className="animate-bounce text-8xl motion-reduce:animate-none" aria-hidden="true">
            {currentQuestion.emoji}
          </div>
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
              className="h-24 flex-col text-4xl"
            >
              <span>{letter}</span>
              <span className="text-2xl">{letter.toLowerCase()}</span>
            </ToyButton>
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
