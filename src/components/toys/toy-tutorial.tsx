import { useState } from "react";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { GameTutorialProps, TutorialStep } from "@/components/games/game-tutorial";
import ToyButton from "@/components/toys/toy-button";
import { Card } from "@/components/ui/card";

export type ToyTutorialProps = GameTutorialProps;

export default function ToyTutorial({ onClose, stepsKey, examples = [] }: ToyTutorialProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = t(stepsKey, { returnObjects: true }) as TutorialStep[];
  const stepCount = Array.isArray(tutorialSteps) ? tutorialSteps.length : 0;

  if (stepCount === 0) {
    return null;
  }

  const nextStep = () => {
    if (currentStep < stepCount - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const current = tutorialSteps[currentStep];
  const isLast = currentStep === stepCount - 1;
  const example = examples[currentStep];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <Card className="relative w-full max-w-2xl rounded-[2rem] border-4 border-white bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border-4 border-gray-200 bg-white text-gray-600 shadow-md transition-transform hover:-translate-y-0.5 hover:bg-gray-50 focus-visible:ring-4 focus-visible:ring-purple-300 focus-visible:outline-hidden active:translate-y-0.5 motion-reduce:transition-none"
          aria-label={t("common.close")}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="mb-3 text-3xl font-black text-purple-800 sm:text-4xl">{current.title}</h2>
          <p className="text-lg font-bold text-purple-600 sm:text-xl">{current.content}</p>
        </div>

        {example && (
          <div className="mb-6 flex justify-center rounded-[1.5rem] border-4 border-purple-100 bg-purple-50 p-4 sm:p-6">
            {example}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <ToyButton
            onClick={prevStep}
            disabled={currentStep === 0}
            tone="neutral"
            className="min-h-12 px-5 text-base"
          >
            {t("tutorial.prev")}
          </ToyButton>

          <div className="flex gap-2" aria-hidden="true">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-3 w-3 rounded-full ${
                  index === currentStep ? "bg-purple-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <ToyButton onClick={nextStep} tone="primary" className="min-h-12 px-5 text-base">
            {isLast ? t("tutorial.start") : t("tutorial.next")}
          </ToyButton>
        </div>
      </Card>
    </div>
  );
}
