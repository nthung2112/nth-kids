import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, RotateCcw } from "lucide-react";
import { useSound } from "../hooks/useSound";

const alphabetData = [
  {
    letter: "A",
    vietnamese: "Ăn",
    emoji: "🍎",
    word: "Apple - Táo",
    color: "bg-red-100 border-red-300 hover:bg-red-200",
  },
  {
    letter: "B",
    vietnamese: "Bóng",
    emoji: "⚽",
    word: "Ball - Bóng",
    color: "bg-orange-100 border-orange-300 hover:bg-orange-200",
  },
  {
    letter: "C",
    vietnamese: "Mèo",
    emoji: "🐱",
    word: "Cat - Mèo",
    color: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
  },
  {
    letter: "D",
    vietnamese: "Chó",
    emoji: "🐶",
    word: "Dog - Chó",
    color: "bg-green-100 border-green-300 hover:bg-green-200",
  },
  {
    letter: "E",
    vietnamese: "Voi",
    emoji: "🐘",
    word: "Elephant - Voi",
    color: "bg-blue-100 border-blue-300 hover:bg-blue-200",
  },
  {
    letter: "F",
    vietnamese: "Cá",
    emoji: "🐠",
    word: "Fish - Cá",
    color: "bg-indigo-100 border-indigo-300 hover:bg-indigo-200",
  },
  {
    letter: "G",
    vietnamese: "Nho",
    emoji: "🍇",
    word: "Grape - Nho",
    color: "bg-purple-100 border-purple-300 hover:bg-purple-200",
  },
  {
    letter: "H",
    vietnamese: "Ngựa",
    emoji: "🐴",
    word: "Horse - Ngựa",
    color: "bg-pink-100 border-pink-300 hover:bg-pink-200",
  },
  {
    letter: "I",
    vietnamese: "Kem",
    emoji: "🍦",
    word: "Ice cream - Kem",
    color: "bg-red-100 border-red-300 hover:bg-red-200",
  },
  {
    letter: "J",
    vietnamese: "Kẹo",
    emoji: "🍬",
    word: "Jelly - Kẹo",
    color: "bg-orange-100 border-orange-300 hover:bg-orange-200",
  },
  {
    letter: "K",
    vietnamese: "Diều",
    emoji: "🪁",
    word: "Kite - Diều",
    color: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
  },
  {
    letter: "L",
    vietnamese: "Sư tử",
    emoji: "🦁",
    word: "Lion - Sư tử",
    color: "bg-green-100 border-green-300 hover:bg-green-200",
  },
  {
    letter: "M",
    vietnamese: "Khỉ",
    emoji: "🐵",
    word: "Monkey - Khỉ",
    color: "bg-blue-100 border-blue-300 hover:bg-blue-200",
  },
  {
    letter: "N",
    vietnamese: "Tổ",
    emoji: "🪺",
    word: "Nest - Tổ",
    color: "bg-indigo-100 border-indigo-300 hover:bg-indigo-200",
  },
  {
    letter: "O",
    vietnamese: "Cam",
    emoji: "🍊",
    word: "Orange - Cam",
    color: "bg-purple-100 border-purple-300 hover:bg-purple-200",
  },
  {
    letter: "P",
    vietnamese: "Gấu",
    emoji: "🐼",
    word: "Panda - Gấu trúc",
    color: "bg-pink-100 border-pink-300 hover:bg-pink-200",
  },
  {
    letter: "Q",
    vietnamese: "Nữ hoàng",
    emoji: "👸",
    word: "Queen - Nữ hoàng",
    color: "bg-red-100 border-red-300 hover:bg-red-200",
  },
  {
    letter: "R",
    vietnamese: "Thỏ",
    emoji: "🐰",
    word: "Rabbit - Thỏ",
    color: "bg-orange-100 border-orange-300 hover:bg-orange-200",
  },
  {
    letter: "S",
    vietnamese: "Mặt trời",
    emoji: "☀️",
    word: "Sun - Mặt trời",
    color: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
  },
  {
    letter: "T",
    vietnamese: "Cây",
    emoji: "🌳",
    word: "Tree - Cây",
    color: "bg-green-100 border-green-300 hover:bg-green-200",
  },
  {
    letter: "U",
    vietnamese: "Ô",
    emoji: "☂️",
    word: "Umbrella - Ô",
    color: "bg-blue-100 border-blue-300 hover:bg-blue-200",
  },
  {
    letter: "V",
    vietnamese: "Bình hoa",
    emoji: "🏺",
    word: "Vase - Bình hoa",
    color: "bg-indigo-100 border-indigo-300 hover:bg-indigo-200",
  },
  {
    letter: "W",
    vietnamese: "Cá voi",
    emoji: "🐋",
    word: "Whale - Cá voi",
    color: "bg-purple-100 border-purple-300 hover:bg-purple-200",
  },
  {
    letter: "X",
    vietnamese: "Tia X",
    emoji: "🩻",
    word: "X-ray - Tia X",
    color: "bg-pink-100 border-pink-300 hover:bg-pink-200",
  },
  {
    letter: "Y",
    vietnamese: "Sợi",
    emoji: "🧶",
    word: "Yarn - Sợi",
    color: "bg-red-100 border-red-300 hover:bg-red-200",
  },
  {
    letter: "Z",
    vietnamese: "Ngựa vằn",
    emoji: "🦓",
    word: "Zebra - Ngựa vằn",
    color: "bg-orange-100 border-orange-300 hover:bg-orange-200",
  },
];

