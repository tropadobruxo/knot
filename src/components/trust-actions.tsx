"use client";

import { useState } from "react";
import { REPORT_REASONS, REPORT_REASON_LABELS, type ReportReason } from "@/lib/trust-safety";

interface TrustActionsProps {
  targetId: string;
  targetType?: "user" | "post" | "comment" | "event" | "message";
}

export function TrustActions({ targetId, targetType = "user" }: TrustActionsProps) {
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState<ReportReason>("harassment");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleBlock() {
    if (!confirm("Bloquear este usuário? Likes e matches mútuos serão removidos.")) return;
    setLoading(true);
    setFeedback(null);
    const res = await fetch("/api/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    if (res.ok) {
      setFeedback("Usuário bloqueado.");
    } else {
      const data = (await res.json()) as { error: string };
      setFeedback(data.error);
    }
    setLoading(false);
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId, targetType, reason, details: details || undefined }),
    });
    if (res.ok) {
      setFeedback("Denúncia enviada. Obrigado.");
      setShowReport(false);
      setDetails("");
    } else {
      const data = (await res.json()) as { error: string };
      setFeedback(data.error);
    }
    setLoading(false);
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex gap-2">
        <button
          onClick={handleBlock}
          disabled={loading}
          className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Bloquear
        </button>
        <button
          onClick={() => setShowReport(!showReport)}
          disabled={loading}
          className="rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          {showReport ? "Cancelar" : "Denunciar"}
        </button>
      </div>

      {feedback && (
        <p className="text-sm text-zinc-600">{feedback}</p>
      )}

      {showReport && (
        <form onSubmit={handleReport} className="space-y-3 rounded-lg border border-zinc-200 p-3">
          <div>
            <label className="block text-sm font-medium">Motivo</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {REPORT_REASON_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Detalhes (opcional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              maxLength={2000}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
              placeholder="Descreva o que aconteceu..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar denúncia"}
          </button>
        </form>
      )}
    </div>
  );
}
