import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Palette, RotateCcw, Download, Eraser } from "lucide-react";
import { useSound } from "../hooks/useSound";

const colorPalette = [
  { name: "Đỏ", color: "#FF0000" },
  { name: "Vàng", color: "#FFD700" },
  { name: "Xanh Lục", color: "#00AA00" },
  { name: "Xanh Lam", color: "#0066FF" },
  { name: "Tím", color: "#8A2BE2" },
  { name: "Cam", color: "#FF8C00" },
  { name: "Hồng", color: "#FF69B4" },
  { name: "Nâu", color: "#8B4513" },
];

// Các hình đơn giản để tô màu
const coloringTemplates = [
  {
    name: "Mặt trời",
    emoji: "☀️",
    paths: [
      // Mặt trời
      "M 150 150 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0",
      // Tia sáng
      "M 150 50 L 150 30 M 150 270 L 150 290 M 50 150 L 30 150 M 270 150 L 290 150",
      "M 89 89 L 75 75 M 211 211 L 225 225 M 89 211 L 75 225 M 211 89 L 225 75",
    ],
  },
  {
    name: "Ngôi nhà",
    emoji: "🏠",
    paths: [
      // Mái nhà
      "M 100 100 L 150 50 L 200 100 Z",
      // Thân nhà
      "M 110 100 L 190 100 L 190 180 L 110 180 Z",
      // Cửa
      "M 130 140 L 130 180 L 160 180 L 160 140 Z",
      // Cửa sổ
      "M 170 120 L 185 120 L 185 135 L 170 135 Z",
    ],
  },
  {
    name: "Cây",
    emoji: "🌳",
    paths: [
      // Thân cây
      "M 145 150 L 155 150 L 155 200 L 145 200 Z",
      // Lá cây
      "M 150 150 m -30 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0",
      "M 150 130 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0",
      "M 150 110 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0",
    ],
  },
];

export default function ColoringGame() {
  const { playClickSound, playColorSound, playSuccessSound } = useSound();
  const [selectedColor, setSelectedColor] = useState(colorPalette[0].color);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [coloredPaths, setColoredPaths] = useState<{ [key: number]: string }>({});
  const [brushSize, setBrushSize] = useState(3);
  const [isErasing, setIsErasing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleColorSelect = (color: string, colorName: string) => {
    playClickSound();
    playColorSound(colorName);
    setSelectedColor(color);
    setIsErasing(false);
  };

  const handlePathClick = (pathIndex: number) => {
    playClickSound();
    if (isErasing) {
      // Xóa màu
      const newColoredPaths = { ...coloredPaths };
      delete newColoredPaths[pathIndex];
      setColoredPaths(newColoredPaths);
    } else {
      // Tô màu
      setColoredPaths({
        ...coloredPaths,
        [pathIndex]: selectedColor,
      });
      playSuccessSound();
    }
  };

  const clearAll = () => {
    playClickSound();
    setColoredPaths({});
  };

  const changeTemplate = (templateIndex: number) => {
    playClickSound();
    setSelectedTemplate(templateIndex);
    setColoredPaths({});
  };

  const downloadImage = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 300;
    canvas.height = 250;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const link = document.createElement("a");
        link.download = `tranh-to-mau-${coloringTemplates[selectedTemplate].name}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const currentTemplate = coloringTemplates[selectedTemplate];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bảng màu */}
        <Card className="p-6 bg-linear-to-br from-pink-100 to-purple-100 border-4 border-pink-300">
          <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">
            <Palette className="inline mr-2" />
            Bảng Màu
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {colorPalette.map((color) => (
              <Button
                key={color.name}
                onClick={() => handleColorSelect(color.color, color.name)}
                className={`h-16 rounded-xl border-4 transition-all duration-300 ${
                  selectedColor === color.color && !isErasing
                    ? "border-purple-500 scale-110 shadow-lg"
                    : "border-gray-300 hover:scale-105"
                }`}
                style={{ backgroundColor: color.color }}
              >
                <span className="text-white font-bold text-sm drop-shadow-lg">{color.name}</span>
              </Button>
            ))}
          </div>

          {/* Công cụ */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                playClickSound();
                setIsErasing(!isErasing);
              }}
              className={`w-full h-12 ${
                isErasing
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              <Eraser className="mr-2" />
              {isErasing ? "Đang Xóa" : "Tẩy Xóa"}
            </Button>

            <Button
              onClick={clearAll}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <RotateCcw className="mr-2" />
              Xóa Tất Cả
            </Button>

            <Button
              onClick={downloadImage}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white"
            >
              <Download className="mr-2" />
              Tải Về
            </Button>
          </div>
        </Card>

        {/* Khu vực tô màu */}
        <Card className="p-6 bg-white border-4 border-blue-300">
          <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">
            {currentTemplate.emoji} {currentTemplate.name}
          </h3>

          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <svg
              ref={svgRef}
              width="100%"
              height="250"
              viewBox="0 0 300 250"
              className="border-2 border-dashed border-gray-300 rounded-lg bg-white"
            >
              {currentTemplate.paths.map((path, index) => (
                <path
                  key={index}
                  d={path}
                  fill={coloredPaths[index] || "transparent"}
                  stroke="#333"
                  strokeWidth="2"
                  className="cursor-pointer hover:stroke-purple-500 transition-all duration-200"
                  onClick={() => handlePathClick(index)}
                />
              ))}
            </svg>
          </div>

          {/* Hướng dẫn */}
          <div className="mt-4 text-center text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
            <div className="font-semibold mb-1">
              {isErasing ? "🧽 Nhấn vào vùng để xóa màu" : "🎨 Nhấn vào vùng để tô màu"}
            </div>
            <div>Chọn màu từ bảng màu bên trái</div>
          </div>
        </Card>

        {/* Chọn mẫu */}
        <Card className="p-6 bg-linear-to-br from-green-100 to-blue-100 border-4 border-green-300">
          <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">Chọn Mẫu Tranh</h3>

          <div className="space-y-3">
            {coloringTemplates.map((template, index) => (
              <Button
                key={index}
                onClick={() => changeTemplate(index)}
                className={`w-full h-16 text-left ${
                  selectedTemplate === index
                    ? "bg-green-500 hover:bg-green-600 text-white border-4 border-green-700"
                    : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{template.emoji}</span>
                  <span className="text-lg font-semibold">{template.name}</span>
                </div>
              </Button>
            ))}
          </div>

          {/* Thống kê */}
          <div className="mt-6 bg-white rounded-lg p-4 border-2 border-green-200">
            <h4 className="font-bold text-green-700 mb-2">Tiến Độ Tô Màu:</h4>
            <div className="text-sm text-gray-600">
              <div>
                Đã tô: {Object.keys(coloredPaths).length}/{currentTemplate.paths.length} vùng
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (Object.keys(coloredPaths).length / currentTemplate.paths.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Hướng dẫn chung */}
      <Card className="mt-6 p-4 bg-linear-to-r from-yellow-100 to-orange-100 border-4 border-yellow-300">
        <div className="text-center">
          <h4 className="text-xl font-bold text-orange-800 mb-2">🎨 Cách Chơi Tô Màu 🎨</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-orange-700">
            <div>
              <span className="font-semibold">1. Chọn màu:</span> Nhấn vào màu yêu thích
            </div>
            <div>
              <span className="font-semibold">2. Tô màu:</span> Nhấn vào vùng trên tranh
            </div>
            <div>
              <span className="font-semibold">3. Hoàn thành:</span> Tải về tranh đẹp của bé!
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