export default function AlphabetLearning() {
  const { playClickSound, playLetterSound } = useSound();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleLetterClick = (letter: string) => {
    playClickSound();
    playLetterSound(letter);
    setSelectedLetter(letter);
    setShowCelebration(true);

    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
  };

  const resetSelection = () => {
    setSelectedLetter(null);
    setShowCelebration(false);
  };

  const selectedLetterData = alphabetData.find((item) => item.letter === selectedLetter);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hiển thị chữ cái được chọn */}
      {selectedLetter && selectedLetterData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-lg mx-4 text-center relative">
            {showCelebration && (
              <div className="absolute -top-4 -left-4 -right-4 -bottom-4 pointer-events-none">
                <div className="animate-bounce text-6xl">🎉</div>
                <div className="absolute top-4 right-4 animate-spin text-4xl">⭐</div>
                <div className="absolute bottom-4 left-4 animate-pulse text-4xl">🎊</div>
              </div>
            )}

            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="text-8xl font-bold text-purple-800">{selectedLetter}</div>
              <div className="text-6xl font-bold text-purple-600">
                {selectedLetter.toLowerCase()}
              </div>
            </div>

            <div className="text-6xl mb-4">{selectedLetterData.emoji}</div>

            <div className="text-2xl font-bold text-purple-600 mb-2">{selectedLetterData.word}</div>

            <div className="text-xl text-purple-500 mb-6">{selectedLetterData.vietnamese}</div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  playClickSound();
                  playLetterSound(selectedLetter);
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

      {/* Lưới chữ cái */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {alphabetData.map((item) => (
          <Card
            key={item.letter}
            className={`${item.color} border-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 p-4 text-center`}
            onClick={() => handleLetterClick(item.letter)}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="text-4xl md:text-5xl font-bold text-gray-800">{item.letter}</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-600">
                  {item.letter.toLowerCase()}
                </div>
              </div>

              <div className="text-3xl md:text-4xl">{item.emoji}</div>

              <div className="text-sm md:text-base font-semibold text-gray-700 text-center leading-tight">
                {item.vietnamese}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Hướng dẫn */}
      <div className="text-center mt-8 text-lg text-purple-600 bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>👆</span>
          <span className="font-semibold">Nhấn vào chữ cái để học nhé!</span>
          <span>👆</span>
        </div>
        <div className="text-sm text-purple-500">Học bảng chữ cái từ A đến Z</div>
      </div>
    </div>
  );
}
