import { Star } from "lucide-react";

export default function Footer() {
  return (
    <div className="text-center mt-12 mb-8">
      <div className="flex justify-center items-center gap-2 text-2xl text-purple-700 font-semibold">
        <Star className="text-yellow-500" />
        <span>Chúc bé học tập vui vẻ!</span>
        <Star className="text-yellow-500" />
      </div>

      <div className="mt-4 text-lg text-purple-600">
        👶 Dành cho bé 2+ tuổi - Học số, chữ cái và màu sắc 👶
      </div>
    </div>
  );
}
