import { useCallback, useEffect, useState } from "react";

const KEYS = {
  soundMuted: "soundMuted",
  maxNumber: "maxNumber",
  reduceMotion: "nthkids:reduce-motion",
} as const;

const REDUCE_MOTION_CLASS = "reduce-motion";

export interface Preferences {
  soundMuted: boolean;
  maxNumber: number;
  reduceMotion: boolean;
}

const DEFAULTS: Preferences = {
  soundMuted: false,
  maxNumber: 10,
  reduceMotion: false,
};

const PREFS_EVENT = "nthkids:prefs-changed";

const readPreferences = (): Preferences => {
  if (typeof window === "undefined") return DEFAULTS;
  const soundMuted = window.localStorage.getItem(KEYS.soundMuted) === "true";
  const rawMax = window.localStorage.getItem(KEYS.maxNumber);
  const parsedMax = rawMax ? Number.parseInt(rawMax, 10) : DEFAULTS.maxNumber;
  const maxNumber = Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : DEFAULTS.maxNumber;
  const reduceMotion = window.localStorage.getItem(KEYS.reduceMotion) === "true";
  return {
    soundMuted,
    maxNumber,
    reduceMotion,
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
    window.dispatchEvent(new Event(PREFS_EVENT));
  }, []);

  return { prefs, update };
}
