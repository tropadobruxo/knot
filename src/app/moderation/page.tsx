"use client";

import { useCallback, useEffect, useState } from "react";
import { REPORT_REASON_LABELS, type ReportReason } from "@/lib/trust-safety";

interface ReportItem {
  id: string;
  targetType: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  creator: { username: string };
  target: { id: string; username: string; status: string };
}

interface ReportsResponse {
  reports: ReportItem[];
  total: number;
  page: number;
  pages: number;
}

interface TargetHistory {
  total: number;
  distinctReporters: number;
  byReason: { reason: string; count: number }[];
  byStatus: { status: string; count: number }[];
  moderationLogs: { id: string; action: string; reason: string; createdAt: string }[];
  reports: {
    id: string;
    reason: string;
    status: string;
    createdAt: string;
    creator: { username: string };
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  reviewed: "bg-blue-100 text-blue-800",
  actioned: "bg-red-100 text-red-800",
  dismissed: "bg-zinc-100 text-zinc-600",
};

export default function ModerationPage() {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [openHistory, setOpenHistory] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, TargetHistory>>({});

  async function toggleHistory(targetId: string) {
    if (openHistory === targetId) {
      setOpenHistory(null);
      return;
    }
    setOpenHistory(targetId);
    if (!history[targetId]) {
      const res = await fetch(`/api/moderation/users/${targetId}/reports`);
      if (res.ok) {
        const data = (await res.json()) as TargetHistory;
        setHistory((prev) => ({ ...prev, [targetId]: data }));
      }
    }
  }

  const loadReports = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));

    const res = await fetch(`/api/moderation/reports?${params}`);
    if (res.ok) {
      setData((await res.json()) as ReportsResponse);
      setError("");
    } else {
      setError("Erro ao carregar denúncias.");
    }
  }, [statusFilter, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch sets state in callback, not synchronously
    void loadReports();
  }, [loadReports]);

  async function handleAction(
    reportId: string,
    action: "warn" | "suspend" | "ban" | null,
    status: "actioned" | "dismissed",
  ) {
    setActionLoading(reportId);
    const body: Record<string, string> = { status };
    if (action) {
      body.action = action;
      body.reason = `Moderação via painel`;
    }

    const res = await fetch(`/api/moderation/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await loadReports();
    }
    setActionLoading(null);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">Painel de moderação</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Gerencie denúncias e aplique ações.
      </p>

      {/* Filters */}
      <div className="mt-6 flex gap-2">
        {["pending", "reviewed", "actioned", "dismissed", ""].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-sm ${
              statusFilter === s
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {s === "" ? "Todas" : s === "pending" ? "Pendentes" : s === "reviewed" ? "Revisadas" : s === "actioned" ? "Com ação" : "Dispensadas"}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {data && data.reports.length === 0 && (
        <p className="mt-8 text-zinc-500">Nenhuma denúncia encontrada.</p>
      )}

      {data && data.reports.length > 0 && (
        <div className="mt-6 space-y-4">
          {data.reports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-zinc-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[report.status] ?? ""}`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {report.targetType}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">
                    <span className="font-medium">{report.creator.username}</span>
                    {" denunciou "}
                    <span className="font-medium">{report.target.username}</span>
                    {report.target.status !== "active" && (
                      <span className="ml-1 text-xs text-red-500">
                        ({report.target.status})
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Motivo: {REPORT_REASON_LABELS[report.reason as ReportReason] ?? report.reason}
                  </p>
                  {report.details && (
                    <p className="mt-1 text-sm text-zinc-500">
                      {report.details}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-400">
                    {new Date(report.createdAt).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <button
                    onClick={() => toggleHistory(report.target.id)}
                    className="mt-2 text-xs font-medium text-violet-600 hover:underline"
                  >
                    {openHistory === report.target.id
                      ? "Ocultar histórico"
                      : "Ver histórico de denúncias"}
                  </button>
                </div>

                {report.status === "pending" && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleAction(report.id, "warn", "actioned")}
                      disabled={actionLoading === report.id}
                      className="rounded bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                    >
                      Avisar
                    </button>
                    <button
                      onClick={() => handleAction(report.id, "suspend", "actioned")}
                      disabled={actionLoading === report.id}
                      className="rounded bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800 hover:bg-orange-200 disabled:opacity-50"
                    >
                      Suspender
                    </button>
                    <button
                      onClick={() => handleAction(report.id, "ban", "actioned")}
                      disabled={actionLoading === report.id}
                      className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
                    >
                      Banir
                    </button>
                    <button
                      onClick={() => handleAction(report.id, null, "dismissed")}
                      disabled={actionLoading === report.id}
                      className="rounded bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-50"
                    >
                      Dispensar
                    </button>
                  </div>
                )}
              </div>

              {openHistory === report.target.id && (
                <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-900/60">
                  <HistoryPanel data={history[report.target.id]} />
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-zinc-500">
                {page} / {data.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page >= data.pages}
                className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function HistoryPanel({ data }: { data: TargetHistory | undefined }) {
  if (!data) {
    return <p className="text-zinc-500">Carregando histórico...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="font-medium">
          {data.total} denúncia{data.total !== 1 ? "s" : ""} no total
        </span>
        <span className="text-zinc-500">
          {data.distinctReporters} denunciante
          {data.distinctReporters !== 1 ? "s" : ""} distinto
          {data.distinctReporters !== 1 ? "s" : ""}
        </span>
      </div>

      {data.byReason.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.byReason.map((r) => (
            <span
              key={r.reason}
              className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {REPORT_REASON_LABELS[r.reason as ReportReason] ?? r.reason}: {r.count}
            </span>
          ))}
        </div>
      )}

      {data.moderationLogs.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-500">Ações anteriores</p>
          <ul className="mt-1 space-y-1">
            {data.moderationLogs.map((log) => (
              <li key={log.id} className="text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">{log.action}</span> — {log.reason}{" "}
                <span className="text-zinc-400">
                  ({new Date(log.createdAt).toLocaleDateString("pt-BR")})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-zinc-500">Linha do tempo</p>
        <ul className="mt-1 space-y-1">
          {data.reports.map((r) => (
            <li key={r.id} className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="text-zinc-400">
                {new Date(r.createdAt).toLocaleDateString("pt-BR")}
              </span>{" "}
              — {REPORT_REASON_LABELS[r.reason as ReportReason] ?? r.reason} (
              {r.status}) por {r.creator.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
