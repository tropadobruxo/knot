"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_MATCHES } from "@/lib/demo-data";

interface MatchItem {
  matchId: string;
  conversationId: string | null;
  createdAt: string;
  user: { id: string; username: string; image: string | null };
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ matches: MatchItem[] }>;
      })
      .then((d) => {
        setMatches(d.matches.length > 0 ? d.matches : DEMO_MATCHES);
        setLoading(false);
      })
      .catch(() => {
        setMatches(DEMO_MATCHES);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-bold">Matches</h1>
      <p className="mt-1 text-sm text-zinc-500">Suas conexões</p>

      {matches.length === 0 && (
        <div className="mt-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
            <svg className="h-10 w-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <p className="mt-4 text-zinc-500">Nenhum match ainda.</p>
          <p className="mt-1 text-sm text-zinc-400">Curta perfis para criar conexões</p>
          <Link
            href="/discover"
            className="mt-4 inline-block rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Descobrir perfis
          </Link>
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-4 space-y-2">
          {matches.map((m) => (
            <div
              key={m.matchId}
              className="flex items-center justify-between rounded-lg border border-zinc-200 p-3"
            >
              <div className="flex items-center gap-3">
                {m.user.image ? (
                  <img
                    src={m.user.image}
                    alt={m.user.username}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-800">
                    {m.user.username[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <Link
                    href={`/profile/${m.user.username}`}
                    className="font-medium hover:text-violet-600"
                  >
                    {m.user.username}
                  </Link>
                  <p className="text-xs text-zinc-400">
                    Match em{" "}
                    {new Date(m.createdAt).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
              {m.conversationId && (
                <Link
                  href={`/chat/${m.conversationId}`}
                  className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Chat
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
