export type TopicId = "numbers" | "letters" | "colors" | "shapes";
export type GameTopicId = TopicId | "flashcards";

export type LearnTopicPath =
  | "/learn/numbers"
  | "/learn/letters"
  | "/learn/colors"
  | "/learn/shapes";

export type GameTopicPath =
  | "/game/numbers"
  | "/game/letters"
  | "/game/colors"
  | "/game/shapes"
  | "/game/flashcards";

export type TopicPath = LearnTopicPath | GameTopicPath;

export type TopicMode = "learn" | "game";

export interface TopicTheme {
  active: string;
  inactive: string;
  cardClass: string;
  titleClass: string;
  descClass: string;
  buttonClass: string;
  arrowClass: string;
  ringClass: string;
}

export interface TopicMeta {
  id: TopicId;
  path: LearnTopicPath;
  icon: string;
  navLabelKey: string;
  homeTitleKey: string;
  homeDescriptionKey: string;
  headerTitleKey: string;
  theme: TopicTheme;
}

export interface GameTopicMeta {
  id: GameTopicId;
  path: GameTopicPath;
  icon: string;
  navLabelKey: string;
  homeTitleKey: string;
  homeDescriptionKey: string;
  headerTitleKey: string;
  theme: TopicTheme;
}

const THEME_BY_ID: Record<GameTopicId, TopicTheme> = {
  numbers: {
    active: "bg-blue-500 text-white shadow-md hover:bg-blue-600",
    inactive: "border-2 border-blue-400 bg-white/80 text-blue-600 hover:bg-white",
    cardClass: "border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200",
    titleClass: "text-blue-800",
    descClass: "text-blue-700/80",
    buttonClass: "bg-blue-500 hover:bg-blue-600",
    arrowClass: "text-blue-500",
    ringClass: "ring-blue-400",
  },
  letters: {
    active: "bg-green-500 text-white shadow-md hover:bg-green-600",
    inactive: "border-2 border-green-400 bg-white/80 text-green-600 hover:bg-white",
    cardClass: "border-green-300 bg-gradient-to-br from-green-100 to-green-200",
    titleClass: "text-green-800",
    descClass: "text-green-700/80",
    buttonClass: "bg-green-500 hover:bg-green-600",
    arrowClass: "text-green-500",
    ringClass: "ring-green-400",
  },
  colors: {
    active: "bg-pink-500 text-white shadow-md hover:bg-pink-600",
    inactive: "border-2 border-pink-400 bg-white/80 text-pink-600 hover:bg-white",
    cardClass: "border-pink-300 bg-gradient-to-br from-pink-100 to-pink-200",
    titleClass: "text-pink-800",
    descClass: "text-pink-700/80",
    buttonClass: "bg-pink-500 hover:bg-pink-600",
    arrowClass: "text-pink-500",
    ringClass: "ring-pink-400",
  },
  shapes: {
    active: "bg-indigo-500 text-white shadow-md hover:bg-indigo-600",
    inactive: "border-2 border-indigo-400 bg-white/80 text-indigo-600 hover:bg-white",
    cardClass: "border-indigo-300 bg-gradient-to-br from-indigo-100 to-indigo-200",
    titleClass: "text-indigo-800",
    descClass: "text-indigo-700/80",
    buttonClass: "bg-indigo-500 hover:bg-indigo-600",
    arrowClass: "text-indigo-500",
    ringClass: "ring-indigo-400",
  },
  flashcards: {
    active: "bg-orange-500 text-white shadow-md hover:bg-orange-600",
    inactive: "border-2 border-orange-400 bg-white/80 text-orange-600 hover:bg-white",
    cardClass: "border-orange-300 bg-gradient-to-br from-orange-100 to-orange-200",
    titleClass: "text-orange-800",
    descClass: "text-orange-700/80",
    buttonClass: "bg-orange-500 hover:bg-orange-600",
    arrowClass: "text-orange-500",
    ringClass: "ring-orange-400",
  },
};

const DISPLAY_BY_ID: Record<
  GameTopicId,
  {
    icon: string;
    navLabelKey: string;
    homeTitleKey: string;
    homeDescriptionKey: string;
    headerTitleKey: string;
  }
> = {
  numbers: {
    icon: "🔢",
    navLabelKey: "nav.numbers",
    homeTitleKey: "home.topics.numbers.title",
    homeDescriptionKey: "home.topics.numbers.description",
    headerTitleKey: "header.titles.numbers",
  },
  letters: {
    icon: "🔤",
    navLabelKey: "nav.letters",
    homeTitleKey: "home.topics.letters.title",
    homeDescriptionKey: "home.topics.letters.description",
    headerTitleKey: "header.titles.letters",
  },
  colors: {
    icon: "🎨",
    navLabelKey: "nav.colors",
    homeTitleKey: "home.topics.colors.title",
    homeDescriptionKey: "home.topics.colors.description",
    headerTitleKey: "header.titles.colors",
  },
  shapes: {
    icon: "🔷",
    navLabelKey: "nav.shapes",
    homeTitleKey: "home.topics.shapes.title",
    homeDescriptionKey: "home.topics.shapes.description",
    headerTitleKey: "header.titles.shapes",
  },
  flashcards: {
    icon: "📚",
    navLabelKey: "nav.flashcards",
    homeTitleKey: "home.topics.flashcards.title",
    homeDescriptionKey: "home.topics.flashcards.description",
    headerTitleKey: "header.titles.flashcards",
  },
};

const LEARN_TOPIC_IDS: TopicId[] = ["numbers", "letters", "colors", "shapes"];
const GAME_TOPIC_IDS: GameTopicId[] = ["numbers", "letters", "colors", "shapes", "flashcards"];

export const LEARN_TOPICS: TopicMeta[] = LEARN_TOPIC_IDS.map(id => ({
  id,
  path: `/learn/${id}` as LearnTopicPath,
  ...DISPLAY_BY_ID[id],
  theme: THEME_BY_ID[id],
}));

export const GAME_TOPICS: GameTopicMeta[] = GAME_TOPIC_IDS.map(id => ({
  id,
  path: `/game/${id}` as GameTopicPath,
  ...DISPLAY_BY_ID[id],
  theme: THEME_BY_ID[id],
}));

export const IMMERSIVE_PATHS: readonly string[] = [
  "/learn/numbers",
  "/learn/letters",
  "/learn/colors",
  "/learn/shapes",
  "/game/numbers",
  "/game/shapes",
  "/game/flashcards",
  "/game/letters/alphabet",
  "/game/letters/sequence",
  "/game/letters/sounds",
  "/game/colors/identify",
  "/game/colors/matching",
  "/game/colors/coloring",
  "/game/colors/sort",
];

export const getLearnTopicByPath = (path: string): TopicMeta | undefined =>
  LEARN_TOPICS.find(topic => topic.path === path);

export const getGameTopicByPath = (path: string): GameTopicMeta | undefined =>
  GAME_TOPICS.find(topic => topic.path === path);

export const isImmersivePath = (pathname: string): boolean =>
  IMMERSIVE_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));

export { DEFAULT_TOY_PALETTE, getTopicVisual, TOPIC_VISUALS } from "@/data/topic-visuals";
export type {
  TopicVisual,
  ToyAssetRole,
  ToyBackdropPattern,
  ToyMotionProfile,
  ToyPalette,
  ToyShapeKind,
} from "@/data/topic-visuals";
