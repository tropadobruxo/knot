"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GroupItem {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  moderated: boolean;
  memberCount: number;
  postCount: number;
}

interface GroupsResponse {
  groups: GroupItem[];
  total: number;
  page: number;
  pages: number;
}

export default function GroupsPage() {
  const [data, setData] = useState<GroupsResponse | null>(null);
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", city: "", moderated: true });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    params.set("page", String(page));

    fetch(`/api/groups?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<GroupsResponse>;
      })
      .then((d) => {
        setData(d);
      })
      .catch(() => {
        setData({ groups: [], total: 0, page: 1, pages: 1 });
      });
  }, [city, page]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        city: form.city || undefined,
        moderated: form.moderated,
      }),
    });

    if (res.ok) {
      setShowCreate(false);
      setForm({ name: "", description: "", city: "", moderated: true });
      setPage(1);
      // Reload
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      params.set("page", "1");
      const r = await fetch(`/api/groups?${params}`);
      setData((await r.json()) as GroupsResponse);
    } else {
      const d = (await res.json()) as { error: string };
      setError(d.error);
    }
    setCreating(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Grupos</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          {showCreate ? "Cancelar" : "Criar grupo"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mt-4 space-y-3 rounded-lg border border-zinc-200 p-4">
          <div>
            <label className="block text-sm font-medium">Nome do grupo *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={3}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Cidade</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input
                type="checkbox"
                checked={form.moderated}
                onChange={(e) => setForm({ ...form, moderated: e.target.checked })}
                id="moderated"
              />
              <label htmlFor="moderated" className="text-sm">Moderado</label>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={creating}
            className="rounded bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {creating ? "Criando..." : "Criar"}
          </button>
        </form>
      )}

      {/* Filter */}
      <div className="mt-6 flex gap-2">
        <input
          placeholder="Filtrar por cidade..."
          value={city}
          onChange={(e) => { setCity(e.target.value); setPage(1); }}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm"
        />
      </div>

      {/* Loading skeleton */}
      {!data && (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="flex items-start gap-3">
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-36" />
                  <div className="skeleton h-4 w-full" />
                  <div className="flex gap-4">
                    <div className="skeleton h-3 w-16" />
                    <div className="skeleton h-3 w-20" />
                    <div className="skeleton h-3 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {data && data.groups.length === 0 && (
        <div className="mt-12 text-center" style={{ animation: "slide-up 0.5s ease-out" }}>
          <div className="relative mx-auto h-28 w-28">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-200 to-indigo-200 opacity-50 blur-xl" />
            <div className="animate-float relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100">
              <svg className="h-14 w-14 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <svg className="animate-float-delayed absolute -right-2 -top-1 h-5 w-5 text-violet-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <svg className="animate-float absolute -left-3 top-3 h-4 w-4 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <p className="mt-5 text-lg font-semibold text-zinc-700">Nenhum grupo encontrado</p>
          <p className="mt-1 text-sm text-zinc-400">Crie um grupo ou explore os existentes</p>
        </div>
      )}

      {data && data.groups.length > 0 && (
        <div className="mt-4 space-y-3">
          {data.groups.map((group, idx) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className={`group block rounded-xl border border-zinc-200 p-4 transition hover:border-violet-300 hover:shadow-md animate-card-enter${idx > 0 && idx <= 4 ? `-${idx}` : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold group-hover:text-violet-600">{group.name}</h3>
                    <div className="flex items-center gap-2">
                      {group.moderated && (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                          </svg>
                          Moderado
                        </span>
                      )}
                    </div>
                  </div>
                  {group.description && (
                    <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                    {group.city && (
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {group.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      {group.memberCount} membros
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      {group.postCount} posts
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-zinc-500">{page} / {data.pages}</span>
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
