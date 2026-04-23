import {
  KOKORO_DEFAULT_VOICE,
  KOKORO_MODEL_ID,
  type PreloadProgress,
  type PreloadProgressCallback,
} from "./types";

interface KokoroAudio {
  toBlob(): Blob;
}

interface KokoroTTSInstance {
  generate: (text: string, opts: { voice?: string; speed?: number }) => Promise<KokoroAudio>;
}

interface KokoroProgressEvent {
  status?: string;
  file?: string;
  name?: string;
  loaded?: number;
  total?: number;
  progress?: number;
}

const computeRatio = (loaded: number, total: number): number => {
  if (!total || total <= 0) return Number.NaN;
  return Math.min(1, loaded / total);
};

export class KokoroEngine {
  private instancePromise: Promise<KokoroTTSInstance> | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private latestProgress: PreloadProgress | null = null;

  load(onProgress?: PreloadProgressCallback): Promise<KokoroTTSInstance> {
    if (this.instancePromise) {
      if (onProgress && this.latestProgress) onProgress(this.latestProgress);
      return this.instancePromise;
    }

    this.instancePromise = (async () => {
      const mod = await import("kokoro-js");
      const { KokoroTTS } = mod;
      const instance = (await KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
        dtype: "q8",
        device: "wasm",
        progress_callback: ((event: KokoroProgressEvent) => {
          if (!event) return;
          const loaded = event.loaded ?? 0;
          const total = event.total ?? 0;
          const ratio =
            typeof event.progress === "number"
              ? event.progress / 100
              : computeRatio(loaded, total);
          const progress: PreloadProgress = {
            loaded,
            total,
            ratio,
            label: event.file ?? event.name,
          };
          this.latestProgress = progress;
          onProgress?.(progress);
        }) as never,
      })) as unknown as KokoroTTSInstance;
      return instance;
    })();

    // Allow retry if the initial download fails (network blip, OPFS quota, etc.)
    this.instancePromise.catch(() => {
      this.instancePromise = null;
      this.latestProgress = null;
    });

    return this.instancePromise;
  }

  async speak(text: string, voice: string = KOKORO_DEFAULT_VOICE): Promise<void> {
    const tts = await this.load();
    const audio = await tts.generate(text, { voice });
    const blob = audio.toBlob();
    await this.playBlob(blob);
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
        reject(new Error("Kokoro audio playback failed"));
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
    return this.instancePromise !== null;
  }
}
