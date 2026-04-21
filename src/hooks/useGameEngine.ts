import { useCallback, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { useSound } from "@/hooks/useSound";

export type GameStatus = "playing" | "wonRound" | "lostRound" | "gameOver";
export type GameResultKind = "correct" | "wrong" | null;

export interface GameEngineConfig {
  livesStart: number;
  totalQuestions: number;
  pointsPerQuestion: number;
  feedbackMs?: number;
}

export interface GameEngineState {
  score: number;
  lives: number;
  questionsAnswered: number;
  showResult: GameResultKind;
  resultMessage: string;
  gameOver: boolean;
}

export interface GameEngine extends GameEngineState {
  config: GameEngineConfig;
  maxScore: number;
  handleCorrect: (extra?: { onAdvance?: () => void; pointsOverride?: number }) => void;
  handleWrong: (extra?: { onAdvance?: () => void }) => void;
  reset: (next?: () => void) => void;
}

const DEFAULT_FEEDBACK_MS = 2000;

export function useGameEngine(config: GameEngineConfig): GameEngine {
  const { t } = useTranslation();
  const { playSuccessSound, playErrorSound, playGameOverSound, playClickSound } = useSound();

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(config.livesStart);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showResult, setShowResult] = useState<GameResultKind>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const encouragements = useMemo(
    () => t("games.common.encouragements", { returnObjects: true }) as string[],
    [t]
  );
  const tryAgainMessages = useMemo(
    () => t("games.common.tryAgainMessages", { returnObjects: true }) as string[],
    [t]
  );

  const feedbackMs = config.feedbackMs ?? DEFAULT_FEEDBACK_MS;
  const maxScore = config.totalQuestions * config.pointsPerQuestion;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCorrect = useCallback(
    (extra?: { onAdvance?: () => void; pointsOverride?: number }) => {
      const points = extra?.pointsOverride ?? config.pointsPerQuestion;
      playSuccessSound();
      setScore(prev => prev + points);
      setShowResult("correct");
      setResultMessage(encouragements[Math.floor(Math.random() * encouragements.length)]);

      const nextAnswered = questionsAnswered + 1;
      setQuestionsAnswered(nextAnswered);

      clearTimer();
      timerRef.current = setTimeout(() => {
        setShowResult(null);
        if (nextAnswered >= config.totalQuestions) {
          playGameOverSound(true);
          setGameOver(true);
        } else {
          extra?.onAdvance?.();
        }
      }, feedbackMs);
    },
    [
      config.pointsPerQuestion,
      config.totalQuestions,
      encouragements,
      feedbackMs,
      playSuccessSound,
      playGameOverSound,
      questionsAnswered,
    ]
  );

  const handleWrong = useCallback(
    (extra?: { onAdvance?: () => void }) => {
      playErrorSound();
      const nextLives = lives - 1;
      setLives(nextLives);
      setShowResult("wrong");
      setResultMessage(tryAgainMessages[Math.floor(Math.random() * tryAgainMessages.length)]);

      clearTimer();
      timerRef.current = setTimeout(() => {
        setShowResult(null);
        if (nextLives <= 0) {
          playGameOverSound(false);
          setGameOver(true);
        } else {
          extra?.onAdvance?.();
        }
      }, feedbackMs);
    },
    [feedbackMs, lives, playErrorSound, playGameOverSound, tryAgainMessages]
  );

  const reset = useCallback(
    (next?: () => void) => {
      clearTimer();
      playClickSound();
      setScore(0);
      setLives(config.livesStart);
      setQuestionsAnswered(0);
      setShowResult(null);
      setResultMessage("");
      setGameOver(false);
      next?.();
    },
    [config.livesStart, playClickSound]
  );

  return {
    score,
    lives,
    questionsAnswered,
    showResult,
    resultMessage,
    gameOver,
    config,
    maxScore,
    handleCorrect,
    handleWrong,
    reset,
  };
}
