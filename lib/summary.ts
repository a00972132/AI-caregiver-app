import { EMPTY_SUMMARY } from "@/lib/constants";
import { ConversationTurn, StructuredSummary } from "@/lib/types";

function userResponses(turns: ConversationTurn[]) {
  return turns
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.content.trim())
    .filter(Boolean);
}

function splitBullets(text: string) {
  return text
    .split(/[.;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function buildFallbackSummary(turns: ConversationTurn[]): StructuredSummary {
  const responses = userResponses(turns);
  const joined = responses.join(". ");
  const bullets = splitBullets(joined);

  return {
    ...EMPTY_SUMMARY,
    key_barriers: bullets.slice(0, 3),
    emotional_concerns: bullets.filter((item) =>
      /(guilt|worry|fear|stress|overwhelm|anxious|trust)/i.test(item)
    ),
    safety_considerations: bullets.filter((item) =>
      /(safe|safety|medication|medical|fall|emergency|wandering|supervision)/i.test(item)
    ),
    past_negative_experiences: bullets.filter((item) =>
      /(before|last time|previous|went wrong|bad experience)/i.test(item)
    ),
    situations_to_avoid: bullets.filter((item) =>
      /(avoid|don't want|do not want|uncomfortable|wouldn't want)/i.test(item)
    ),
    conditions_for_successful_respite: bullets.filter((item) =>
      /(need|want|prefer|helpful|would work|comfortable)/i.test(item)
    ),
    unresolved_questions: [
      "What type of respite support would feel safe enough to try first?",
      "What information or preparation would build trust in a backup caregiver?"
    ],
    caregiver_summary_text:
      joined ||
      "The caregiver shared several concerns about taking respite and wants a clearer, safer support plan before stepping away."
  };
}

export function normalizeStructuredSummary(input: unknown): StructuredSummary {
  const candidate = input as Partial<StructuredSummary> | undefined;

  return {
    key_barriers: Array.isArray(candidate?.key_barriers) ? candidate.key_barriers.map(String) : [],
    emotional_concerns: Array.isArray(candidate?.emotional_concerns)
      ? candidate.emotional_concerns.map(String)
      : [],
    safety_considerations: Array.isArray(candidate?.safety_considerations)
      ? candidate.safety_considerations.map(String)
      : [],
    past_negative_experiences: Array.isArray(candidate?.past_negative_experiences)
      ? candidate.past_negative_experiences.map(String)
      : [],
    situations_to_avoid: Array.isArray(candidate?.situations_to_avoid)
      ? candidate.situations_to_avoid.map(String)
      : [],
    conditions_for_successful_respite: Array.isArray(candidate?.conditions_for_successful_respite)
      ? candidate.conditions_for_successful_respite.map(String)
      : [],
    unresolved_questions: Array.isArray(candidate?.unresolved_questions)
      ? candidate.unresolved_questions.map(String)
      : [],
    caregiver_summary_text:
      typeof candidate?.caregiver_summary_text === "string"
        ? candidate.caregiver_summary_text
        : ""
  };
}
