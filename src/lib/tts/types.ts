export type TtsLocale = "en" | "vi";

export type TtsEngineKind = "native" | "kokoro" | "piper";

export type TtsStatus = "idle" | "loading" | "speaking" | "error";

export type VoicePreference = "native-first" | "native-only" | "fallback-only";

export interface SpeakOptions {
  locale?: TtsLocale;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface ResolvedVoice {
  engine: TtsEngineKind;
  voiceId: string;
  voiceName: string;
  locale: TtsLocale;
}

export interface PreloadProgress {
  // Bytes loaded across the entire model download
  loaded: number;
  // Total bytes expected (may be 0 if the source did not report it)
  total: number;
  // 0..1 ratio when total is known, otherwise NaN
  ratio: number;
  // Optional human-readable label for the artifact currently being fetched
  label?: string;
}

export type PreloadProgressCallback = (progress: PreloadProgress) => void;

// Hugging Face repo id used by kokoro-js for the quantized 82M model
export const KOKORO_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

// Child-friendly female voice that approximates the warmth of Microsoft Ana
export const KOKORO_DEFAULT_VOICE = "af_heart";

// Best-rated Vietnamese voice in piper's catalogue
export const PIPER_DEFAULT_VOICE = "vi_VN-vais1000-medium";

export const TTS_LOCALES: readonly TtsLocale[] = ["en", "vi"];

export function normaliseLocale(input: string | undefined | null): TtsLocale {
  if (!input) return "en";
  const base = input.toLowerCase().split("-")[0];
  return base === "vi" ? "vi" : "en";
}
