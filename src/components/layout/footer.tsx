import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="px-4 pt-2 pb-3 text-center sm:pt-3 sm:pb-4">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-purple-700 sm:text-base">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-500 sm:h-5 sm:w-5" />
        <span>{t("footer.cheer")}</span>
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-500 sm:h-5 sm:w-5" />
      </div>
      <div className="mt-0.5 text-xs text-purple-600 sm:text-sm">{t("footer.age")}</div>
    </footer>
  );
}
