import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSound } from "@/hooks/useSound";
import SoundControl from "@/components/sound-control";
import Footer from "@/components/layout/footer";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { playClickSound } = useSound();
  const navigate = useNavigate();

  const navigateTo = (path: "/numbers" | "/letters" | "/colors") => {
    playClickSound();
    navigate({ to: path });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-200 via-purple-200 to-pink-200 p-4">
      <SoundControl />

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-bold text-purple-800 mb-4">
          🌟 Học Tập Cùng Bé 🌟
        </h1>
        <p className="text-2xl md:text-3xl text-purple-600 font-semibold mb-8">
          Khám phá thế giới số, chữ cái và màu sắc
        </p>
      </div>

      {/* Main content cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {/* Numbers Card */}
        <Card
          className="p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-blue-300"
          onClick={() => navigateTo("/numbers")}
        >
          <div className="text-8xl mb-6">🔢</div>
          <h2 className="text-3xl font-bold text-blue-800 mb-4">Học Số</h2>
          <p className="text-lg text-blue-600 mb-6">
            Cùng bé học đếm từ 1 đến 100 với các trò chơi vui nhộn
          </p>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-3 rounded-full">
            Bắt Đầu Học
          </Button>
        </Card>

        {/* Letters Card */}
        <Card
          className="p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-300"
          onClick={() => navigateTo("/letters")}
        >
          <div className="text-8xl mb-6">🔤</div>
          <h2 className="text-3xl font-bold text-green-800 mb-4">Học Chữ Cái</h2>
          <p className="text-lg text-green-600 mb-6">
            Khám phá bảng chữ cái A-Z với âm thanh và hình ảnh sinh động
          </p>
          <Button className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-3 rounded-full">
            Bắt Đầu Học
          </Button>
        </Card>

        {/* Colors Card */}
        <Card
          className="p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-pink-100 to-pink-200 border-4 border-pink-300"
          onClick={() => navigateTo("/colors")}
        >
          <div className="text-8xl mb-6">🎨</div>
          <h2 className="text-3xl font-bold text-pink-800 mb-4">Học Màu Sắc</h2>
          <p className="text-lg text-pink-600 mb-6">Nhận biết màu sắc và thử tài tô màu sáng tạo</p>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-3 rounded-full">
            Bắt Đầu Học
          </Button>
        </Card>
      </div>

      {/* Features section */}
      <div className="max-w-4xl mx-auto mb-12">
        <h3 className="text-3xl font-bold text-purple-800 text-center mb-8">
          🎯 Tính Năng Nổi Bật
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/70 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">�</div>
            <h4 className="text-xl font-bold text-purple-700 mb-2">Trò Chơi Tương Tác</h4>
            <p className="text-purple-600">Học qua chơi với nhiều mini-game thú vị</p>
          </div>
          <div className="bg-white/70 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🔊</div>
            <h4 className="text-xl font-bold text-purple-700 mb-2">Âm Thanh Sinh Động</h4>
            <p className="text-purple-600">Phát âm chuẩn giúp bé học hiệu quả</p>
          </div>
          <div className="bg-white/70 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">⚙️</div>
            <h4 className="text-xl font-bold text-purple-700 mb-2">Tùy Chỉnh Linh Hoạt</h4>
            <p className="text-purple-600">Điều chỉnh độ khó phù hợp với từng bé</p>
          </div>
          <div className="bg-white/70 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">📱</div>
            <h4 className="text-xl font-bold text-purple-700 mb-2">Thân Thiện Mobile</h4>
            <p className="text-purple-600">Hoạt động mượt mà trên mọi thiết bị</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
