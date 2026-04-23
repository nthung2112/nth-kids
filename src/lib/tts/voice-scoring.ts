import type { TtsLocale } from "./types";

// Names that often map to a kid-friendly female English voice across platforms.
// Microsoft Ana is the explicit target on Edge; the rest are closest fallbacks.
const KID_FRIENDLY_EN_NAMES = [
  "ana",
  "aria",
  "jenny",
  "samantha",
  "victoria",
  "allison",
  "ava",
  "susan",
  "tessa",
  "karen",
  "kathy",
  "joanna",
];

// Microsoft / Google natural-sounding voice keywords
const NATURAL_EN_KEYWORDS = ["natural", "online", "neural", "wavenet"];

// Common Vietnamese voice names where vendors expose them
const KID_FRIENDLY_VI_NAMES = ["linh", "an", "hoaimy", "nam", "thu"];

export function scoreVoice(voice: SpeechSynthesisVoice, locale: TtsLocale): number {
  const lang = voice.lang.toLowerCase();
  const localeBase = locale.toLowerCase();

  let score = 0;
  if (lang.startsWith(`${localeBase}-`)) {
    score += 100;
  } else if (lang === localeBase) {
    score += 80;
  } else {
    return -1;
  }

  const name = voice.name.toLowerCase();

  if (locale === "en") {
    // Strong boost for the explicit Edge target so Ana wins whenever exposed
    if (name.includes("ana") && name.includes("natural")) score += 80;
    if (name.includes("aria") && name.includes("natural")) score += 60;
    if (name.includes("jenny") && name.includes("natural")) score += 60;

    for (const keyword of NATURAL_EN_KEYWORDS) {
      if (name.includes(keyword)) {
        score += 15;
        break;
      }
    }

    for (const candidate of KID_FRIENDLY_EN_NAMES) {
      if (name.includes(candidate)) {
        score += 20;
        break;
      }
    }

    if (lang.startsWith("en-us")) score += 10;
  } else if (locale === "vi") {
    for (const candidate of KID_FRIENDLY_VI_NAMES) {
      if (name.includes(candidate)) {
        score += 25;
        break;
      }
    }
    if (lang.startsWith("vi-vn")) score += 10;
  }

  return score;
}

export function pickBestVoice(
  voices: readonly SpeechSynthesisVoice[],
  locale: TtsLocale
): SpeechSynthesisVoice | null {
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const voice of voices) {
    const score = scoreVoice(voice, locale);
    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }
  return bestScore > 0 ? best : null;
}
