import { useEffect, useRef } from "react";

import type { PromptKey } from "@/data/audioSprites";
import { usePreferences } from "@/hooks/usePreferences";
import { useSound } from "@/hooks/useSound";

interface SpeakOptions {
  delayMs?: number;
  enabled?: boolean;
}

/**
 * Speak a static game prompt sprite whenever the trigger key changes.
 *
 * Honours the global mute toggle. Designed for game flows where each new
 * question advances `triggerKey`, prompting a re-speak of the same i18n
 * prompt cue. The prompt itself is identified by `promptKey`, which maps to
 * a segment in the locale-aware `prompts` sprite.
 */
export function useSpeakPromptOnChange(
  promptKey: PromptKey,
  triggerKey: string | number | null | undefined,
  options: SpeakOptions = {}
): void {
  const { playPromptSound } = useSound();
  const { prefs } = usePreferences();
  const playRef = useRef(playPromptSound);
  playRef.current = playPromptSound;

  const { delayMs = 250, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;
    if (triggerKey === null || triggerKey === undefined) return;
    if (prefs.soundMuted) return;

    const timeoutId = window.setTimeout(() => {
      playRef.current(promptKey);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [promptKey, triggerKey, prefs.soundMuted, delayMs, enabled]);
}
