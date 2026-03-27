import { FOLLOW_UP_QUESTION_BANK, INITIAL_PROMPTS } from "@/lib/constants";
import { ConversationTurn, FollowUpQuestion, PromptCategory } from "@/lib/types";

const CATEGORY_KEYWORDS: Record<PromptCategory, string[]> = {
  practical_barriers: [
    "cost",
    "money",
    "schedule",
    "time",
    "transport",
    "work",
    "paperwork",
    "coverage",
    "staffing",
    "arrange"
  ],
  emotional_concerns: [
    "guilt",
    "worry",
    "afraid",
    "fear",
    "anxious",
    "stress",
    "judged",
    "trust",
    "alone"
  ],
  safety_considerations: [
    "safe",
    "safety",
    "fall",
    "medication",
    "wander",
    "medical",
    "emergency",
    "behavior",
    "supervision"
  ],
  past_negative_experiences: [
    "before",
    "last time",
    "previous",
    "used to",
    "bad experience",
    "went wrong",
    "happened",
    "again"
  ],
  support_preferences: [
    "prefer",
    "want",
    "need",
    "comfortable",
    "trained",
    "familiar",
    "same person",
    "routine"
  ]
};

export function getInitialAssistantTurns(): ConversationTurn[] {
  return INITIAL_PROMPTS.map((prompt) => ({
    id: prompt.id,
    role: "assistant",
    promptType: "initial",
    category: prompt.category,
    content: prompt.question,
    createdAt: new Date().toISOString()
  }));
}

export function buildTranscript(turns: ConversationTurn[]): string {
  return turns.map((turn) => `${turn.role.toUpperCase()}: ${turn.content}`).join("\n");
}

export function selectFollowUpQuestions(turns: ConversationTurn[]): FollowUpQuestion[] {
  const userText = turns
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.content.toLowerCase())
    .join(" ");

  const missingCategories = (Object.keys(CATEGORY_KEYWORDS) as PromptCategory[]).filter(
    (category) => !CATEGORY_KEYWORDS[category].some((keyword) => userText.includes(keyword))
  );

  return missingCategories
    .slice(0, 3)
    .map((category) => FOLLOW_UP_QUESTION_BANK[category][0]);
}

export function getActivePromptSequence(turns: ConversationTurn[]): ConversationTurn[] {
  const initialAssistantTurns = getInitialAssistantTurns();
  const followUps = selectFollowUpQuestions(turns);

  const followUpTurns: ConversationTurn[] = followUps.map((question) => ({
    id: question.id,
    role: "assistant",
    promptType: "follow_up",
    category: question.category,
    content: question.question,
    createdAt: new Date().toISOString()
  }));

  return [...initialAssistantTurns, ...followUpTurns];
}
