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

const TABS: { value: SearchType; label: string; icon: string }[] = [
  { value: "profiles", label: "Perfis", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
  { value: "groups", label: "Grupos", icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" },
  { value: "events", label: "Eventos", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchType>("profiles");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;

    setLoading(true);
    setSearched(true);
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
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar perfis, grupos, eventos..."
            className="w-full rounded-xl border border-zinc-300 py-2.5 pl-10 pr-4 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            minLength={2}
          />
        </div>
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            "Buscar"
          )}
        </button>
      </form>

      <div className="mt-4 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setType(tab.value); setResults([]); setSearched(false); }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              type === tab.value
                ? "bg-violet-600 text-white shadow-md"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        {results.length === 0 && searched && !loading && (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
              <svg className="h-7 w-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="mt-3 text-sm text-zinc-500">Nenhum resultado encontrado.</p>
            <p className="mt-1 text-xs text-zinc-400">Tente termos diferentes.</p>
          </div>
        )}

        {!searched && !loading && (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
              <svg className="h-7 w-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="mt-3 text-sm text-zinc-500">Busque por pessoas, grupos ou eventos.</p>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-zinc-200 p-4">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton mt-2 h-3 w-48" />
              </div>
            ))}
          </div>
        )}

        {results.map((r) => (
          <Link
            key={r.id}
            href={getLink(r)}
            className="group flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition hover:border-violet-300 hover:shadow-md"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
              {getLabel(r)[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold group-hover:text-violet-600">{getLabel(r)}</p>
              <p className="text-sm text-zinc-500">{getSublabel(r)}</p>
            </div>
            <svg className="h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </main>
  );
}
