import { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { getTtsController } from "@/lib/tts/tts-controller";
import {
  normaliseLocale,
  type PreloadProgress,
  type SpeakOptions,
  type TtsEngineKind,
  type TtsLocale,
  type TtsStatus,
} from "@/lib/tts/types";

import { usePreferences } from "./usePreferences";

interface CurrentVoiceInfo {
  engine: TtsEngineKind;
  voiceId: string;
  voiceName: string;
  locale: TtsLocale;
}

export interface UseTtsResult {
  speak: (text: string, options?: SpeakOptions) => void;
  stop: () => void;
  status: TtsStatus;
  isAvailable: boolean;
  ttsEnabled: boolean;
  currentLocale: TtsLocale;
  resolvedEngine: TtsEngineKind | null;
  resolvedVoiceName: string | null;
  hasNativeVoiceForLocale: boolean | null;
  isFallbackLoaded: boolean;
  /**
   * True when TTS can play right now without downloading anything.
   * Useful for opportunistic speech that should not trigger a model download.
   */
  canSpeakInstantly: boolean;
  preloadFallback: (locale?: TtsLocale) => Promise<void>;
  preloadProgress: PreloadProgress | null;
  refreshVoiceInfo: () => Promise<void>;
}

export function useTts(): UseTtsResult {
  const { i18n } = useTranslation();
  const { prefs } = usePreferences();

  const [status, setStatus] = useState<TtsStatus>("idle");
  const [resolvedVoice, setResolvedVoice] = useState<CurrentVoiceInfo | null>(null);
  const [hasNativeVoiceForLocale, setHasNativeVoiceForLocale] = useState<boolean | null>(null);
  const [preloadProgress, setPreloadProgress] = useState<PreloadProgress | null>(null);
  const [fallbackLoadedFlag, setFallbackLoadedFlag] = useState(0);
  const tickRef = useRef(0);

  const controller = getTtsController();
  const isAvailable = controller?.isAvailable() ?? false;
  const ttsEnabled = !prefs.soundMuted && prefs.ttsEnabled;

  const currentLocale = normaliseLocale(i18n.language);
  const voiceMode = prefs.ttsPreferredVoiceMode;

  const refreshVoiceInfo = useCallback(async () => {
    if (!controller) {
      setResolvedVoice(null);
      setHasNativeVoiceForLocale(null);
      return;
    }
    const tick = ++tickRef.current;
    const [resolved, hasNative] = await Promise.all([
      controller.resolveVoice(currentLocale, voiceMode),
      controller.hasNativeVoice(currentLocale),
    ]);
    if (tick !== tickRef.current) return;
    setResolvedVoice(
      resolved
        ? {
            engine: resolved.engine,
            voiceId: resolved.voiceId,
            voiceName: resolved.voiceName,
            locale: resolved.locale,
          }
        : null
    );
    setHasNativeVoiceForLocale(hasNative);
  }, [controller, currentLocale, voiceMode]);

  useEffect(() => {
    void refreshVoiceInfo();
  }, [refreshVoiceInfo]);

  useEffect(() => {
    if (!controller) return;
    const offVoices = controller.on("voices-changed", () => {
      void refreshVoiceInfo();
    });
    const offEngine = controller.on("engine-changed", () => {
      void refreshVoiceInfo();
    });
    return () => {
      offVoices();
      offEngine();
    };
  }, [controller, refreshVoiceInfo]);

  // Stop any in-flight speech when the user mutes sound or disables TTS.
  useEffect(() => {
    if (!ttsEnabled) {
      controller?.stop();
      setStatus("idle");
    }
  }, [ttsEnabled, controller]);

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (!controller) return;
      if (!ttsEnabled) return;
      if (!text || !text.trim()) return;

      const locale = options.locale ?? currentLocale;
      setStatus("loading");
      controller
        .speak(text, locale, voiceMode, options)
        .then(() => {
          setStatus("idle");
          setFallbackLoadedFlag(prev => prev + 1);
        })
        .catch(error => {
          console.warn("TTS speak failed", error);
          setStatus("error");
        });
    },
    [controller, ttsEnabled, currentLocale, voiceMode]
  );

  const stop = useCallback(() => {
    controller?.stop();
    setStatus("idle");
  }, [controller]);

  const preloadFallback = useCallback(
    async (locale?: TtsLocale) => {
      if (!controller) return;
      const target = locale ?? currentLocale;
      setStatus("loading");
      setPreloadProgress({ loaded: 0, total: 0, ratio: Number.NaN });
      try {
        await controller.preloadFallback(target, progress => {
          setPreloadProgress(progress);
        });
        setFallbackLoadedFlag(prev => prev + 1);
        await refreshVoiceInfo();
      } finally {
        setStatus("idle");
      }
    },
    [controller, currentLocale, refreshVoiceInfo]
  );

  const isFallbackLoaded =
    controller?.isFallbackLoaded(currentLocale) ?? false;
  // The flag dependency forces re-read when speak/preload completes.
  void fallbackLoadedFlag;

  const resolvedEngine = resolvedVoice?.engine ?? null;
  const canSpeakInstantly =
    ttsEnabled &&
    isAvailable &&
    (resolvedEngine === "native" || (resolvedEngine !== null && isFallbackLoaded));

  return {
    speak,
    stop,
    status,
    isAvailable,
    ttsEnabled,
    currentLocale,
    resolvedEngine,
    resolvedVoiceName: resolvedVoice?.voiceName ?? null,
    hasNativeVoiceForLocale,
    isFallbackLoaded,
    canSpeakInstantly,
    preloadFallback,
    preloadProgress,
    refreshVoiceInfo,
  };
}

/**
 * Speak a piece of text whenever the supplied trigger key changes.
 * Designed for game question flows: when a new question is generated,
 * its key changes and the new prompt is spoken automatically.
 *
 * Honours the `ttsAutoSpeakQuestions` preference and the global mute toggle.
 */
export function useSpeakOnChange(
  text: string | null,
  triggerKey: string | number | null | undefined,
  options: { delayMs?: number; enabled?: boolean } = {}
): void {
  const tts = useTts();
  const { prefs } = usePreferences();
  const ttsRef = useRef(tts);
  ttsRef.current = tts;

  const { delayMs = 250, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;
    if (!text || !text.trim()) return;
    if (triggerKey === null || triggerKey === undefined) return;
    if (prefs.soundMuted || !prefs.ttsEnabled || !prefs.ttsAutoSpeakQuestions) return;

    const timeoutId = window.setTimeout(() => {
      ttsRef.current.speak(text);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      ttsRef.current.stop();
    };
  }, [
    text,
    triggerKey,
    prefs.soundMuted,
    prefs.ttsEnabled,
    prefs.ttsAutoSpeakQuestions,
    delayMs,
    enabled,
  ]);
}

