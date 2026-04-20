import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Settings } from "lucide-react";

interface NumberSettingsProps {
  currentMax: number;
  onMaxChange: (max: number) => void;
  onClose: () => void;
}

const presetRanges = [
  {
    max: 10,
    label: "1-10",
    description: "Cơ bản cho bé 2-3 tuổi",
    emoji: "👶",
    color: "bg-green-100 border-green-300",
  },
  {
    max: 20,
    label: "1-20",
    description: "Phát triển cho bé 3-4 tuổi",
    emoji: "🧒",
    color: "bg-blue-100 border-blue-300",
  },
  {
    max: 30,
    label: "1-30",
    description: "Nâng cao cho bé 4-5 tuổi",
    emoji: "👦",
    color: "bg-purple-100 border-purple-300",
  },
  {
    max: 50,
    label: "1-50",
    description: "Thử thách cho bé 5-6 tuổi",
    emoji: "🎯",
    color: "bg-orange-100 border-orange-300",
  },
  {
    max: 80,
    label: "1-80",
    description: "Khó cho bé 6+ tuổi",
    emoji: "🚀",
    color: "bg-red-100 border-red-300",
  },
  {
    max: 100,
    label: "1-100",
    description: "Siêu khó cho bé thông minh",
    emoji: "🏆",
    color: "bg-yellow-100 border-yellow-300",
  },
];

export default function NumberSettings({ currentMax, onMaxChange, onClose }: NumberSettingsProps) {
  const [selectedMax, setSelectedMax] = useState(currentMax);

  const handleSave = () => {
    onMaxChange(selectedMax);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 p-0 bg-gray-200 hover:bg-gray-300 text-gray-600"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Settings className="text-purple-600" />
            <h2 className="text-3xl font-bold text-purple-800">Cài Đặt Phạm Vi Số</h2>
          </div>
          <p className="text-lg text-purple-600">Chọn phạm vi số phù hợp với độ tuổi của bé</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {presetRanges.map((range) => (
            <Card
              key={range.max}
              className={`${
                range.color
              } border-4 cursor-pointer transform transition-all duration-300 hover:scale-105 p-4 ${
                selectedMax === range.max ? "ring-4 ring-purple-400 scale-105" : ""
              }`}
              onClick={() => setSelectedMax(range.max)}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{range.emoji}</div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{range.label}</div>
                <div className="text-sm text-gray-600 mb-2">{range.description}</div>
                <div className="text-xs text-gray-500">
                  {range.max <= 10
                    ? "Rất dễ"
                    : range.max <= 30
                      ? "Dễ"
                      : range.max <= 50
                        ? "Trung bình"
                        : "Khó"}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="mb-4">
            <div className="text-lg font-semibold text-purple-700">Đã chọn: 1 - {selectedMax}</div>
            <div className="text-sm text-purple-500">
              {selectedMax <= 10 && "Hoàn hảo cho việc học đếm cơ bản"}
              {selectedMax > 10 && selectedMax <= 30 && "Tốt cho việc phát triển kỹ năng đếm"}
              {selectedMax > 30 && selectedMax <= 50 && "Thử thách phù hợp cho trẻ lớn hơn"}
              {selectedMax > 50 && "Dành cho trẻ đã thành thạo đếm cơ bản"}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full"
            >
              Áp Dụng
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
