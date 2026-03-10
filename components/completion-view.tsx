"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell";
import { StatusBanner } from "@/components/status-banner";
import { loadDraft, saveDraft } from "@/lib/storage";
import { StructuredSummary } from "@/lib/types";

function SummaryBlock({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</h2>
      <ul className="space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-canvas px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompletionView() {
  const [summary, setSummary] = useState<StructuredSummary | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [rating, setRating] = useState("");
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const draft = loadDraft();
    if (!draft?.editedSummary) {
      return;
    }

    setSummary(draft.editedSummary);
    setSessionId(draft.sessionId);
    setRating(draft.feedback?.usefulnessRating ?? "");
    setComments(draft.feedback?.comments ?? "");
  }, []);

  async function handleFeedbackSave() {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sessionId,
        usefulnessRating: rating,
        comments
      })
    });

    if (!response.ok) {
      setStatus("Unable to save feedback right now.");
      return;
    }

    const draft = loadDraft();
    if (draft) {
      draft.feedback = {
        usefulnessRating: rating,
        comments
      };
      saveDraft(draft);
    }

    setStatus("Feedback saved.");
  }

  if (!summary) {
    return (
      <AppShell title="Completion" subtitle="The saved summary will appear here after confirmation.">
        <StatusBanner tone="info">No saved summary is available yet.</StatusBanner>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Summary saved"
      subtitle="This view shows the final edited summary, allows a browser PDF export, and collects lightweight feedback."
    >
      <div className="space-y-5">
        <SummaryBlock label="Key barriers" items={summary.key_barriers} />
        <SummaryBlock label="Emotional concerns" items={summary.emotional_concerns} />
        <SummaryBlock label="Safety considerations" items={summary.safety_considerations} />
        <SummaryBlock label="Past negative experiences" items={summary.past_negative_experiences} />
        <SummaryBlock label="Situations to avoid" items={summary.situations_to_avoid} />
        <SummaryBlock
          label="Conditions for successful respite"
          items={summary.conditions_for_successful_respite}
        />
        <SummaryBlock label="Unresolved questions" items={summary.unresolved_questions} />

        <div className="rounded-2xl bg-canvas px-4 py-4 text-sm leading-6 text-slate-700">
          {summary.caregiver_summary_text}
        </div>

        <button
          className="print-hidden w-full rounded-2xl border border-accent px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white"
          type="button"
          onClick={() => window.print()}
        >
          Download as PDF
        </button>

        <div className="space-y-3 border-t border-border pt-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">How useful was this?</span>
            <input
              className="w-full rounded-2xl border border-border px-4 py-3 outline-none transition focus:border-accent"
              placeholder="For example: very useful, somewhat useful, not useful"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Comments</span>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-border px-4 py-3 outline-none transition focus:border-accent"
              value={comments}
              onChange={(event) => setComments(event.target.value)}
            />
          </label>
          <button
            className="print-hidden w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            type="button"
            onClick={handleFeedbackSave}
          >
            Save feedback
          </button>
          {status ? <StatusBanner tone="success">{status}</StatusBanner> : null}
        </div>
      </div>
    </AppShell>
  );
}
