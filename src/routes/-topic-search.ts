import type { TopicMode } from "@/data/topics";

export interface TopicSearch {
  mode: TopicMode;
}

export const validateTopicSearch = (search: Record<string, unknown>): TopicSearch => {
  return {
    mode: search.mode === "game" ? "game" : "learn",
  };
};
