import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

export default function SoundControl() {
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    setIsMuted(!isMuted);
    // Lưu trạng thái vào localStorage
    localStorage.setItem("soundMuted", (!isMuted).toString());
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <Button
        onClick={toggleSound}
        className={`rounded-full w-12 h-12 p-0 ${
          isMuted ? "bg-gray-500 hover:bg-gray-600" : "bg-green-500 hover:bg-green-600"
        } text-white shadow-lg`}
        title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </Button>
    </div>
  );
}
