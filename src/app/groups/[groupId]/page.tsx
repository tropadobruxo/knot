"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  moderated: boolean;
  memberCount: number;
  postCount: number;
  members: { role: string; user: { username: string } }[];
}

interface PostItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { username: string };
  commentCount: number;
}

interface PostsResponse {
  posts: PostItem[];
  total: number;
  page: number;
  pages: number;
}

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [postsData, setPostsData] = useState<PostsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [joining, setJoining] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", content: "" });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/groups/${groupId}`)
      .then((r) => r.json() as Promise<GroupDetail>)
      .then(setGroup)
      .catch(() => {});
  }, [groupId]);

  useEffect(() => {
    fetch(`/api/groups/${groupId}/posts?page=${page}`)
      .then((r) => r.json() as Promise<PostsResponse>)
      .then(setPostsData)
      .catch(() => {});
  }, [groupId, page]);

  async function handleJoin() {
    setJoining(true);
    await fetch(`/api/groups/${groupId}/members`, { method: "POST" });
    // Reload group
    const r = await fetch(`/api/groups/${groupId}`);
    setGroup((await r.json()) as GroupDetail);
    setJoining(false);
  }

  async function handleLeave() {
    if (!confirm("Sair do grupo?")) return;
    setJoining(true);
    await fetch(`/api/groups/${groupId}/members`, { method: "DELETE" });
    const r = await fetch(`/api/groups/${groupId}`);
    setGroup((await r.json()) as GroupDetail);
    setJoining(false);
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    setError("");

    const res = await fetch(`/api/groups/${groupId}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postForm),
    });

    if (res.ok) {
      setShowNewPost(false);
      setPostForm({ title: "", content: "" });
      // Reload posts
      const r = await fetch(`/api/groups/${groupId}/posts?page=1`);
      setPostsData((await r.json()) as PostsResponse);
      setPage(1);
    } else {
      const d = (await res.json()) as { error: string };
      setError(d.error);
    }
    setPosting(false);
  }

  if (!group) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={() => router.back()}
        className="text-sm text-violet-600 hover:underline"
      >
        &larr; Voltar
      </button>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <div className="mt-1 flex gap-3 text-sm text-zinc-500">
            {group.city && <span>{group.city}</span>}
            <span>{group.memberCount} membros</span>
            <span>{group.postCount} posts</span>
            {group.moderated && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                Moderado
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            Participar
          </button>
          <button
            onClick={handleLeave}
            disabled={joining}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
          >
            Sair
          </button>
        </div>
      </div>

      {group.description && (
        <p className="mt-4 text-zinc-700">{group.description}</p>
      )}

      {/* Members */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-zinc-500">Membros</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {group.members.map((m) => (
            <Link
              key={m.user.username}
              href={`/profile/${m.user.username}`}
              className="rounded-full bg-zinc-100 px-3 py-1 text-sm hover:bg-zinc-200"
            >
              {m.user.username}
              {m.role !== "member" && (
                <span className="ml-1 text-xs text-violet-600">({m.role})</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* New post */}
      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Posts</h3>
        <button
          onClick={() => setShowNewPost(!showNewPost)}
          className="rounded bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
        >
          {showNewPost ? "Cancelar" : "Novo post"}
        </button>
      </div>

      {showNewPost && (
        <form onSubmit={handlePost} className="mt-3 space-y-3 rounded-lg border border-zinc-200 p-4">
          <div>
            <label className="block text-sm font-medium">Título *</label>
            <input
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              required
              minLength={3}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Conteúdo *</label>
            <textarea
              value={postForm.content}
              onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
              required
              rows={4}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={posting}
            className="rounded bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {posting ? "Publicando..." : "Publicar"}
          </button>
          {group.moderated && (
            <p className="text-xs text-zinc-400">
              Posts neste grupo são moderados e podem aguardar aprovação.
            </p>
          )}
        </form>
      )}

      {/* Posts list */}
      {postsData && postsData.posts.length === 0 && (
        <p className="mt-4 text-zinc-500">Nenhum post ainda.</p>
      )}

      {postsData && postsData.posts.length > 0 && (
        <div className="mt-4 space-y-3">
          {postsData.posts.map((post) => (
            <Link
              key={post.id}
              href={`/groups/${groupId}/posts/${post.id}`}
              className="block rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
            >
              <h4 className="font-medium">{post.title}</h4>
              <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{post.content}</p>
              <div className="mt-2 flex gap-3 text-xs text-zinc-400">
                <span>{post.author.username}</span>
                <span>
                  {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span>{post.commentCount} comentários</span>
              </div>
            </Link>
          ))}

          {postsData.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-zinc-500">{page} / {postsData.pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(postsData.pages, p + 1))}
                disabled={page >= postsData.pages}
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
