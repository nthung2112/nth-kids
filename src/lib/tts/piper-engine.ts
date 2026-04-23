import {
  PIPER_DEFAULT_VOICE,
  type PreloadProgress,
  type PreloadProgressCallback,
} from "./types";

interface PiperApi {
  predict: (config: { text: string; voiceId: string }) => Promise<Blob>;
  download: (
    voiceId: string,
    callback?: (progress: { url: string; total: number; loaded: number }) => void
  ) => Promise<void>;
  stored: () => Promise<string[]>;
  remove: (voiceId: string) => Promise<void>;
}

const computeRatio = (loaded: number, total: number): number => {
  if (!total || total <= 0) return Number.NaN;
  return Math.min(1, loaded / total);
};

export class PiperEngine {
  private apiPromise: Promise<PiperApi> | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private latestProgress: PreloadProgress | null = null;

  private getApi(): Promise<PiperApi> {
    if (!this.apiPromise) {
      this.apiPromise = import("@mintplex-labs/piper-tts-web") as unknown as Promise<PiperApi>;
      this.apiPromise.catch(() => {
        this.apiPromise = null;
      });
    }
    return this.apiPromise;
  }

  async preload(
    voiceId: string = PIPER_DEFAULT_VOICE,
    onProgress?: PreloadProgressCallback
  ): Promise<void> {
    const api = await this.getApi();
    const stored = await api.stored().catch(() => [] as string[]);
    if (stored.includes(voiceId)) {
      const ready: PreloadProgress = { loaded: 1, total: 1, ratio: 1 };
      this.latestProgress = ready;
      onProgress?.(ready);
      return;
    }
    await api.download(voiceId, event => {
      const progress: PreloadProgress = {
        loaded: event.loaded,
        total: event.total,
        ratio: computeRatio(event.loaded, event.total),
        label: event.url,
      };
      this.latestProgress = progress;
      onProgress?.(progress);
    });
  }

  async speak(text: string, voiceId: string = PIPER_DEFAULT_VOICE): Promise<void> {
    const api = await this.getApi();
    // Piper's `predict` will auto-download the voice on first use if needed,
    // and reuse the cached copy from OPFS afterwards.
    const blob = await api.predict({ text, voiceId });
    await this.playBlob(blob);
  }

  async isStored(voiceId: string = PIPER_DEFAULT_VOICE): Promise<boolean> {
    if (!this.apiPromise) return false;
    try {
      const api = await this.getApi();
      const stored = await api.stored();
      return stored.includes(voiceId);
    } catch {
      return false;
    }
  }

  private playBlob(blob: Blob): Promise<void> {
    this.stop();
    const url = URL.createObjectURL(blob);
    this.currentObjectUrl = url;

    return new Promise((resolve, reject) => {
      const el = new Audio(url);
      this.currentAudio = el;

      const cleanup = () => {
        if (this.currentObjectUrl === url) {
          URL.revokeObjectURL(url);
          this.currentObjectUrl = null;
        }
        if (this.currentAudio === el) this.currentAudio = null;
      };

      el.onended = () => {
        cleanup();
        resolve();
      };
      el.onerror = () => {
        cleanup();
        reject(new Error("Piper audio playback failed"));
      };

      el.play().catch(error => {
        cleanup();
        reject(error);
      });
    });
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.removeAttribute("src");
      this.currentAudio.load();
      this.currentAudio = null;
    }
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }

  isLoaded(): boolean {
    return this.apiPromise !== null;
  }
}
