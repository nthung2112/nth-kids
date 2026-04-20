import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, RotateCcw } from "lucide-react";
import { useSound } from "../hooks/useSound";

const colorData = [
  {
    name: "Đỏ",
    english: "Red",
    color: "#FF0000",
    bgColor: "bg-red-500",
    borderColor: "border-red-300",
    hoverColor: "hover:bg-red-600",
    lightBg: "bg-red-100",
    emoji: "🍎",
    examples: ["🍎", "🌹", "❤️", "🍓"],
    description: "Màu của táo, hoa hồng",
  },
  {
    name: "Vàng",
    english: "Yellow",
    color: "#FFFF00",
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-300",
    hoverColor: "hover:bg-yellow-600",
    lightBg: "bg-yellow-100",
    emoji: "☀️",
    examples: ["☀️", "🍌", "⭐", "🌻"],
    description: "Màu của mặt trời, chuối",
  },
  {
    name: "Xanh Lục",
    english: "Green",
    color: "#00FF00",
    bgColor: "bg-green-500",
    borderColor: "border-green-300",
    hoverColor: "hover:bg-green-600",
    lightBg: "bg-green-100",
    emoji: "🌳",
    examples: ["🌳", "🍃", "🐸", "🥒"],
    description: "Màu của cây lá, ếch",
  },
  {
    name: "Xanh Lam",
    english: "Blue",
    color: "#0000FF",
    bgColor: "bg-blue-500",
    borderColor: "border-blue-300",
    hoverColor: "hover:bg-blue-600",
    lightBg: "bg-blue-100",
    emoji: "🌊",
    examples: ["🌊", "🐋", "💙", "🫐"],
    description: "Màu của biển, cá voi",
  },
  {
    name: "Đen",
    english: "Black",
    color: "#000000",
    bgColor: "bg-gray-800",
    borderColor: "border-gray-600",
    hoverColor: "hover:bg-gray-900",
    lightBg: "bg-gray-100",
    emoji: "🐧",
    examples: ["🐧", "🖤", "🦇", "⚫"],
    description: "Màu của chim cánh cụt",
  },
  {
    name: "Trắng",
    english: "White",
    color: "#FFFFFF",
    bgColor: "bg-white",
    borderColor: "border-gray-300",
    hoverColor: "hover:bg-gray-50",
    lightBg: "bg-gray-50",
    emoji: "☁️",
    examples: ["☁️", "🤍", "🐑", "⚪"],
    description: "Màu của mây, cừu",
  },
  {
    name: "Tím",
    english: "Purple",
    color: "#800080",
    bgColor: "bg-purple-500",
    borderColor: "border-purple-300",
    hoverColor: "hover:bg-purple-600",
    lightBg: "bg-purple-100",
    emoji: "🍇",
    examples: ["🍇", "💜", "🦄", "🔮"],
    description: "Màu của nho, kỳ lân",
  },
];

export default function ColorLearning() {
  const { playClickSound, playColorSound } = useSound();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleColorClick = (colorName: string) => {
    playClickSound();
    playColorSound(colorName);
    setSelectedColor(colorName);
    setShowCelebration(true);

    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
  };

  const resetSelection = () => {
    setSelectedColor(null);
    setShowCelebration(false);
  };

  const selectedColorData = colorData.find((item) => item.name === selectedColor);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hiển thị màu được chọn */}
      {selectedColor && selectedColorData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-lg mx-4 text-center relative">
            {showCelebration && (
              <div className="absolute -top-4 -left-4 -right-4 -bottom-4 pointer-events-none">
                <div className="animate-bounce text-6xl">🎨</div>
                <div className="absolute top-4 right-4 animate-spin text-4xl">🌈</div>
                <div className="absolute bottom-4 left-4 animate-pulse text-4xl">✨</div>
              </div>
            )}

            {/* Hiển thị màu lớn */}
            <div
              className={`w-32 h-32 mx-auto mb-4 rounded-full border-8 ${selectedColorData.borderColor} shadow-lg`}
              style={{ backgroundColor: selectedColorData.color }}
            />

            <div className="text-4xl font-bold text-gray-800 mb-2">{selectedColorData.name}</div>
            <div className="text-2xl text-gray-600 mb-4">{selectedColorData.english}</div>

            <div className="text-6xl mb-4">{selectedColorData.emoji}</div>

            <div className="text-lg text-gray-600 mb-4">{selectedColorData.description}</div>

            {/* Ví dụ */}
            <div className="mb-6">
              <div className="text-lg font-semibold text-gray-700 mb-2">Ví dụ:</div>
              <div className="flex justify-center gap-3">
                {selectedColorData.examples.map((example, index) => (
                  <span
                    key={index}
                    className="text-4xl animate-bounce"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  playClickSound();
                  playColorSound(selectedColor);
                }}
                className="bg-green-500 hover:bg-green-600 text-white text-lg px-6 py-3"
              >
                <Volume2 className="mr-2" />
                Nghe
              </Button>

              <Button
                onClick={() => {
                  playClickSound();
                  resetSelection();
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white text-lg px-6 py-3"
              >
                <RotateCcw className="mr-2" />
                Đóng
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Lưới màu sắc */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {colorData.map((item) => (
          <Card
            key={item.name}
            className={`${item.lightBg} border-4 ${item.borderColor} cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 p-6 text-center`}
            onClick={() => handleColorClick(item.name)}
          >
            {/* Vòng tròn màu */}
            <div
              className={`w-24 h-24 mx-auto mb-4 rounded-full border-4 ${item.borderColor} shadow-lg`}
              style={{ backgroundColor: item.color }}
            />

            {/* Tên màu */}
            <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{item.name}</div>
            <div className="text-lg text-gray-600 mb-3">{item.english}</div>

            {/* Emoji đại diện */}
            <div className="text-4xl md:text-5xl mb-3">{item.emoji}</div>

            {/* Ví dụ nhỏ */}
            <div className="flex justify-center gap-1">
              {item.examples.slice(0, 3).map((example, index) => (
                <span key={index} className="text-2xl">
                  {example}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Hướng dẫn */}
      <div className="text-center mt-8 text-lg text-purple-600 bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>🎨</span>
          <span className="font-semibold">Nhấn vào màu để học nhé!</span>
          <span>🎨</span>
        </div>
        <div className="text-sm text-purple-500">Học 7 màu cơ bản với ví dụ sinh động</div>
      </div>
    </div>
  );
}
