import { FollowUpQuestion, PromptCategory, StructuredSummary } from "@/lib/types";

export const APP_NAME = "Caregiver Reflection Prototype";

export const INITIAL_PROMPTS = [
  {
    id: "initial-1",
    category: "practical_barriers" as const,
    question: "What holds me back?"
  },
  {
    id: "initial-2",
    category: "emotional_concerns" as const,
    question: "What is hard for me?"
  },
  {
    id: "initial-3",
    category: "situations_to_avoid" as const,
    question: "What would I want to avoid?"
  }
];

export const FOLLOW_UP_QUESTION_BANK: Record<PromptCategory, FollowUpQuestion[]> = {
  practical_barriers: [
    {
      id: "practical-1",
      category: "practical_barriers",
      question: "Are there practical issues like cost, timing, transportation, or scheduling that make respite difficult?"
    },
    {
      id: "practical-2",
      category: "practical_barriers",
      question: "What part of arranging coverage feels hardest to manage day to day?"
    }
  ],
  emotional_concerns: [
    {
      id: "emotional-1",
      category: "emotional_concerns",
      question: "Are there emotions like guilt, worry, or feeling judged that make it harder to step away?"
    },
    {
      id: "emotional-2",
      category: "emotional_concerns",
      question: "What thoughts come up when you imagine someone else taking over care for a while?"
    }
  ],
  safety_considerations: [
    {
      id: "safety-1",
      category: "safety_considerations",
      question: "What safety or medical needs would you need another caregiver to handle correctly before you could take a break?"
    },
    {
      id: "safety-2",
      category: "safety_considerations",
      question: "Are there warning signs or routines that make you feel the person you support cannot be left with just anyone?"
    }
  ],
  past_negative_experiences: [
    {
      id: "past-1",
      category: "past_negative_experiences",
      question: "Have you had a past respite or caregiving experience that went badly and still affects your trust?"
    },
    {
      id: "past-2",
      category: "past_negative_experiences",
      question: "Was there a moment when asking for help or taking a break created more stress instead of relief?"
    }
  ],
  support_preferences: [
    {
      id: "support-1",
      category: "support_preferences",
      question: "If respite did feel workable, what kind of help or support setup would make it feel acceptable to you?"
    },
    {
      id: "support-2",
      category: "support_preferences",
      question: "What would you want another caregiver or program to understand about your preferences before helping?"
    }
  ]
};

export const EMPTY_SUMMARY: StructuredSummary = {
  key_barriers: [],
  emotional_concerns: [],
  safety_considerations: [],
  past_negative_experiences: [],
  situations_to_avoid: [],
  conditions_for_successful_respite: [],
  unresolved_questions: [],
  caregiver_summary_text: ""
};

export const STORAGE_KEY = "caregiver-reflection-draft";
