import { useCallback, useEffect, useState } from "react";

const KEYS = {
  soundMuted: "soundMuted",
  maxNumber: "maxNumber",
  reduceMotion: "nthkids:reduce-motion",
  ttsEnabled: "nthkids:tts-enabled",
  ttsAutoSpeakQuestions: "nthkids:tts-auto-speak",
  ttsPreferredVoiceMode: "nthkids:tts-voice-mode",
} as const;

const REDUCE_MOTION_CLASS = "reduce-motion";

export type TtsVoicePreference = "native-first" | "native-only" | "fallback-only";

const TTS_VOICE_MODES: readonly TtsVoicePreference[] = [
  "native-first",
  "native-only",
  "fallback-only",
];

export interface Preferences {
  soundMuted: boolean;
  maxNumber: number;
  reduceMotion: boolean;
  ttsEnabled: boolean;
  ttsAutoSpeakQuestions: boolean;
  ttsPreferredVoiceMode: TtsVoicePreference;
}

const DEFAULTS: Preferences = {
  soundMuted: false,
  maxNumber: 10,
  reduceMotion: false,
  ttsEnabled: true,
  ttsAutoSpeakQuestions: true,
  ttsPreferredVoiceMode: "native-first",
};

const PREFS_EVENT = "nthkids:prefs-changed";

const readBoolean = (key: string, fallback: boolean): boolean => {
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === "true";
};

const readVoiceMode = (): TtsVoicePreference => {
  const raw = window.localStorage.getItem(KEYS.ttsPreferredVoiceMode);
  if (raw && (TTS_VOICE_MODES as readonly string[]).includes(raw)) {
    return raw as TtsVoicePreference;
  }
  return DEFAULTS.ttsPreferredVoiceMode;
};

const readPreferences = (): Preferences => {
  if (typeof window === "undefined") return DEFAULTS;
  const soundMuted = window.localStorage.getItem(KEYS.soundMuted) === "true";
  const rawMax = window.localStorage.getItem(KEYS.maxNumber);
  const parsedMax = rawMax ? Number.parseInt(rawMax, 10) : DEFAULTS.maxNumber;
  const maxNumber = Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : DEFAULTS.maxNumber;
  const reduceMotion = window.localStorage.getItem(KEYS.reduceMotion) === "true";
  const ttsEnabled = readBoolean(KEYS.ttsEnabled, DEFAULTS.ttsEnabled);
  const ttsAutoSpeakQuestions = readBoolean(
    KEYS.ttsAutoSpeakQuestions,
    DEFAULTS.ttsAutoSpeakQuestions
  );
  const ttsPreferredVoiceMode = readVoiceMode();
  return {
    soundMuted,
    maxNumber,
    reduceMotion,
    ttsEnabled,
    ttsAutoSpeakQuestions,
    ttsPreferredVoiceMode,
  };
};

const applyReduceMotion = (enabled: boolean) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(REDUCE_MOTION_CLASS, enabled);
};

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(() => readPreferences());

  useEffect(() => {
    applyReduceMotion(prefs.reduceMotion);
  }, [prefs.reduceMotion]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onChange = () => setPrefs(readPreferences());

    window.addEventListener(PREFS_EVENT, onChange);
    window.addEventListener("storage", onChange);

    return () => {
      window.removeEventListener(PREFS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const update = useCallback((next: Partial<Preferences>) => {
    if (typeof window === "undefined") return;
    if (next.soundMuted !== undefined) {
      window.localStorage.setItem(KEYS.soundMuted, String(next.soundMuted));
    }
    if (next.maxNumber !== undefined) {
      window.localStorage.setItem(KEYS.maxNumber, String(next.maxNumber));
    }
    if (next.reduceMotion !== undefined) {
      window.localStorage.setItem(KEYS.reduceMotion, String(next.reduceMotion));
    }
    if (next.ttsEnabled !== undefined) {
      window.localStorage.setItem(KEYS.ttsEnabled, String(next.ttsEnabled));
    }
    if (next.ttsAutoSpeakQuestions !== undefined) {
      window.localStorage.setItem(
        KEYS.ttsAutoSpeakQuestions,
        String(next.ttsAutoSpeakQuestions)
      );
    }
    if (next.ttsPreferredVoiceMode !== undefined) {
      window.localStorage.setItem(KEYS.ttsPreferredVoiceMode, next.ttsPreferredVoiceMode);
    }
    window.dispatchEvent(new Event(PREFS_EVENT));
  }, []);

  return { prefs, update };
}
