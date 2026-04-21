import { useState, type ReactNode } from "react";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TutorialStep {
  title: string;
  content: string;
}

interface GameTutorialProps {
  onClose: () => void;
  stepsKey: string;
  examples?: ReactNode[];
}

export default function GameTutorial({ onClose, stepsKey, examples = [] }: GameTutorialProps) {
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
      <Card className="relative w-full max-w-2xl p-8">
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 bg-gray-200 p-0 text-gray-600 hover:bg-gray-300"
          aria-label={t("common.close")}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-6 text-center">
          <h2 className="mb-2 text-3xl font-bold text-purple-800">{current.title}</h2>
          <p className="text-lg text-purple-600">{current.content}</p>
        </div>

        {example && <div className="mb-6">{example}</div>}

        <div className="flex items-center justify-between">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="bg-gray-500 px-6 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            {t("tutorial.prev")}
          </Button>

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

          <Button
            onClick={nextStep}
            className="bg-purple-500 px-6 py-2 text-white hover:bg-purple-600"
          >
            {isLast ? t("tutorial.start") : t("tutorial.next")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
