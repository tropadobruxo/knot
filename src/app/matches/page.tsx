"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ matches: MatchItem[] }>;
      })
      .then((d) => {
        setMatches(d.matches);
        setLoading(false);
      })
      .catch(() => {
        setMatches([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-6 py-10">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton mt-2 h-4 w-28" />
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <div className="skeleton h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-3 w-20" />
              </div>
              <div className="skeleton h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-bold">Matches</h1>
      <p className="mt-1 text-sm text-zinc-500">Suas conexões</p>

      {matches.length === 0 && (
        <div className="mt-12 text-center" style={{ animation: "slide-up 0.5s ease-out" }}>
          <div className="relative mx-auto h-28 w-28">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-200 to-pink-200 opacity-50 blur-xl" />
            <div className="animate-float relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-pink-100">
              <svg className="h-14 w-14 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            {/* Floating mini hearts */}
            <svg className="animate-float-delayed absolute -right-2 -top-1 h-5 w-5 text-pink-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <svg className="animate-float absolute -left-3 top-3 h-4 w-4 text-violet-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <p className="mt-5 text-lg font-semibold text-zinc-700">Nenhum match ainda</p>
          <p className="mt-1 text-sm text-zinc-400">Curta perfis para criar conexões</p>
          <Link
            href="/discover"
            className="mt-5 inline-block rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition hover:shadow-xl active:scale-95"
          >
            Descobrir perfis
          </Link>
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-4 space-y-2">
          {matches.map((m, idx) => (
            <div
              key={m.matchId}
              className={`flex items-center justify-between rounded-xl border border-zinc-200 p-3 transition hover:border-violet-200 hover:shadow-sm dark:border-zinc-700 animate-card-enter${idx > 0 && idx <= 4 ? `-${idx}` : ""}`}
            >
              <div className="flex items-center gap-3">
                {m.user.image ? (
                  <Image
                    src={m.user.image}
                    alt={m.user.username}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                    unoptimized={m.user.image.includes("dicebear")}
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
