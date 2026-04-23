import { Download, Languages, Mic, Play, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePreferences, type TtsVoicePreference } from "@/hooks/usePreferences";
import { useTts } from "@/hooks/useTts";
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

interface VoiceModeOption {
  id: TtsVoicePreference;
  labelKey: string;
  helpKey: string;
}

const VOICE_MODES: VoiceModeOption[] = [
  {
    id: "native-first",
    labelKey: "settings.tts.voiceMode.nativeFirst",
    helpKey: "settings.tts.voiceMode.nativeFirstHelp",
  },
  {
    id: "native-only",
    labelKey: "settings.tts.voiceMode.nativeOnly",
    helpKey: "settings.tts.voiceMode.nativeOnlyHelp",
  },
  {
    id: "fallback-only",
    labelKey: "settings.tts.voiceMode.fallbackOnly",
    helpKey: "settings.tts.voiceMode.fallbackOnlyHelp",
  },
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
  const tts = useTts();

  const currentBase = (i18n.language ?? "vi").split("-")[0];

  const handleDownloadFallback = async () => {
    try {
      await tts.preloadFallback();
    } catch (error) {
      console.warn("TTS fallback download failed", error);
    }
  };

  const handlePreviewVoice = () => {
    const sample =
      tts.currentLocale === "vi"
        ? t("settings.tts.previewSampleVi")
        : t("settings.tts.previewSampleEn");
    tts.speak(sample);
  };

  const engineLabelKey =
    tts.resolvedEngine === "native"
      ? "settings.tts.engine.native"
      : tts.resolvedEngine === "kokoro"
        ? "settings.tts.engine.kokoro"
        : tts.resolvedEngine === "piper"
          ? "settings.tts.engine.piper"
          : "settings.tts.engine.none";

  // Fallback download is needed whenever the resolved engine is not native.
  // This covers both "no suitable native voice" and "user explicitly picked
  // fallback-only" without surprising downloads happening behind the scenes.
  const showFallbackHint =
    tts.isAvailable &&
    tts.resolvedEngine !== null &&
    tts.resolvedEngine !== "native" &&
    !tts.isFallbackLoaded &&
    prefs.ttsEnabled &&
    !prefs.soundMuted;

  const downloadingFallback = tts.preloadProgress !== null && tts.status === "loading";
  const downloadRatioPct =
    tts.preloadProgress && Number.isFinite(tts.preloadProgress.ratio)
      ? Math.round(tts.preloadProgress.ratio * 100)
      : null;

  const selectedVoiceMode =
    VOICE_MODES.find(mode => mode.id === prefs.ttsPreferredVoiceMode) ?? VOICE_MODES[0];
  const voiceModeDisabled = !prefs.ttsEnabled || prefs.soundMuted;

  const sectionTitle = (key: string, icon: string) => (
    <div className="mb-3 flex items-center gap-2">
      <span aria-hidden="true">{icon}</span>
      <h2 className="text-base font-bold text-purple-800 sm:text-lg">{t(key)}</h2>
    </div>
  );

  return (
    <div className="flex flex-col px-4 pt-[max(env(safe-area-inset-top),16px)] pb-4">
      <header className="mb-4 text-center sm:mb-5">
        <h1 className="text-2xl font-bold text-purple-800 sm:text-3xl">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-purple-600 sm:text-base">{t("settings.subtitle")}</p>
      </header>

      <section className="mb-5">
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

      <section className="mb-5">
        {sectionTitle("settings.sections.voice", "🎙️")}
        {!tts.isAvailable ? (
          <div className="rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800">
            {t("settings.tts.unavailable")}
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={() => update({ ttsEnabled: !prefs.ttsEnabled })}
              className={`h-auto w-full justify-start rounded-xl border-4 px-4 py-3 text-left ${
                prefs.ttsEnabled
                  ? "border-purple-500 bg-purple-100 text-purple-800"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              aria-pressed={prefs.ttsEnabled}
            >
              <Mic className="mr-3 h-5 w-5 shrink-0" />
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold">{t("settings.tts.enable")}</span>
                <span className="text-xs opacity-80">{t("settings.tts.enableHelp")}</span>
              </div>
            </Button>

            <Button
              onClick={() => update({ ttsAutoSpeakQuestions: !prefs.ttsAutoSpeakQuestions })}
              disabled={!prefs.ttsEnabled || prefs.soundMuted}
              className={`h-auto w-full justify-start rounded-xl border-4 px-4 py-3 text-left disabled:opacity-50 ${
                prefs.ttsAutoSpeakQuestions
                  ? "border-purple-500 bg-purple-100 text-purple-800"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              aria-pressed={prefs.ttsAutoSpeakQuestions}
            >
              <Sparkles className="mr-3 h-5 w-5 shrink-0" />
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold">{t("settings.tts.autoSpeak")}</span>
                <span className="text-xs opacity-80">{t("settings.tts.autoSpeakHelp")}</span>
              </div>
            </Button>

            <div
              role="radiogroup"
              aria-label={t("settings.tts.voiceMode.label")}
              aria-disabled={voiceModeDisabled}
              className={voiceModeDisabled ? "opacity-50" : undefined}
            >
              <div className="mb-1.5 text-xs font-semibold text-purple-700">
                {t("settings.tts.voiceMode.label")}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {VOICE_MODES.map(mode => {
                  const isActive = prefs.ttsPreferredVoiceMode === mode.id;
                  return (
                    <Button
                      key={mode.id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      disabled={voiceModeDisabled}
                      onClick={() => update({ ttsPreferredVoiceMode: mode.id })}
                      className={`h-12 rounded-xl border-4 px-2 text-xs font-semibold disabled:cursor-not-allowed sm:text-sm ${
                        isActive
                          ? "border-purple-500 bg-purple-100 text-purple-800"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {t(mode.labelKey)}
                    </Button>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-purple-600">{t(selectedVoiceMode.helpKey)}</div>
            </div>

            <Card className="border-2 border-purple-200 bg-purple-50/40 p-3 text-sm text-purple-800">
              <div className="mb-1 text-xs font-semibold text-purple-700">
                {t("settings.tts.currentVoiceLabel")}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{t(engineLabelKey)}</div>
                  {tts.resolvedVoiceName && (
                    <div className="truncate text-xs text-purple-600">
                      {tts.resolvedVoiceName}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handlePreviewVoice}
                  disabled={!prefs.ttsEnabled || prefs.soundMuted || tts.status === "loading"}
                  className="h-10 shrink-0 rounded-lg bg-green-500 px-3 text-white hover:bg-green-600 disabled:opacity-50"
                >
                  <Play className="mr-1 h-4 w-4" />
                  <span>{t("settings.tts.previewVoice")}</span>
                </Button>
              </div>
            </Card>

            {showFallbackHint && (
              <Card className="border-2 border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <div className="mb-2">{t("settings.tts.fallbackHint")}</div>
                <Button
                  type="button"
                  onClick={handleDownloadFallback}
                  disabled={downloadingFallback}
                  className="h-10 rounded-lg bg-amber-500 px-3 text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloadingFallback
                    ? t("settings.tts.downloadingFallback")
                    : t("settings.tts.downloadFallback")}
                </Button>
                {downloadingFallback && downloadRatioPct !== null && (
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-200">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{ width: `${downloadRatioPct}%` }}
                    />
                  </div>
                )}
              </Card>
            )}

            {tts.isFallbackLoaded && tts.resolvedEngine !== "native" && (
              <div className="rounded-xl bg-green-50 p-2 text-center text-xs font-semibold text-green-800">
                {t("settings.tts.fallbackReady")}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mb-5">
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

      <section className="mb-5">
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

      <section>
        {sectionTitle("settings.sections.numberRange", "🔢")}
        <div className="mb-3 grid grid-cols-2 gap-3">
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
  );
}
