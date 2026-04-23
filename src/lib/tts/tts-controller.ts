import { KokoroEngine } from "./kokoro-engine";
import { NativeEngine } from "./native-engine";
import { PiperEngine } from "./piper-engine";
import {
  KOKORO_DEFAULT_VOICE,
  PIPER_DEFAULT_VOICE,
  type PreloadProgressCallback,
  type ResolvedVoice,
  type SpeakOptions,
  type TtsEngineKind,
  type TtsLocale,
  type VoicePreference,
} from "./types";

export type TtsControllerEvent = "voices-changed" | "engine-changed";

type EventListener = () => void;

class TtsController {
  private nativeEngine: NativeEngine | null = null;
  private kokoroEngine: KokoroEngine | null = null;
  private piperEngine: PiperEngine | null = null;
  private speakGen = 0;
  private currentResolvedVoice: ResolvedVoice | null = null;
  private listeners: Map<TtsControllerEvent, Set<EventListener>> = new Map();

  on(event: TtsControllerEvent, listener: EventListener): () => void {
    let bucket = this.listeners.get(event);
    if (!bucket) {
      bucket = new Set();
      this.listeners.set(event, bucket);
    }
    bucket.add(listener);
    return () => bucket?.delete(listener);
  }

  private emit(event: TtsControllerEvent): void {
    const bucket = this.listeners.get(event);
    if (!bucket) return;
    for (const listener of bucket) listener();
  }

  private getNative(): NativeEngine {
    if (!this.nativeEngine) {
      this.nativeEngine = new NativeEngine(() => this.emit("voices-changed"));
    }
    return this.nativeEngine;
  }

  private getKokoro(): KokoroEngine {
    if (!this.kokoroEngine) this.kokoroEngine = new KokoroEngine();
    return this.kokoroEngine;
  }

  private getPiper(): PiperEngine {
    if (!this.piperEngine) this.piperEngine = new PiperEngine();
    return this.piperEngine;
  }

  isAvailable(): boolean {
    return NativeEngine.isAvailable();
  }

  async resolveVoice(
    locale: TtsLocale,
    mode: VoicePreference = "native-first"
  ): Promise<ResolvedVoice | null> {
    if (!this.isAvailable()) return null;

    if (mode !== "fallback-only") {
      const native = this.getNative();
      await native.waitForVoices();
      const voice = native.pickVoice(locale);
      if (voice) {
        return {
          engine: "native",
          voiceId: voice.voiceURI,
          voiceName: voice.name,
          locale,
        };
      }
    }

    if (mode === "native-only") return null;

    if (locale === "vi") {
      return {
        engine: "piper",
        voiceId: PIPER_DEFAULT_VOICE,
        voiceName: `Piper · ${PIPER_DEFAULT_VOICE}`,
        locale,
      };
    }

    return {
      engine: "kokoro",
      voiceId: KOKORO_DEFAULT_VOICE,
      voiceName: `Kokoro · ${KOKORO_DEFAULT_VOICE}`,
      locale,
    };
  }

  getCurrentResolvedVoice(): ResolvedVoice | null {
    return this.currentResolvedVoice;
  }

  async hasNativeVoice(locale: TtsLocale): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const native = this.getNative();
    await native.waitForVoices();
    return native.pickVoice(locale) !== null;
  }

  /**
   * Resolves the engine that *would* be used for the locale, without playing.
   * Useful for showing the current engine in settings.
   */
  async previewEngine(
    locale: TtsLocale,
    mode: VoicePreference = "native-first"
  ): Promise<TtsEngineKind | null> {
    const resolved = await this.resolveVoice(locale, mode);
    return resolved?.engine ?? null;
  }

  async speak(
    text: string,
    locale: TtsLocale,
    mode: VoicePreference,
    options: SpeakOptions = {}
  ): Promise<void> {
    if (!this.isAvailable()) return;
    if (!text.trim()) return;

    this.cancelInternal();
    const myGen = ++this.speakGen;

    const resolved = await this.resolveVoice(locale, mode);
    if (myGen !== this.speakGen) return;
    if (!resolved) return;

    if (
      !this.currentResolvedVoice ||
      this.currentResolvedVoice.voiceId !== resolved.voiceId ||
      this.currentResolvedVoice.engine !== resolved.engine
    ) {
      this.currentResolvedVoice = resolved;
      this.emit("engine-changed");
    }

    if (resolved.engine === "native") {
      const native = this.getNative();
      const voice = native.pickVoice(locale);
      await native.speak(text, voice, {
        rate: options.rate,
        pitch: options.pitch,
        volume: options.volume,
      });
      return;
    }

    if (resolved.engine === "kokoro") {
      const kokoro = this.getKokoro();
      await kokoro.speak(text, resolved.voiceId);
      return;
    }

    const piper = this.getPiper();
    await piper.speak(text, resolved.voiceId);
  }

  /**
   * Pre-warm the local fallback engine for the given locale so the first
   * speak call after preload does not pay the model download cost.
   */
  async preloadFallback(
    locale: TtsLocale,
    onProgress?: PreloadProgressCallback
  ): Promise<void> {
    if (!this.isAvailable()) return;
    if (locale === "vi") {
      await this.getPiper().preload(PIPER_DEFAULT_VOICE, onProgress);
      return;
    }
    await this.getKokoro().load(onProgress);
  }

  isFallbackLoaded(locale: TtsLocale): boolean {
    if (locale === "vi") return this.piperEngine?.isLoaded() ?? false;
    return this.kokoroEngine?.isLoaded() ?? false;
  }

  stop(): void {
    this.cancelInternal();
  }

  private cancelInternal(): void {
    this.speakGen += 1;
    this.nativeEngine?.stop();
    this.kokoroEngine?.stop();
    this.piperEngine?.stop();
  }
}

let instance: TtsController | null = null;

export function getTtsController(): TtsController | null {
  if (typeof window === "undefined") return null;
  if (!instance) instance = new TtsController();
  return instance;
}

export type { TtsController };
