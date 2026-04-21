import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import vi from "./locales/vi.json";

export const SUPPORTED_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: SupportedLanguage = "vi";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "nthkids:lang",
    },
    returnNull: false,
  });

const applyHtmlLang = (lang: string) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang.split("-")[0];
  }
};

applyHtmlLang(i18n.language ?? DEFAULT_LANGUAGE);
i18n.on("languageChanged", applyHtmlLang);

export default i18n;
