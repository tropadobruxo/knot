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
