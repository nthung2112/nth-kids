import { Languages, Play, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePreferences } from "@/hooks/usePreferences";
import { useSound } from "@/hooks/useSound";
import { usePreloadSprite } from "@/hooks/useSpritePreload";
import { SUPPORTED_LANGUAGES } from "@/i18n";

interface PresetRange {
  max: number;
  label: string;
  descriptionKey: string;
  emoji: string;
  color: string;
}

const PRESET_RANGES: PresetRange[] = [
  { max: 10, label: "1-10", descriptionKey: "settings.ranges.r10", emoji: "👶", color: "bg-green-100 border-green-300" },
  { max: 20, label: "1-20", descriptionKey: "settings.ranges.r20", emoji: "🧒", color: "bg-blue-100 border-blue-300" },
  { max: 30, label: "1-30", descriptionKey: "settings.ranges.r30", emoji: "👦", color: "bg-purple-100 border-purple-300" },
  { max: 50, label: "1-50", descriptionKey: "settings.ranges.r50", emoji: "🎯", color: "bg-orange-100 border-orange-300" },
  { max: 80, label: "1-80", descriptionKey: "settings.ranges.r80", emoji: "🚀", color: "bg-red-100 border-red-300" },
  { max: 100, label: "1-100", descriptionKey: "settings.ranges.r100", emoji: "🏆", color: "bg-yellow-100 border-yellow-300" },
];

const difficultyKey = (max: number) => {
  if (max <= 10) return "settings.difficulty.veryEasy";
  if (max <= 30) return "settings.difficulty.easy";
  if (max <= 50) return "settings.difficulty.medium";
  return "settings.difficulty.hard";
};

const hintKey = (max: number) => {
  if (max <= 10) return "settings.hints.level1";
  if (max <= 30) return "settings.hints.level2";
  if (max <= 50) return "settings.hints.level3";
  return "settings.hints.level4";
};

export default function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const { prefs, update } = usePreferences();
  const { playPromptSound } = useSound();

  // Preload prompt sprite so the very first preview tap plays without delay.
  usePreloadSprite("prompts");

  const currentBase = (i18n.language ?? "vi").split("-")[0];

  const handlePreviewVoice = () => {
    playPromptSound("preview");
  };

  const sectionTitle = (key: string, icon: string) => (
    <div className="mb-3 flex items-center gap-2">
      <span aria-hidden="true">{icon}</span>
      <h2 className="text-base font-bold text-purple-800 sm:text-lg">{t(key)}</h2>
    </div>
  );

  return (
    <PageContainer>
      <header className="mb-4 text-center sm:mb-5 lg:mb-8">
        <h1 className="text-2xl font-bold text-purple-800 sm:text-3xl lg:text-4xl">
          {t("settings.title")}
        </h1>
        <p className="mt-1 text-sm text-purple-600 sm:text-base lg:text-lg">
          {t("settings.subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <section>
          {sectionTitle("settings.sections.sound", "🔊")}
          <Button
            onClick={() => update({ soundMuted: !prefs.soundMuted })}
            className={`h-12 w-full rounded-xl ${
              prefs.soundMuted
                ? "bg-gray-500 text-white hover:bg-gray-600"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
            aria-pressed={!prefs.soundMuted}
          >
            {prefs.soundMuted ? <VolumeX className="mr-2" /> : <Volume2 className="mr-2" />}
            {prefs.soundMuted ? t("settings.soundOn") : t("settings.soundOff")}
          </Button>
        </section>

        <section>
          {sectionTitle("settings.sections.voice", "🎙️")}
          <Card className="border-2 border-purple-200 bg-purple-50/40 p-3 text-sm text-purple-800">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{t("settings.voicePreview.label")}</div>
                <div className="text-xs text-purple-600">{t("settings.voicePreview.help")}</div>
              </div>
              <Button
                type="button"
                onClick={handlePreviewVoice}
                disabled={prefs.soundMuted}
                className="h-10 shrink-0 rounded-lg bg-green-500 px-3 text-white hover:bg-green-600 disabled:opacity-50"
                aria-label={t("settings.voicePreview.button")}
              >
                <Play className="mr-1 h-4 w-4" />
                <span>{t("settings.voicePreview.button")}</span>
              </Button>
            </div>
          </Card>
        </section>

        <section>
          {sectionTitle("settings.sections.language", "🌐")}
          <div className="grid grid-cols-2 gap-3">
            {SUPPORTED_LANGUAGES.map(lang => {
              const isActive = currentBase === lang.code;
              return (
                <Button
                  key={lang.code}
                  onClick={() => {
                    void i18n.changeLanguage(lang.code);
                  }}
                  className={`h-12 rounded-xl border-4 ${
                    isActive
                      ? "border-purple-500 bg-purple-100 text-purple-800"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-pressed={isActive}
                >
                  <Languages className="mr-2 h-4 w-4" />
                  <span aria-hidden="true">{lang.flag}</span>
                  <span>{lang.label}</span>
                </Button>
              );
            })}
          </div>
        </section>

        <section>
          {sectionTitle("settings.sections.accessibility", "✨")}
          <Button
            onClick={() => update({ reduceMotion: !prefs.reduceMotion })}
            className={`h-12 w-full rounded-xl border-4 ${
              prefs.reduceMotion
                ? "border-purple-500 bg-purple-100 text-purple-800"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
            aria-pressed={prefs.reduceMotion}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold">{t("settings.reduceMotion")}</span>
              <span className="text-xs opacity-80">{t("settings.reduceMotionHelp")}</span>
            </div>
          </Button>
        </section>

        <section className="lg:col-span-2">
          {sectionTitle("settings.sections.numberRange", "🔢")}
          <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {PRESET_RANGES.map(range => {
              const isActive = prefs.maxNumber === range.max;
              return (
                <Card
                  key={range.max}
                  role="button"
                  tabIndex={0}
                  className={`${range.color} cursor-pointer border-4 p-3 text-center transition-all duration-300 motion-reduce:transition-none ${
                    isActive ? "scale-105 ring-4 ring-purple-400" : "hover:scale-105"
                  }`}
                  onClick={() => update({ maxNumber: range.max })}
                  onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      update({ maxNumber: range.max });
                    }
                  }}
                  aria-pressed={isActive}
                >
                  <div className="text-3xl" aria-hidden="true">
                    {range.emoji}
                  </div>
                  <div className="text-xl font-bold text-gray-800">{range.label}</div>
                  <div className="text-xs text-gray-600">{t(range.descriptionKey)}</div>
                  <div className="mt-1 text-[10px] text-gray-500">{t(difficultyKey(range.max))}</div>
                </Card>
              );
            })}
          </div>
          <div className="text-center text-sm text-purple-700">
            {t("settings.selected", { max: prefs.maxNumber })}{" "}
            <span className="text-purple-500">· {t(hintKey(prefs.maxNumber))}</span>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
