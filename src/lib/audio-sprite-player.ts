import {
  AUDIO_SPRITES,
  type AudioSegment,
  type AudioSpriteLocale,
  type SpriteLocale,
  type SpriteTopic,
} from "@/data/audioSprites";

const MUTE_STORAGE_KEY = "soundMuted";
const FADE_SEC = 0.025;
const VOLUME = 0.85;

type BufferState = AudioBuffer | "loading" | "error";

// Per-locale buffer cache. Each (topic, locale) combination decodes to a
// dedicated AudioBuffer so VI and EN sprites can coexist when the user
// switches languages mid-session without reloading.
const buffers: Partial<Record<SpriteTopic, Partial<Record<SpriteLocale, BufferState>>>> = {};

let sharedContext: AudioContext | null = null;
const preloadedTopics: Partial<Record<SpriteTopic, Set<SpriteLocale>>> = {};

const isMuted = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUTE_STORAGE_KEY) === "true";
};

const getContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (sharedContext) return sharedContext;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  sharedContext = new Ctor();
  return sharedContext;
};

const resolveBaseUrl = (src: string): string => {
  // Vite injects BASE_URL at build time so the same code works under dev
  // ("/") and production deployments hosted under a sub-path.
  const base = (import.meta.env?.BASE_URL ?? "/") as string;
  const normalisedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalisedBase}${src.replace(/^\//, "")}`;
};

const getLocaleEntry = (topic: SpriteTopic, locale: SpriteLocale): AudioSpriteLocale | null => {
  const sprite = AUDIO_SPRITES[topic];
  if (!sprite) return null;
  // Fall back to EN when a locale-specific recording is not (yet) available.
  return sprite[locale] ?? sprite.en ?? null;
};

const setBufferState = (topic: SpriteTopic, locale: SpriteLocale, state: BufferState): void => {
  if (!buffers[topic]) buffers[topic] = {};
  buffers[topic]![locale] = state;
};

const getBufferState = (topic: SpriteTopic, locale: SpriteLocale): BufferState | undefined =>
  buffers[topic]?.[locale];

const loadBuffer = async (
  topic: SpriteTopic,
  locale: SpriteLocale
): Promise<AudioBuffer | null> => {
  const cached = getBufferState(topic, locale);
  if (cached === "loading") return null;
  if (cached === "error") return null;
  if (cached) return cached;

  const ctx = getContext();
  if (!ctx) return null;

  const entry = getLocaleEntry(topic, locale);
  if (!entry) return null;

  setBufferState(topic, locale, "loading");
  try {
    const url = resolveBaseUrl(entry.src);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    const data = await response.arrayBuffer();
    const decoded = await ctx.decodeAudioData(data);
    setBufferState(topic, locale, decoded);
    return decoded;
  } catch (error) {
    console.warn(`Failed to load audio sprite "${topic}" (${locale}):`, error);
    setBufferState(topic, locale, "error");
    return null;
  }
};

const startPlayback = (ctx: AudioContext, buffer: AudioBuffer, segment: AudioSegment): boolean => {
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const startTime = Math.max(0, Math.min(segment.start, buffer.duration));
  const rawDuration = Math.max(0.05, segment.end - segment.start);
  const duration = Math.min(rawDuration, buffer.duration - startTime);
  if (duration <= 0) return false;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  const now = ctx.currentTime;
  const fade = Math.min(FADE_SEC, duration / 4);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(VOLUME, now + fade);
  gain.gain.setValueAtTime(VOLUME, now + duration - fade);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(now, startTime, duration);
  source.stop(now + duration + 0.05);
  return true;
};

/** Kick off background load of every sprite topic for the given locale. */
export const preloadSprites = (locale: SpriteLocale): void => {
  (Object.keys(AUDIO_SPRITES) as SpriteTopic[]).forEach(topic => {
    preloadSpriteTopic(topic, locale);
  });
};

/** Kick off background load of one (topic, locale) sprite. Idempotent. */
export const preloadSpriteTopic = (topic: SpriteTopic, locale: SpriteLocale): void => {
  const cached = getBufferState(topic, locale);
  if (cached) return;
  if (!preloadedTopics[topic]) preloadedTopics[topic] = new Set();
  if (preloadedTopics[topic]!.has(locale)) return;
  preloadedTopics[topic]!.add(locale);
  void loadBuffer(topic, locale);
};

export interface PlaySegmentResult {
  /** True when audio was scheduled; false when caller should fall back. */
  scheduled: boolean;
}

export const playSpriteSegment = (
  topic: SpriteTopic,
  locale: SpriteLocale,
  index: number | undefined
): PlaySegmentResult => {
  if (index === undefined || index < 0) return { scheduled: false };
  if (isMuted()) return { scheduled: true };

  const entry = getLocaleEntry(topic, locale);
  if (!entry || index >= entry.segments.length) return { scheduled: false };

  const ctx = getContext();
  if (!ctx) return { scheduled: false };

  // Resolve which locale actually owns the buffer (handles EN fallback).
  const sprite = AUDIO_SPRITES[topic];
  const resolvedLocale: SpriteLocale = sprite?.[locale] ? locale : "en";

  const cached = getBufferState(topic, resolvedLocale);
  if (!cached || cached === "loading" || cached === "error") {
    if (!cached) void loadBuffer(topic, resolvedLocale);
    return { scheduled: false };
  }

  try {
    const ok = startPlayback(ctx, cached, entry.segments[index]);
    return { scheduled: ok };
  } catch (error) {
    console.warn(`Sprite playback failed (${topic}/${resolvedLocale}#${index}):`, error);
    return { scheduled: false };
  }
};
