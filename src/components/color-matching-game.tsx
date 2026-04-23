import { useEffect, useState } from "react";

import { Shuffle } from "lucide-react";
import { useTranslation } from "react-i18next";

import FeedbackModal from "@/components/games/feedback-modal";
import GameHud from "@/components/games/game-hud";
import GameResult from "@/components/games/game-result";
import GameTutorial from "@/components/games/game-tutorial";
import { COLOR_MATCHING_EXAMPLES } from "@/components/games/tutorial-examples";
import { Card } from "@/components/ui/card";
import { GAME_CONFIGS } from "@/config/games";
import { COLOR_DEFS, COLOR_MATCHING_IDS, type ColorId } from "@/data/colors";
import { useGameEngine } from "@/hooks/useGameEngine";

interface ColorPair {
  id: number;
  colorId: ColorId;
  matched: boolean;
}

const config = { ...GAME_CONFIGS.colorMatching, feedbackMs: 1500 };
const PAIR_COUNT = config.totalQuestions;
const REVEAL_DELAY_MS = 1000;

export default function ColorMatchingGame() {
  const { t } = useTranslation();
  const engine = useGameEngine(config);

  const [colorPairs, setColorPairs] = useState<ColorPair[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const initializeGame = () => {
    const selectedIds = COLOR_MATCHING_IDS.slice(0, PAIR_COUNT);
    const pairs: ColorPair[] = [];

    selectedIds.forEach((colorId, index) => {
      pairs.push({ id: index * 2, colorId, matched: false });
      pairs.push({ id: index * 2 + 1, colorId, matched: false });
    });

    const shuffledPairs = pairs.sort(() => Math.random() - 0.5);
    setColorPairs(shuffledPairs);
    setSelectedCards([]);
    setIsProcessing(false);
  };

  const handleCardClick = (cardIndex: number) => {
    if (isProcessing || selectedCards.includes(cardIndex) || colorPairs[cardIndex]?.matched) {
      return;
    }

    const newSelected = [...selectedCards, cardIndex];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsProcessing(true);
      const [firstIdx, secondIdx] = newSelected;
      const firstCard = colorPairs[firstIdx];
      const secondCard = colorPairs[secondIdx];

      setTimeout(() => {
        const advance = () => {
          setSelectedCards([]);
          setIsProcessing(false);
        };

        if (firstCard.colorId === secondCard.colorId) {
          setColorPairs(prev =>
            prev.map((pair, index) =>
              index === firstIdx || index === secondIdx ? { ...pair, matched: true } : pair
            )
          );
          engine.handleCorrect({ onAdvance: advance });
        } else {
          engine.handleWrong({ onAdvance: advance });
        }
      }, REVEAL_DELAY_MS);
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  if (engine.gameOver) {
    return (
      <GameResult
        score={engine.score}
        maxScore={engine.maxScore}
        questionsAnswered={engine.questionsAnswered}
        totalQuestions={PAIR_COUNT}
        superRatio={config.resultThresholds.superRatio}
        goodRatio={config.resultThresholds.goodRatio}
        pointsPerQuestion={config.pointsPerQuestion}
        onPlayAgain={() => engine.reset(initializeGame)}
        variant="color"
        starsLabelKey="rainbowStars"
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <GameHud
        score={engine.score}
        lives={engine.lives}
        livesStart={config.livesStart}
        current={engine.questionsAnswered}
        total={PAIR_COUNT}
        onTutorial={() => setShowTutorial(true)}
      />

      {engine.showResult && (
        <FeedbackModal
          kind={engine.showResult}
          message={engine.resultMessage}
          successEmoji="🎨"
        />
      )}

      <Card className="mb-8 border-4 border-pink-300 bg-linear-to-br from-pink-100 to-orange-100 p-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-purple-800">
          {t("games.colorMatching.title")}
        </h2>

        <div
          className="mx-auto grid max-w-md grid-cols-3 gap-4"
          role="grid"
          aria-label={t("games.colorMatching.title")}
        >
          {colorPairs.map((pair, index) => {
            const def = COLOR_DEFS[pair.colorId];
            const isRevealed = selectedCards.includes(index) || pair.matched;
            const colorName = t(`data.colors.${pair.colorId}.name`);
            return (
              <Card
                key={pair.id}
                role="button"
                tabIndex={pair.matched ? -1 : 0}
                aria-pressed={isRevealed}
                aria-label={isRevealed ? colorName : t("games.colorMatching.hiddenCard")}
                className={`h-24 transform cursor-pointer border-4 transition-all duration-300 motion-reduce:transition-none ${
                  pair.matched
                    ? "scale-95 border-green-400 bg-green-100 opacity-70"
                    : selectedCards.includes(index)
                      ? "scale-105 border-yellow-400 bg-yellow-100"
                      : "border-gray-300 bg-white hover:scale-105 hover:shadow-lg"
                } ${isProcessing && !selectedCards.includes(index) ? "pointer-events-none" : ""}`}
                onClick={() => handleCardClick(index)}
                onKeyDown={event => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleCardClick(index);
                  }
                }}
              >
                <div className="flex h-full items-center justify-center">
                  {isRevealed ? (
                    <div className="text-center">
                      <div
                        className="mx-auto mb-2 h-12 w-12 rounded-full border-2 border-gray-400"
                        style={{ backgroundColor: def.hex }}
                        aria-hidden="true"
                      />
                      <div className="text-sm font-bold text-gray-700">{colorName}</div>
                    </div>
                  ) : (
                    <div className="text-4xl" aria-hidden="true">
                      ❓
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      <div className="rounded-2xl bg-white p-4 text-center text-lg text-purple-600 shadow-lg">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Shuffle className="text-pink-500" aria-hidden="true" />
          <span className="font-semibold">{t("games.colorMatching.instructionsTitle")}</span>
          <Shuffle className="text-pink-500" aria-hidden="true" />
        </div>
        <div className="text-sm text-purple-500">
          {t("games.colorMatching.instructionsSubtitle")}
        </div>
      </div>

      {showTutorial && (
        <GameTutorial
          onClose={() => setShowTutorial(false)}
          stepsKey="tutorial.colorMatching.steps"
          examples={COLOR_MATCHING_EXAMPLES}
        />
      )}
    </div>
  );
}
