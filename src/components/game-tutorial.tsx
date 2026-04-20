import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight } from "lucide-react";

interface GameTutorialProps {
  onClose: () => void;
}

export default function GameTutorial({ onClose }: GameTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "🎯 Trò Chơi Chuỗi Chữ Cái",
      content: "Chào bé! Hôm nay chúng ta sẽ học cách tìm chữ cái tiếp theo trong chuỗi!",
      example: null,
    },
    {
      title: "📝 Cách Chơi",
      content: "Bé sẽ thấy 3 chữ cái liên tiếp, nhiệm vụ là tìm chữ cái tiếp theo!",
      example: (
        <div className="flex items-center justify-center gap-4 p-4 bg-blue-50 rounded-xl">
          <div className="text-3xl font-bold text-blue-600 bg-white rounded-lg p-3 border-2 border-blue-300">
            A
          </div>
          <ArrowRight className="text-blue-500" />
          <div className="text-3xl font-bold text-blue-600 bg-white rounded-lg p-3 border-2 border-blue-300">
            B
          </div>
          <ArrowRight className="text-blue-500" />
          <div className="text-3xl font-bold text-blue-600 bg-white rounded-lg p-3 border-2 border-blue-300">
            C
          </div>
          <ArrowRight className="text-blue-500" />
          <div className="text-3xl font-bold text-green-600 bg-green-100 rounded-lg p-3 border-2 border-green-300">
            D
          </div>
        </div>
      ),
    },
    {
      title: "🌟 Ví Dụ Khác",
      content: "Nếu thấy G H I, chữ tiếp theo sẽ là J!",
      example: (
        <div className="flex items-center justify-center gap-4 p-4 bg-purple-50 rounded-xl">
          <div className="text-3xl font-bold text-purple-600 bg-white rounded-lg p-3 border-2 border-purple-300">
            G
          </div>
          <ArrowRight className="text-purple-500" />
          <div className="text-3xl font-bold text-purple-600 bg-white rounded-lg p-3 border-2 border-purple-300">
            H
          </div>
          <ArrowRight className="text-purple-500" />
          <div className="text-3xl font-bold text-purple-600 bg-white rounded-lg p-3 border-2 border-purple-300">
            I
          </div>
          <ArrowRight className="text-purple-500" />
          <div className="text-3xl font-bold text-green-600 bg-green-100 rounded-lg p-3 border-2 border-green-300">
            J
          </div>
        </div>
      ),
    },
    {
      title: "🎮 Sẵn Sàng Chơi!",
      content: "Bé đã hiểu cách chơi rồi! Hãy bắt đầu và tìm những chữ cái tiếp theo nhé!",
      example: <div className="text-6xl text-center">🎉🎊🌟</div>,
    },
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full p-8 relative">
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 p-0 bg-gray-200 hover:bg-gray-300 text-gray-600"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-purple-800 mb-2">
            {tutorialSteps[currentStep].title}
          </h2>
          <p className="text-lg text-purple-600">{tutorialSteps[currentStep].content}</p>
        </div>

        {tutorialSteps[currentStep].example && (
          <div className="mb-6">{tutorialSteps[currentStep].example}</div>
        )}

        <div className="flex justify-between items-center">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 disabled:opacity-50"
          >
            ← Trước
          </Button>

          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentStep ? "bg-purple-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStep}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2"
          >
            {currentStep === tutorialSteps.length - 1 ? "Bắt Đầu!" : "Tiếp →"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
