import type { ReactNode } from "react";

import ToyFeedback from "@/components/toys/toy-feedback";

export interface FeedbackModalProps {
  kind: "correct" | "wrong";
  message: string;
  successEmoji?: string;
  wrongEmoji?: string;
  extra?: ReactNode;
}

export default function FeedbackModal(props: FeedbackModalProps) {
  return <ToyFeedback {...props} />;
}
