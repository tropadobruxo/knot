"use client";

import { useState } from "react";
import { REPORT_REASONS, REPORT_REASON_LABELS, type ReportReason } from "@/lib/trust-safety";

interface TrustActionsProps {
  targetId: string;
  targetType?: "user" | "post" | "comment" | "event" | "message";
}

const REASON_ICONS: Record<ReportReason, string> = {
  harassment: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  non_consensual: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  underage_suspicion: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  spam: "M3 3l1.664 1.664M21 21l-1.5-1.5m-5.533-1.928c-.919.394-1.91.613-2.967.613-5.05 0-8.75-4.5-8.75-4.5s.964-1.164 2.58-2.46m2.397-1.653A8.18 8.18 0 0112 6.685c5.05 0 8.75 4.5 8.75 4.5s-.585.715-1.567 1.617",
  fake_profile: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  hate_speech: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z",
  doxxing: "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33",
  other: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const REASON_COLORS: Record<ReportReason, string> = {
  harassment: "text-red-500 bg-red-50 dark:bg-red-950/30",
  non_consensual: "text-red-600 bg-red-50 dark:bg-red-950/30",
  underage_suspicion: "text-orange-600 bg-orange-50 dark:bg-orange-950/30",
  spam: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  fake_profile: "text-violet-600 bg-violet-50 dark:bg-violet-950/30",
  hate_speech: "text-red-500 bg-red-50 dark:bg-red-950/30",
  doxxing: "text-red-600 bg-red-50 dark:bg-red-950/30",
  other: "text-zinc-500 bg-zinc-50 dark:bg-zinc-800",
};

const URGENT_REASONS: ReportReason[] = ["underage_suspicion", "non_consensual", "doxxing"];

export function TrustActions({ targetId, targetType = "user" }: TrustActionsProps) {
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleBlock() {
    if (!confirm("Bloquear este usuario? Likes e matches mutuos serao removidos.")) return;
    setLoading(true);
    setFeedback(null);
    const res = await fetch("/api/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    if (res.ok) {
      setFeedback({ type: "success", text: "Usuario bloqueado." });
    } else {
      const data = (await res.json()) as { error: string };
      setFeedback({ type: "error", text: data.error });
    }
    setLoading(false);
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;
    setLoading(true);
    setFeedback(null);
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId, targetType, reason, details: details || undefined }),
    });
    if (res.ok) {
      setFeedback({ type: "success", text: "Denuncia enviada. Obrigado por ajudar a manter a comunidade segura." });
      setShowReport(false);
      setDetails("");
      setReason(null);
    } else {
      const data = (await res.json()) as { error: string };
      setFeedback({ type: "error", text: data.error });
    }
    setLoading(false);
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">
        <button
          onClick={handleBlock}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-800/30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Bloquear
        </button>
        <button
          onClick={() => { setShowReport(!showReport); setReason(null); }}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
          {showReport ? "Cancelar" : "Denunciar"}
        </button>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
          feedback.type === "success"
            ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
            : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
        }`}>
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            {feedback.type === "success" ? (
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            )}
          </svg>
          {feedback.text}
        </div>
      )}

      {showReport && (
        <form onSubmit={handleReport} className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
          <div>
            <label className="mb-2 block text-sm font-semibold">Qual o motivo?</label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left transition ${
                    reason === r
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                      : "border-zinc-100 hover:border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${REASON_COLORS[r]}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={REASON_ICONS[r]} />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-xs font-medium">{REPORT_REASON_LABELS[r]}</span>
                    {URGENT_REASONS.includes(r) && (
                      <span className="text-[10px] text-red-500">Urgente</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {reason && URGENT_REASONS.includes(reason) && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-red-700 dark:text-red-300">
                Esta denuncia sera tratada com prioridade pela equipe de moderacao.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Detalhes (opcional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={2000}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="Descreva o que aconteceu..."
            />
          </div>
          <button
            type="submit"
            disabled={loading || !reason}
            className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-40"
          >
            {loading ? "Enviando..." : "Enviar denuncia"}
          </button>
        </form>
      )}
    </div>
  );
}
