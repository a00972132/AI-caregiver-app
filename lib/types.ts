export type PromptCategory =
  | "practical_barriers"
  | "emotional_concerns"
  | "safety_considerations"
  | "past_negative_experiences"
  | "support_preferences";

export type TurnRole = "assistant" | "user";

export type PromptType = "initial" | "follow_up" | "system";

export interface ConversationTurn {
  id: string;
  role: TurnRole;
  promptType: PromptType;
  category?: PromptCategory | "situations_to_avoid";
  content: string;
  createdAt: string;
}

export interface StructuredSummary {
  key_barriers: string[];
  emotional_concerns: string[];
  safety_considerations: string[];
  past_negative_experiences: string[];
  situations_to_avoid: string[];
  conditions_for_successful_respite: string[];
  unresolved_questions: string[];
  caregiver_summary_text: string;
}

export interface SessionDraft {
  sessionId: string;
  email: string;
  consented: boolean;
  turns: ConversationTurn[];
  structuredSummary?: StructuredSummary;
  editedSummary?: StructuredSummary;
  feedback?: {
    usefulnessRating: string;
    comments: string;
  };
}

export interface FollowUpQuestion {
  id: string;
  category: PromptCategory;
  question: string;
}
