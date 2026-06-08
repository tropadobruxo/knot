"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface StoryItem {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  expiresAt: string;
  author: { id: string; username: string; image: string | null };
}

interface StoryGroup {
  user: { id: string; username: string; image: string | null };
  stories: StoryItem[];
}

function timeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "expirado";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h`;
  return `${mins}min`;
}

export default function StoriesPage() {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [activeStory, setActiveStory] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ storyGroups: StoryGroup[] }>;
      })
      .then((d) => {
        setGroups(d.storyGroups);
        setLoading(false);
      })
      .catch(() => {
        setGroups([]);
        setLoading(false);
      });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setCreating(true);

    const res = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });

    if (res.ok) {
      setContent("");
      setShowCreate(false);
      // Reload stories
      const r = await fetch("/api/stories");
      if (r.ok) {
        const d = (await r.json()) as { storyGroups: StoryGroup[] };
        setGroups(d.storyGroups);
      }
    }
    setCreating(false);
  }

  function openStory(groupIdx: number) {
    setActiveGroup(groupIdx);
    setActiveStory(0);
  }

  function nextStory() {
    if (activeGroup === null) return;
    const group = groups[activeGroup];
    if (!group) return;

    if (activeStory < group.stories.length - 1) {
      setActiveStory((s) => s + 1);
    } else if (activeGroup < groups.length - 1) {
      setActiveGroup((g) => (g ?? 0) + 1);
      setActiveStory(0);
    } else {
      setActiveGroup(null);
    }
  }

  function prevStory() {
    if (activeGroup === null) return;
    if (activeStory > 0) {
      setActiveStory((s) => s - 1);
    } else if (activeGroup > 0) {
      setActiveGroup((g) => (g ?? 1) - 1);
      const prevGroup = groups[(activeGroup ?? 1) - 1];
      setActiveStory(prevGroup ? prevGroup.stories.length - 1 : 0);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-6 py-10">
        <div className="skeleton h-8 w-32" />
        <div className="mt-4 flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="skeleton h-16 w-16 rounded-full" />
              <div className="skeleton h-3 w-12" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  // Story viewer overlay
  if (activeGroup !== null) {
    const group = groups[activeGroup];
    if (!group) return null;
    const story = group.stories[activeStory];
    if (!story) return null;

    return (
      <div className="fixed inset-0 z-[100] bg-black">
        {/* Progress bars */}
        <div className="absolute left-0 right-0 top-0 z-10 flex gap-1 p-2">
          {group.stories.map((_, idx) => (
            <div key={idx} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className={`h-full rounded-full bg-white transition-all duration-300 ${idx < activeStory ? "w-full" : idx === activeStory ? "w-full" : "w-0"}`}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute left-0 right-0 top-4 z-10 flex items-center justify-between px-4 pt-2">
          <Link href={`/profile/${group.user.username}`} className="flex items-center gap-2">
            {group.user.image ? (
              <Image
                src={group.user.image}
                alt={group.user.username}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
                unoptimized={group.user.image.includes("dicebear") || group.user.image.includes("randomuser")}
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                {group.user.username[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-white">{group.user.username}</span>
            <span className="text-xs text-white/60">{timeRemaining(story.expiresAt)}</span>
          </Link>
          <button
            onClick={() => setActiveGroup(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Story content */}
        <div className="flex h-full items-center justify-center px-8">
          {story.imageUrl && (
            <Image
              src={story.imageUrl}
              alt=""
              fill
              className="object-cover opacity-40"
              unoptimized
            />
          )}
          <p className="relative z-10 max-w-md text-center text-xl font-medium leading-relaxed text-white">
            {story.content}
          </p>
        </div>

        {/* Tap zones */}
        <button
          onClick={prevStory}
          className="absolute bottom-0 left-0 top-0 w-1/3"
          aria-label="Anterior"
        />
        <button
          onClick={nextStory}
          className="absolute bottom-0 right-0 top-0 w-1/3"
          aria-label="Proximo"
        />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Moments</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 active:scale-[0.97]"
        >
          {showCreate ? "Cancelar" : "Novo moment"}
        </button>
      </div>
      <p className="mt-1 text-sm text-zinc-500">Conteudo efemero — desaparece em 24h</p>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="mt-4 space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Compartilhe um momento..."
            maxLength={500}
            rows={3}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-zinc-600 dark:bg-zinc-800"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">{content.length}/500</span>
            <button
              type="submit"
              disabled={creating || !content.trim()}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {creating ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </form>
      )}

      {/* Story circles */}
      {groups.length > 0 && (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {groups.map((group, idx) => (
            <button
              key={group.user.id}
              onClick={() => openStory(idx)}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="rounded-full bg-violet-600 p-0.5">
                {group.user.image ? (
                  <Image
                    src={group.user.image}
                    alt={group.user.username}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full border-2 border-white object-cover dark:border-zinc-900"
                    unoptimized={group.user.image.includes("dicebear") || group.user.image.includes("randomuser")}
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-violet-100 text-lg font-bold text-violet-700 dark:border-zinc-900">
                    {group.user.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <span className="max-w-16 truncate text-xs text-zinc-600 dark:text-zinc-400">
                {group.user.username}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {groups.length === 0 && !showCreate && (
        <div className="mt-12 text-center" style={{ animation: "slide-up 0.5s ease-out" }}>
          <div className="relative mx-auto h-28 w-28">
            <div className="absolute inset-0 rounded-full bg-zinc-200 opacity-40 blur-xl dark:bg-zinc-700" />
            <div className="animate-float relative flex h-28 w-28 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800/80">
              <svg className="h-14 w-14 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-5 text-lg font-semibold text-zinc-700 dark:text-zinc-300">Nenhum moment ativo</p>
          <p className="mt-1 text-sm text-zinc-400">Compartilhe algo — desaparece em 24h</p>
        </div>
      )}

      {/* Timeline of recent stories */}
      {groups.length > 0 && (
        <div className="mt-6 space-y-3">
          {groups.map((group) =>
            group.stories.map((story) => (
              <div
                key={story.id}
                className="rounded-xl border border-zinc-200 p-4 transition hover:border-violet-200 dark:border-zinc-700"
              >
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${group.user.username}`} className="flex items-center gap-2">
                    {group.user.image ? (
                      <Image
                        src={group.user.image}
                        alt={group.user.username}
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-cover"
                        unoptimized={group.user.image.includes("dicebear") || group.user.image.includes("randomuser")}
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                        {group.user.username[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium hover:text-violet-600">{group.user.username}</span>
                  </Link>
                  <span className="ml-auto flex items-center gap-1 text-xs text-zinc-400">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {timeRemaining(story.expiresAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{story.content}</p>
              </div>
            )),
          )}
        </div>
      )}
    </main>
  );
}
