import type { GameTopicId } from "@/data/topics";

export type ToyAssetRole = "hero" | "tile" | "learnBackdrop" | "gameBackdrop" | "resultBanner";

export type ToyBackdropPattern = "dots" | "blocks" | "blobs" | "waves" | "stars";
export type ToyMotionProfile = "idle" | "float" | "wiggle" | "pulse";
export type ToyShapeKind = "blocks" | "letters" | "palette" | "shapes" | "cards";

export interface ToyPalette {
  primary: string;
  secondary: string;
  accent: string;
  onPrimary: string;
  surface: string;
  border: string;
  text: string;
}

export interface TopicVisual {
  assets: Record<ToyAssetRole, string>;
  palette: ToyPalette;
  backdrop: {
    pattern: ToyBackdropPattern;
    intensity: "soft" | "medium";
  };
  motion: ToyMotionProfile;
  altTextKey: string;
  fallback: {
    shape: ToyShapeKind;
    label: string;
  };
}

const DEFAULT_ASSETS: Record<ToyAssetRole, string> = {
  hero: "toy-default-hero",
  tile: "toy-default-tile",
  learnBackdrop: "toy-default-learn-backdrop",
  gameBackdrop: "toy-default-game-backdrop",
  resultBanner: "toy-default-result-banner",
};

export const DEFAULT_TOY_PALETTE: ToyPalette = {
  primary: "bg-purple-500",
  secondary: "bg-purple-100",
  accent: "bg-yellow-300",
  onPrimary: "text-white",
  surface: "bg-white/85",
  border: "border-purple-300",
  text: "text-purple-800",
};

const DEFAULT_VISUAL: TopicVisual = {
  assets: DEFAULT_ASSETS,
  palette: DEFAULT_TOY_PALETTE,
  backdrop: {
    pattern: "blobs",
    intensity: "soft",
  },
  motion: "float",
  altTextKey: "visual.alt.default",
  fallback: {
    shape: "blocks",
    label: "?",
  },
};

export const TOPIC_VISUALS: Record<GameTopicId, TopicVisual> = {
  numbers: {
    assets: {
      hero: "toy-numbers-hero",
      tile: "toy-numbers-tile",
      learnBackdrop: "toy-numbers-learn-backdrop",
      gameBackdrop: "toy-numbers-game-backdrop",
      resultBanner: "toy-numbers-result-banner",
    },
    palette: {
      primary: "bg-sky-500",
      secondary: "bg-sky-100",
      accent: "bg-yellow-300",
      onPrimary: "text-white",
      surface: "bg-white/90",
      border: "border-sky-300",
      text: "text-sky-900",
    },
    backdrop: {
      pattern: "blocks",
      intensity: "medium",
    },
    motion: "float",
    altTextKey: "visual.alt.numbers",
    fallback: {
      shape: "blocks",
      label: "1",
    },
  },
  letters: {
    assets: {
      hero: "toy-letters-hero",
      tile: "toy-letters-tile",
      learnBackdrop: "toy-letters-learn-backdrop",
      gameBackdrop: "toy-letters-game-backdrop",
      resultBanner: "toy-letters-result-banner",
    },
    palette: {
      primary: "bg-emerald-500",
      secondary: "bg-emerald-100",
      accent: "bg-orange-300",
      onPrimary: "text-white",
      surface: "bg-white/90",
      border: "border-emerald-300",
      text: "text-emerald-900",
    },
    backdrop: {
      pattern: "dots",
      intensity: "soft",
    },
    motion: "wiggle",
    altTextKey: "visual.alt.letters",
    fallback: {
      shape: "letters",
      label: "A",
    },
  },
  colors: {
    assets: {
      hero: "toy-colors-hero",
      tile: "toy-colors-tile",
      learnBackdrop: "toy-colors-learn-backdrop",
      gameBackdrop: "toy-colors-game-backdrop",
      resultBanner: "toy-colors-result-banner",
    },
    palette: {
      primary: "bg-pink-500",
      secondary: "bg-pink-100",
      accent: "bg-cyan-300",
      onPrimary: "text-white",
      surface: "bg-white/90",
      border: "border-pink-300",
      text: "text-pink-900",
    },
    backdrop: {
      pattern: "blobs",
      intensity: "medium",
    },
    motion: "pulse",
    altTextKey: "visual.alt.colors",
    fallback: {
      shape: "palette",
      label: "C",
    },
  },
  shapes: {
    assets: {
      hero: "toy-shapes-hero",
      tile: "toy-shapes-tile",
      learnBackdrop: "toy-shapes-learn-backdrop",
      gameBackdrop: "toy-shapes-game-backdrop",
      resultBanner: "toy-shapes-result-banner",
    },
    palette: {
      primary: "bg-indigo-500",
      secondary: "bg-indigo-100",
      accent: "bg-lime-300",
      onPrimary: "text-white",
      surface: "bg-white/90",
      border: "border-indigo-300",
      text: "text-indigo-900",
    },
    backdrop: {
      pattern: "stars",
      intensity: "soft",
    },
    motion: "float",
    altTextKey: "visual.alt.shapes",
    fallback: {
      shape: "shapes",
      label: "S",
    },
  },
  flashcards: {
    assets: {
      hero: "toy-flashcards-hero",
      tile: "toy-flashcards-tile",
      learnBackdrop: "toy-flashcards-learn-backdrop",
      gameBackdrop: "toy-flashcards-game-backdrop",
      resultBanner: "toy-flashcards-result-banner",
    },
    palette: {
      primary: "bg-orange-500",
      secondary: "bg-orange-100",
      accent: "bg-purple-300",
      onPrimary: "text-white",
      surface: "bg-white/90",
      border: "border-orange-300",
      text: "text-orange-900",
    },
    backdrop: {
      pattern: "waves",
      intensity: "soft",
    },
    motion: "pulse",
    altTextKey: "visual.alt.flashcards",
    fallback: {
      shape: "cards",
      label: "F",
    },
  },
};

export const getTopicVisual = (id: GameTopicId): TopicVisual => TOPIC_VISUALS[id] ?? DEFAULT_VISUAL;
