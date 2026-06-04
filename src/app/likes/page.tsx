"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ReceivedLike {
  createdAt: string;
  superLike: boolean;
  note: string | null;
  user: {
    id: string;
    username: string | null;
    city: string | null;
    roleType: string | null;
    photo: string | null;
  };
}

export default function LikesReceivedPage() {
  const [likes, setLikes] = useState<ReceivedLike[]>([]);
  const [premium, setPremium] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/likes/received")
      .then((r) => r.json() as Promise<{ premium: boolean; count: number; likes: ReceivedLike[] }>)
      .then((data) => {
        setPremium(data.premium);
        setCount(data.count);
        setLikes(data.likes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <div className="skeleton h-8 w-48" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 w-full rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quem me curtiu</h1>
        <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-700">
          {count}
        </span>
      </div>

      {!premium && count > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-orange-950/20">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
            </svg>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              {count} pessoa{count > 1 ? "s" : ""} curtiu seu perfil
            </p>
          </div>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            Assine Plus para ver quem te curtiu e dar match mais rapido.
          </p>
          <Link
            href="/premium"
            className="mt-3 inline-block rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow hover:shadow-md"
          >
            Ver com Plus
          </Link>
        </div>
      )}

      {likes.length === 0 && (
        <div className="mt-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
            <svg className="h-10 w-10 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.502-4.688-4.502-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.748 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <p className="mt-4 text-zinc-500">Ninguem te curtiu ainda.</p>
          <p className="mt-1 text-xs text-zinc-400">Complete seu perfil para atrair mais curtidas!</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {likes.map((like, i) => (
          <div
            key={i}
            className={`relative flex items-center gap-3 rounded-xl border p-3 transition ${
              like.superLike
                ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-950/10"
                : "border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {/* Photo */}
            <div className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl ${!premium ? "select-none" : ""}`}>
              {like.user.photo ? (
                <Image
                  src={like.user.photo}
                  alt=""
                  fill
                  className={`object-cover ${!premium ? "blur-lg scale-110" : ""}`}
                  unoptimized
                />
              ) : (
                <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-200 to-pink-200 text-lg font-bold text-violet-500 ${!premium ? "blur-lg" : ""}`}>
                  {like.user.username?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              {!premium && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {premium && like.user.username ? (
                  <Link href={`/profile/${like.user.username}`} className="text-sm font-semibold hover:text-violet-600">
                    {like.user.username}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-zinc-400">Perfil oculto</span>
                )}
                {like.superLike && (
                  <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                    </svg>
                    Super
                  </span>
                )}
              </div>
              {premium && like.user.city && (
                <p className="text-xs text-zinc-500">{like.user.city}</p>
              )}
              {like.note && premium && (
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 italic">&quot;{like.note}&quot;</p>
              )}
              <p className="text-[10px] text-zinc-400">
                {new Date(like.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
