import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/useSound";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { Settings } from "lucide-react";

interface HeaderProps {
  onShowSettings?: () => void;
  showSettingsButton?: boolean;
}

export default function Header({ onShowSettings, showSettingsButton = false }: HeaderProps) {
  const { playClickSound } = useSound();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getTitle = () => {
    if (pathname.startsWith("/numbers")) return "🌟 Học Đếm Số 🌟";
    if (pathname.startsWith("/letters")) return "🔤 Học Chữ Cái 🔤";
    if (pathname.startsWith("/colors")) return "🎨 Học Màu Sắc 🎨";
    return "🌟 Học Tập Cùng Bé 🌟";
  };

  const getSubtitle = () => {
    if (pathname.startsWith("/numbers")) return "Cùng bé học đếm số nhé!";
    if (pathname.startsWith("/letters")) return "Cùng bé học bảng chữ cái A-Z nhé!";
    if (pathname.startsWith("/colors")) return "Cùng bé học màu sắc và tô màu nhé!";
    return "Chọn chủ đề học tập cho bé";
  };

  const navigateTo = (path: "/numbers" | "/letters" | "/colors") => {
    playClickSound();
    navigate({ to: path });
  };

  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl md:text-6xl font-bold text-purple-800 mb-2">{getTitle()}</h1>
      <p className="text-xl md:text-2xl text-purple-600 font-semibold">{getSubtitle()}</p>

      {/* Navigation buttons */}
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <Button
          onClick={() => navigateTo("/numbers")}
          className={`text-lg px-6 py-3 rounded-full ${
            pathname.startsWith("/numbers")
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-white hover:bg-gray-100 text-blue-500 border-2 border-blue-500"
          }`}
        >
          🔢 Học Số
        </Button>

        <Button
          onClick={() => navigateTo("/letters")}
          className={`text-lg px-6 py-3 rounded-full ${
            pathname.startsWith("/letters")
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-white hover:bg-gray-100 text-green-500 border-2 border-green-500"
          }`}
        >
          🔤 Học Chữ
        </Button>

        <Button
          onClick={() => navigateTo("/colors")}
          className={`text-lg px-6 py-3 rounded-full ${
            pathname.startsWith("/colors")
              ? "bg-pink-500 hover:bg-pink-600 text-white"
              : "bg-white hover:bg-gray-100 text-pink-500 border-2 border-pink-500"
          }`}
        >
          🎨 Học Màu
        </Button>

        {showSettingsButton && (
          <Button
            onClick={() => {
              playClickSound();
              onShowSettings?.();
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white text-lg px-6 py-3 rounded-full"
          >
            <Settings className="mr-2 w-5 h-5" />
            Cài Đặt
          </Button>
        )}
      </div>
    </div>
  );
}
