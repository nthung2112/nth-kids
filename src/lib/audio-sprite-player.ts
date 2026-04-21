import {
  AUDIO_SPRITES,
  type SpriteTopic,
  type AudioSegment,
} from "@/data/audioSprites";

const MUTE_STORAGE_KEY = "soundMuted";
const FADE_SEC = 0.025;
const VOLUME = 0.85;

const buffers: Partial<Record<SpriteTopic, AudioBuffer | "loading" | "error">> = {};
let sharedContext: AudioContext | null = null;
let preloadStarted = false;

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

const loadBuffer = async (topic: SpriteTopic): Promise<AudioBuffer | null> => {
  const cached = buffers[topic];
  if (cached === "loading") return null;
  if (cached === "error") return null;
  if (cached) return cached;

  const ctx = getContext();
  if (!ctx) return null;

  buffers[topic] = "loading";
  try {
    const url = resolveBaseUrl(AUDIO_SPRITES[topic].src);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    const data = await response.arrayBuffer();
    const decoded = await ctx.decodeAudioData(data);
    buffers[topic] = decoded;
    return decoded;
  } catch (error) {
    console.warn(`Failed to load audio sprite "${topic}":`, error);
    buffers[topic] = "error";
    return null;
  }
};

const startPlayback = (
  ctx: AudioContext,
  buffer: AudioBuffer,
  segment: AudioSegment
): boolean => {
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

export const preloadSprites = (): void => {
  if (preloadStarted) return;
  preloadStarted = true;
  (Object.keys(AUDIO_SPRITES) as SpriteTopic[]).forEach(topic => {
    void loadBuffer(topic);
  });
};

/** Kick off background load of one topic's sprite buffer. Safe to call repeatedly. */
export const preloadSpriteTopic = (topic: SpriteTopic): void => {
  if (buffers[topic]) return;
  void loadBuffer(topic);
};

export interface PlaySegmentResult {
  /** True when audio was scheduled; false when caller should fall back. */
  scheduled: boolean;
}

export const playSpriteSegment = (
  topic: SpriteTopic,
  index: number | undefined
): PlaySegmentResult => {
  if (index === undefined || index < 0) return { scheduled: false };
  if (isMuted()) return { scheduled: true };

  const sprite = AUDIO_SPRITES[topic];
  if (!sprite || index >= sprite.segments.length) return { scheduled: false };

  const ctx = getContext();
  if (!ctx) return { scheduled: false };

  const cached = buffers[topic];
  if (!cached || cached === "loading" || cached === "error") {
    if (!cached) void loadBuffer(topic);
    return { scheduled: false };
  }

  try {
    const ok = startPlayback(ctx, cached, sprite.segments[index]);
    return { scheduled: ok };
  } catch (error) {
    console.warn(`Sprite playback failed (${topic}#${index}):`, error);
    return { scheduled: false };
  }
};
