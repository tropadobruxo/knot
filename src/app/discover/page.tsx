"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      .then((r) => r.json() as Promise<{ profiles: Profile[] }>)
      .then((d) => {
        setProfiles(d.profiles);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleLike() {
    const profile = profiles[index];
    if (!profile) return;

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
        <div className="mt-4 rounded-lg bg-green-100 p-3 text-center font-medium text-green-800">
          {matchMsg}
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
        <div className="flex border-t border-zinc-200">
          <button
            onClick={handlePass}
            className="flex-1 py-3 text-sm font-medium text-zinc-500 hover:bg-zinc-50"
          >
            Passar
          </button>
          <button
            onClick={handleLike}
            className="flex-1 border-l border-zinc-200 py-3 text-sm font-medium text-violet-600 hover:bg-violet-50"
          >
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
