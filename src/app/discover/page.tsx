"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_PROFILES } from "@/lib/demo-data";

interface Profile {
  id: string;
  username: string;
  bio: string | null;
  city: string | null;
  roleType: string | null;
  intent: string[];
  photo: string | null;
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchMsg, setMatchMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/discover?limit=20")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ profiles: Profile[] }>;
      })
      .then((d) => {
        setProfiles(d.profiles.length > 0 ? d.profiles : DEMO_PROFILES);
        setLoading(false);
      })
      .catch(() => {
        setProfiles(DEMO_PROFILES);
        setLoading(false);
      });
  }, []);

  async function handleLike() {
    const profile = profiles[index];
    if (!profile) return;

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: profile.id }),
      });

      if (res.ok) {
        const data = (await res.json()) as { matched: boolean; conversationId: string | null };
        if (data.matched) {
          setMatchMsg(`Match com ${profile.username}!`);
          setTimeout(() => setMatchMsg(null), 3000);
        }
      }
    } catch {
      // Demo mode: simulate random match
      if (Math.random() > 0.5) {
        setMatchMsg(`Match com ${profile.username}!`);
        setTimeout(() => setMatchMsg(null), 3000);
      }
    }

    setIndex((i) => i + 1);
  }

  function handlePass() {
    setIndex((i) => i + 1);
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando perfis...</p>
      </main>
    );
  }

  const current = profiles[index];

  if (!current) {
    return (
      <main className="mx-auto max-w-md px-6 py-10 text-center">
        <h1 className="text-2xl font-bold">Descobrir</h1>
        <p className="mt-4 text-zinc-500">
          Sem mais perfis por agora. Volte mais tarde!
        </p>
        <Link
          href="/matches"
          className="mt-4 inline-block text-sm text-violet-600 hover:underline"
        >
          Ver seus matches
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-bold">Descobrir</h1>

      {matchMsg && (
        <div className="mt-4 animate-bounce rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 p-4 text-center shadow-lg">
          <p className="text-lg font-bold text-white">{matchMsg}</p>
          <p className="text-sm text-white/80">Vá para Matches para conversar</p>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-zinc-200 overflow-hidden">
        {/* Photo */}
        <div className="aspect-square bg-zinc-200">
          {current.photo ? (
            <img
              src={current.photo}
              alt={current.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-zinc-400">
              {current.username[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${current.username}`}
              className="text-xl font-bold hover:text-violet-600"
            >
              {current.username}
            </Link>
            {current.roleType && (
              <span className="rounded bg-violet-100 px-2 py-0.5 text-xs text-violet-800">
                {current.roleType}
              </span>
            )}
          </div>
          {current.city && (
            <p className="mt-1 text-sm text-zinc-500">{current.city}</p>
          )}
          {current.bio && (
            <p className="mt-2 text-sm text-zinc-700 line-clamp-3">{current.bio}</p>
          )}
          {current.intent.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {current.intent.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs"
                >
                  {i}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 pt-0">
          <button
            onClick={handlePass}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-300 py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Passar
          </button>
          <button
            onClick={handleLike}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 text-sm font-medium text-white shadow-md transition hover:shadow-lg active:scale-95"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            Curtir
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-400">
        {index + 1} / {profiles.length}
      </p>
    </main>
  );
}
