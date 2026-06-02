"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TrustActions } from "@/components/trust-actions";

interface PostDetail {
  id: string;
  title: string;
  content: string;
  moderationStatus: string;
  createdAt: string;
  updatedAt: string;
  author: { username: string };
  group: { id: string; name: string };
  commentCount: number;
}

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string };
}

interface CommentsResponse {
  comments: CommentItem[];
  total: number;
  page: number;
  pages: number;
}

export default function PostDetailPage() {
  const { groupId, postId } = useParams<{ groupId: string; postId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [commentsData, setCommentsData] = useState<CommentsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then((r) => r.json() as Promise<PostDetail>)
      .then(setPost)
      .catch(() => {});
  }, [postId]);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments?page=${page}`)
      .then((r) => r.json() as Promise<CommentsResponse>)
      .then(setCommentsData)
      .catch(() => {});
  }, [postId, page]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    setCommenting(true);
    setError("");

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      setNewComment("");
      // Reload comments
      const r = await fetch(`/api/posts/${postId}/comments?page=${page}`);
      setCommentsData((await r.json()) as CommentsResponse);
    } else {
      const d = (await res.json()) as { error: string };
      setError(d.error);
    }
    setCommenting(false);
  }

  if (!post) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={() => router.push(`/groups/${groupId}`)}
        className="text-sm text-violet-600 hover:underline"
      >
        &larr; Voltar ao grupo
      </button>

      <article className="mt-4">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <div className="mt-2 flex gap-3 text-sm text-zinc-500">
          <Link
            href={`/profile/${post.author.username}`}
            className="font-medium text-violet-600 hover:underline"
          >
            {post.author.username}
          </Link>
          <span>
            {new Date(post.createdAt).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="mt-4 whitespace-pre-wrap text-zinc-700">
          {post.content}
        </div>

        <TrustActions targetId={postId} targetType="post" />
      </article>

      {/* Comments */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Comentários ({post.commentCount})
        </h2>

        <form onSubmit={handleComment} className="mt-4 space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={3}
            required
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={commenting || !newComment.trim()}
            className="rounded bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {commenting ? "Enviando..." : "Comentar"}
          </button>
        </form>

        {commentsData && commentsData.comments.length > 0 && (
          <div className="mt-4 space-y-3">
            {commentsData.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Link
                    href={`/profile/${comment.author.username}`}
                    className="font-medium text-violet-600 hover:underline"
                  >
                    {comment.author.username}
                  </Link>
                  <span className="text-xs text-zinc-400">
                    {new Date(comment.createdAt).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
                  {comment.content}
                </p>
              </div>
            ))}

            {commentsData.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-zinc-500">
                  {page} / {commentsData.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(commentsData.pages, p + 1))}
                  disabled={page >= commentsData.pages}
                  className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}

        {commentsData && commentsData.comments.length === 0 && (
          <p className="mt-4 text-sm text-zinc-500">Nenhum comentário ainda.</p>
        )}
      </section>
    </main>
  );
}
