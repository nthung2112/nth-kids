import { useEffect } from "react";

import { useTranslation } from "react-i18next";

import type { SpriteLocale, SpriteTopic } from "@/data/audioSprites";
import { preloadSprites, preloadSpriteTopic } from "@/lib/audio-sprite-player";

const normaliseLocale = (input: string | undefined | null): SpriteLocale => {
  const base = (input ?? "vi").toLowerCase().split("-")[0];
  return base === "en" ? "en" : "vi";
};

/**
 * Preload one sprite topic for the active i18n locale, re-running whenever the
 * locale changes so language switches do not stutter on first playback.
 * Pass an array to preload several topics on the same screen.
 */
export const usePreloadSprite = (topics: SpriteTopic | readonly SpriteTopic[]): void => {
  const { i18n } = useTranslation();
  const locale = normaliseLocale(i18n.language);

  useEffect(() => {
    const list = Array.isArray(topics) ? topics : [topics];
    for (const topic of list) {
      preloadSpriteTopic(topic, locale);
    }
  }, [topics, locale]);
};

/** Preload every sprite topic for the active locale. Use sparingly. */
export const usePreloadAllSprites = (): void => {
  const { i18n } = useTranslation();
  const locale = normaliseLocale(i18n.language);

  useEffect(() => {
    preloadSprites(locale);
  }, [locale]);
};
