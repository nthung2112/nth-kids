import type { SpeakOptions, TtsLocale } from "./types";
import { pickBestVoice } from "./voice-scoring";

const VOICE_LOAD_TIMEOUT_MS = 1500;

const isClient = (): boolean =>
  typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";

export class NativeEngine {
  private voicesCache: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor(private readonly onVoicesChanged?: () => void) {
    if (!isClient()) return;

    this.voicesCache = window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      this.voicesCache = window.speechSynthesis.getVoices();
      this.onVoicesChanged?.();
    });
  }

  static isAvailable(): boolean {
    return isClient();
  }

  // Some browsers (Chrome) populate voices asynchronously after first call.
  async waitForVoices(timeoutMs: number = VOICE_LOAD_TIMEOUT_MS): Promise<SpeechSynthesisVoice[]> {
    if (!isClient()) return [];

    const initial = window.speechSynthesis.getVoices();
    if (initial.length > 0) {
      this.voicesCache = initial;
      return initial;
    }

    return new Promise(resolve => {
      // Wrap the timeout id in a holder so the listener can clear it without
      // being declared after assignment (prefer-const friendly).
      const state: { timeoutId: number } = { timeoutId: 0 };
      const handler = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        window.clearTimeout(state.timeoutId);
        this.voicesCache = voices;
        resolve(voices);
      };
      window.speechSynthesis.addEventListener("voiceschanged", handler);
      state.timeoutId = window.setTimeout(() => {
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        const voices = window.speechSynthesis.getVoices();
        this.voicesCache = voices;
        resolve(voices);
      }, timeoutMs);
    });
  }

  pickVoice(locale: TtsLocale): SpeechSynthesisVoice | null {
    return pickBestVoice(this.voicesCache, locale);
  }

  speak(
    text: string,
    voice: SpeechSynthesisVoice | null,
    options: Pick<SpeakOptions, "rate" | "pitch" | "volume"> = {}
  ): Promise<void> {
    if (!isClient()) {
      return Promise.reject(new Error("speechSynthesis is not available"));
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.rate = options.rate ?? 0.95;
      utterance.pitch = options.pitch ?? 1.05;
      utterance.volume = options.volume ?? 1;
      if (voice?.lang) utterance.lang = voice.lang;

      utterance.onend = () => {
        if (this.currentUtterance === utterance) this.currentUtterance = null;
        resolve();
      };
      utterance.onerror = event => {
        if (this.currentUtterance === utterance) this.currentUtterance = null;
        // Some browsers fire "interrupted" on cancel - treat as success.
        if (event.error === "interrupted" || event.error === "canceled") {
          resolve();
          return;
        }
        reject(new Error(`Native TTS error: ${event.error}`));
      };

      this.stop();
      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    if (!isClient()) return;
    window.speechSynthesis.cancel();
    this.currentUtterance = null;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return [...this.voicesCache];
  }
}
