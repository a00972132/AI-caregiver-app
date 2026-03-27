"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell";
import { StatusBanner } from "@/components/status-banner";
import { saveDraft } from "@/lib/storage";

export function WelcomeForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!email.trim()) {
      setError("Enter an email so this prototype can tie the reflection to a session.");
      return;
    }

    if (!consented) {
      setError("Consent is required before starting the reflection.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      email: email.trim(),
      consented
    };

    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Unable to start the session.");
      }

      const data = (await response.json()) as { sessionId: string };

      saveDraft({
        sessionId: data.sessionId,
        email: email.trim(),
        consented,
        turns: []
      });

      router.push("/reflection");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to start the prototype."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Reflect before respite"
      subtitle="This prototype guides a short reflection, turns it into a structured summary, and lets you edit it before saving."
    >
      <div className="space-y-5">
        <div className="rounded-2xl bg-canvas p-4 text-sm leading-6 text-slate-700">
          This MVP is focused on one workflow: guided reflection, AI-assisted structuring, then review
          and editing before final save.
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="w-full rounded-2xl border border-border px-4 py-3 outline-none transition focus:border-accent"
            placeholder="caregiver@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-border px-4 py-3">
          <input
            checked={consented}
            className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            type="checkbox"
            onChange={(event) => setConsented(event.target.checked)}
          />
          <span className="text-sm leading-6 text-slate-700">
            I understand this is a prototype and I consent to entering caregiving reflections for
            summary generation and storage.
          </span>
        </label>

        {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}

        <button
          className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="button"
          onClick={handleStart}
        >
          {loading ? "Starting..." : "Start reflection"}
        </button>
      </div>
    </AppShell>
  );
}
