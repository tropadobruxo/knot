"use client";

import { useState } from "react";
import Link from "next/link";

type SearchType = "profiles" | "groups" | "events";

interface Result {
  id: string;
  username?: string;
  name?: string;
  title?: string;
  bio?: string;
  description?: string;
  city?: string;
  roleType?: string;
  type?: string;
  datetime?: string;
}

const TABS: { value: SearchType; label: string }[] = [
  { value: "profiles", label: "Perfis" },
  { value: "groups", label: "Grupos" },
  { value: "events", label: "Eventos" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchType>("profiles");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
      if (res.ok) {
        const data = (await res.json()) as { results: Result[] };
        setResults(data.results);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  function getLink(r: Result): string {
    if (type === "profiles") return `/profile/${r.username}`;
    if (type === "groups") return `/groups/${r.id}`;
    return `/events/${r.id}`;
  }

  function getLabel(r: Result): string {
    if (type === "profiles") return r.username ?? "";
    if (type === "groups") return r.name ?? "";
    return r.title ?? "";
  }

  function getSublabel(r: Result): string {
    if (type === "profiles") return [r.roleType, r.city].filter(Boolean).join(" — ");
    if (type === "groups") return r.city ?? "";
    return [r.city, r.datetime ? new Date(r.datetime).toLocaleDateString("pt-BR") : ""].filter(Boolean).join(" — ");
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold">Buscar</h1>

      <form onSubmit={handleSearch} className="mt-4 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          minLength={2}
        />
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "..." : "Buscar"}
        </button>
      </form>

      <div className="mt-4 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setType(tab.value); setResults([]); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              type === tab.value
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {results.length === 0 && query.length >= 2 && !loading && (
          <p className="text-sm text-zinc-400">Nenhum resultado.</p>
        )}
        {results.map((r) => (
          <Link
            key={r.id}
            href={getLink(r)}
            className="block rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50"
          >
            <p className="font-medium">{getLabel(r)}</p>
            <p className="text-sm text-zinc-500">{getSublabel(r)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
