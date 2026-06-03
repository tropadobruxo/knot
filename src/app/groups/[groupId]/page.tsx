"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface MemberItem {
  role: string;
  joinedAt: string;
  user: { username: string; image: string | null; lastActive: string | null };
}

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  moderated: boolean;
  memberCount: number;
  postCount: number;
  members: MemberItem[];
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

interface ChatMsg {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; username: string; image: string | null };
}

type GroupTab = "posts" | "chat" | "members";

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
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [now] = useState(() => Date.now());
  const [activeTab, setActiveTab] = useState<GroupTab>("posts");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const loadChat = useCallback(() => {
    fetch(`/api/groups/${groupId}/chat`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ messages: ChatMsg[] }>;
      })
      .then((d) => {
        setChatMessages(d.messages);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .catch(() => {});
  }, [groupId]);

  useEffect(() => {
    if (activeTab !== "chat") {
      if (chatPollRef.current) clearInterval(chatPollRef.current);
      return;
    }
    loadChat();
    chatPollRef.current = setInterval(loadChat, 5000);
    return () => { if (chatPollRef.current) clearInterval(chatPollRef.current); };
  }, [activeTab, loadChat]);

  async function handleChatSend(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || chatSending) return;
    setChatSending(true);
    const res = await fetch(`/api/groups/${groupId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: chatInput.trim() }),
    });
    if (res.ok) {
      const msg = (await res.json()) as ChatMsg;
      setChatMessages((prev) => [...prev, msg]);
      setChatInput("");
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
    setChatSending(false);
  }

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

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-zinc-200">
        {(["posts", "chat", "members"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "border-b-2 border-violet-600 text-violet-600"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {tab === "posts" ? "Posts" : tab === "chat" ? "Chat" : "Membros"}
          </button>
        ))}
      </div>

      {/* Group Chat */}
      {activeTab === "chat" && (
        <div className="mt-4">
          <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-700" style={{ height: "400px" }}>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {chatMessages.length === 0 && (
                <p className="py-10 text-center text-sm text-zinc-400">Nenhuma mensagem ainda. Inicie a conversa!</p>
              )}
              {chatMessages.map((msg) => (
                <div key={msg.id} className="mb-2 flex gap-2">
                  <Link href={`/profile/${msg.sender.username}`} className="flex-shrink-0">
                    {msg.sender.image ? (
                      <Image src={msg.sender.image} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" unoptimized />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                        {msg.sender.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <Link href={`/profile/${msg.sender.username}`} className="text-xs font-semibold hover:text-violet-600">
                        {msg.sender.username}
                      </Link>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleChatSend} className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-700">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Mensagem para o grupo..."
                maxLength={5000}
                className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
              <button
                type="submit"
                disabled={chatSending || !chatInput.trim()}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-40"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Members */}
      {activeTab === "members" && (
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-500">
            Membros ({group.memberCount})
          </h3>
          {group.members.length > 6 && (
            <button
              onClick={() => setShowAllMembers(!showAllMembers)}
              className="text-xs font-medium text-violet-600 hover:underline"
            >
              {showAllMembers ? "Mostrar menos" : "Ver todos"}
            </button>
          )}
        </div>

        {showAllMembers && group.members.length > 6 && (
          <input
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder="Buscar membro..."
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-800"
          />
        )}

        <div className="mt-3 space-y-2">
          {(showAllMembers ? group.members : group.members.slice(0, 6))
            .filter((m) => !memberSearch || m.user.username.toLowerCase().includes(memberSearch.toLowerCase()))
            .map((m) => {
              const isOnline = m.user.lastActive
                ? now - new Date(m.user.lastActive).getTime() < 5 * 60 * 1000
                : false;
              return (
                <Link
                  key={m.user.username}
                  href={`/profile/${m.user.username}`}
                  className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <div className="relative flex-shrink-0">
                    {m.user.image ? (
                      <Image
                        src={m.user.image}
                        alt={m.user.username}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                        unoptimized={m.user.image.includes("dicebear") || m.user.image.includes("randomuser")}
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-700">
                        {m.user.username[0]?.toUpperCase()}
                      </div>
                    )}
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400 dark:border-zinc-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{m.user.username}</span>
                      {m.role === "admin" && (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">Admin</span>
                      )}
                      {m.role === "moderator" && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Mod</span>
                      )}
                      {isOnline && (
                        <span className="text-[10px] font-medium text-green-500">online</span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400">
                      Entrou em{" "}
                      {new Date(m.joinedAt).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
      )}

      {/* Posts tab */}
      {activeTab === "posts" && (<>
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
      </>)}
    </main>
  );
}
