import type { ReactNode } from "react";

import type { GameTopicId, ToyAssetRole } from "@/data/topics";

export type ToyTileVariant = "hero" | "tile" | "mini";
export type ToyStatus = "new" | "continue" | "locked";

export interface ToyTopicProps {
  topicId: GameTopicId;
  assetRole?: ToyAssetRole;
  className?: string;
}

export interface ToyActionProps {
  children: ReactNode;
  className?: string;
}
