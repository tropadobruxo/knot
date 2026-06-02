"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_GROUPS } from "@/lib/demo-data";

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
        if (d.groups.length > 0) {
          setData(d);
        } else {
          setData({ groups: DEMO_GROUPS, total: DEMO_GROUPS.length, page: 1, pages: 1 });
        }
      })
      .catch(() => {
        setData({ groups: DEMO_GROUPS, total: DEMO_GROUPS.length, page: 1, pages: 1 });
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

      {/* List */}
      {data && data.groups.length === 0 && (
        <p className="mt-8 text-zinc-500">Nenhum grupo encontrado.</p>
      )}

      {data && data.groups.length > 0 && (
        <div className="mt-4 space-y-3">
          {data.groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="block rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{group.name}</h3>
                  {group.description && (
                    <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 text-xs text-zinc-500">
                  {group.city && <span>{group.city}</span>}
                  <span>{group.memberCount} membros</span>
                  <span>{group.postCount} posts</span>
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
