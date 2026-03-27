"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell";
import { StatusBanner } from "@/components/status-banner";
import { getActivePromptSequence } from "@/lib/reflection";
import { loadDraft, saveDraft } from "@/lib/storage";
import { ConversationTurn } from "@/lib/types";

function createTurn(
  role: ConversationTurn["role"],
  content: string,
  promptType: ConversationTurn["promptType"],
  category?: ConversationTurn["category"]
): ConversationTurn {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    promptType,
    category,
    createdAt: new Date().toISOString()
  };
}

export function ReflectionChat() {
  const router = useRouter();
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const draft = loadDraft();
    if (!draft?.sessionId) {
      router.replace("/");
      return;
    }

    setSessionId(draft.sessionId);
    setTurns(draft.turns);
  }, [router]);

  const prompts = useMemo(() => getActivePromptSequence(turns), [turns]);
  const answeredCount = turns.filter((turn) => turn.role === "user").length;
  const currentPrompt = prompts[answeredCount];
  const transcript = useMemo(() => {
    const visibleTurns = [...turns];
    if (currentPrompt) {
      visibleTurns.push(currentPrompt);
    }
    return visibleTurns;
  }, [currentPrompt, turns]);

  async function handleSubmit() {
    if (!inputValue.trim() || !sessionId || !currentPrompt) {
      return;
    }

    const nextTurn = createTurn("user", inputValue.trim(), currentPrompt.promptType, currentPrompt.category);
    const nextTurns = [...turns, currentPrompt, nextTurn];

    setTurns(nextTurns);
    setInputValue("");
    setError("");

    const draft = loadDraft();
    if (draft) {
      draft.turns = nextTurns;
      saveDraft(draft);
    }

    const nextPrompt = getActivePromptSequence(nextTurns)[
      nextTurns.filter((turn) => turn.role === "user").length
    ];
    if (nextPrompt) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId,
          turns: nextTurns
        })
      });

      if (!response.ok) {
        throw new Error("Summary generation failed.");
      }

      const data = await response.json();
      const updatedDraft = loadDraft();
      if (updatedDraft) {
        updatedDraft.structuredSummary = data.summary;
        updatedDraft.editedSummary = data.summary;
        saveDraft(updatedDraft);
      }

      router.push("/review");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to generate the summary."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      title="Guided reflection"
      subtitle="This is intentionally not an open chat. The app asks a fixed sequence of prompts and up to three controlled follow-ups."
    >
      <div className="flex h-full min-h-[70vh] flex-col">
        <div className="space-y-4 overflow-y-auto pb-4">
          {transcript.map((turn) => (
            <div
              key={turn.id}
              className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                turn.role === "assistant"
                  ? "mr-auto bg-canvas text-slate-700"
                  : "ml-auto bg-accent text-white"
              }`}
            >
              {turn.content}
            </div>
          ))}
        </div>

        {error ? (
          <div className="mb-3">
            <StatusBanner tone="error">{error}</StatusBanner>
          </div>
        ) : null}

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <textarea
            className="min-h-28 w-full rounded-2xl border border-border px-4 py-3 outline-none transition focus:border-accent disabled:bg-slate-50"
            disabled={!currentPrompt || submitting}
            placeholder={currentPrompt ? "Type your response..." : "All questions answered."}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <button
            className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!currentPrompt || !inputValue.trim() || submitting}
            type="button"
            onClick={handleSubmit}
          >
            {submitting ? "Building summary..." : currentPrompt ? "Send response" : "Complete"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
