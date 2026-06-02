"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      .then((r) => r.json() as Promise<{ matches: MatchItem[] }>)
      .then((d) => {
        setMatches(d.matches);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

      {matches.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-zinc-500">Nenhum match ainda.</p>
          <Link
            href="/discover"
            className="mt-2 inline-block text-sm text-violet-600 hover:underline"
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-800">
                  {m.user.username[0]?.toUpperCase()}
                </div>
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
