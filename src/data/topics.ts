export type TopicId = "numbers" | "letters" | "colors" | "shapes";
export type TopicPath = "/numbers" | "/letters" | "/colors" | "/shapes";

export interface TopicTheme {
  active: string;
  inactive: string;
  cardClass: string;
  titleClass: string;
  descClass: string;
  buttonClass: string;
  arrowClass: string;
}

export interface TopicMeta {
  id: TopicId;
  path: TopicPath;
  icon: string;
  navLabelKey: string;
  homeTitleKey: string;
  homeDescriptionKey: string;
  headerTitleKey: string;
  theme: TopicTheme;
}

export const TOPICS: TopicMeta[] = [
  {
    id: "numbers",
    path: "/numbers",
    icon: "🔢",
    navLabelKey: "nav.numbers",
    homeTitleKey: "home.topics.numbers.title",
    homeDescriptionKey: "home.topics.numbers.description",
    headerTitleKey: "header.titles.numbers",
    theme: {
      active: "bg-blue-500 text-white shadow-md hover:bg-blue-600",
      inactive: "border-2 border-blue-400 bg-white/80 text-blue-600 hover:bg-white",
      cardClass: "border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200",
      titleClass: "text-blue-800",
      descClass: "text-blue-700/80",
      buttonClass: "bg-blue-500 hover:bg-blue-600",
      arrowClass: "text-blue-500",
    },
  },
  {
    id: "letters",
    path: "/letters",
    icon: "🔤",
    navLabelKey: "nav.letters",
    homeTitleKey: "home.topics.letters.title",
    homeDescriptionKey: "home.topics.letters.description",
    headerTitleKey: "header.titles.letters",
    theme: {
      active: "bg-green-500 text-white shadow-md hover:bg-green-600",
      inactive: "border-2 border-green-400 bg-white/80 text-green-600 hover:bg-white",
      cardClass: "border-green-300 bg-gradient-to-br from-green-100 to-green-200",
      titleClass: "text-green-800",
      descClass: "text-green-700/80",
      buttonClass: "bg-green-500 hover:bg-green-600",
      arrowClass: "text-green-500",
    },
  },
  {
    id: "colors",
    path: "/colors",
    icon: "🎨",
    navLabelKey: "nav.colors",
    homeTitleKey: "home.topics.colors.title",
    homeDescriptionKey: "home.topics.colors.description",
    headerTitleKey: "header.titles.colors",
    theme: {
      active: "bg-pink-500 text-white shadow-md hover:bg-pink-600",
      inactive: "border-2 border-pink-400 bg-white/80 text-pink-600 hover:bg-white",
      cardClass: "border-pink-300 bg-gradient-to-br from-pink-100 to-pink-200",
      titleClass: "text-pink-800",
      descClass: "text-pink-700/80",
      buttonClass: "bg-pink-500 hover:bg-pink-600",
      arrowClass: "text-pink-500",
    },
  },
  {
    id: "shapes",
    path: "/shapes",
    icon: "🔷",
    navLabelKey: "nav.shapes",
    homeTitleKey: "home.topics.shapes.title",
    homeDescriptionKey: "home.topics.shapes.description",
    headerTitleKey: "header.titles.shapes",
    theme: {
      active: "bg-indigo-500 text-white shadow-md hover:bg-indigo-600",
      inactive: "border-2 border-indigo-400 bg-white/80 text-indigo-600 hover:bg-white",
      cardClass: "border-indigo-300 bg-gradient-to-br from-indigo-100 to-indigo-200",
      titleClass: "text-indigo-800",
      descClass: "text-indigo-700/80",
      buttonClass: "bg-indigo-500 hover:bg-indigo-600",
      arrowClass: "text-indigo-500",
    },
  },
];

export const getTopicByPath = (path: string): TopicMeta | undefined =>
  TOPICS.find(topic => topic.path === path);
