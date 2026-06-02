"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useChatStream } from "@/lib/messaging/use-chat-stream";
import { DEMO_MESSAGES } from "@/lib/demo-data";

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [otherUser, setOtherUser] = useState<{ id: string; username: string } | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [demoMessages, setDemoMessages] = useState(DEMO_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isConnected, addOptimistic } = useChatStream(conversationId);

  // Load conversation metadata
  useEffect(() => {
    fetch(`/api/conversations/${conversationId}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ otherUser: { id: string; username: string } }>;
      })
      .then((data) => setOtherUser(data.otherUser))
      .catch(() => {
        setDemoMode(true);
        setOtherUser({ id: "demo-2", username: "kai_switch" });
      });
  }, [conversationId]);

  // Auto-scroll on new messages
  const displayMessages = demoMode ? demoMessages : messages;
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError("");

    if (demoMode) {
      setDemoMessages((prev) => [
        ...prev,
        {
          id: `demo-${Date.now()}`,
          content: newMessage,
          createdAt: new Date().toISOString(),
          senderId: "demo-me",
          sender: { username: "você" },
        },
      ]);
      setNewMessage("");
      setSending(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newMessage }),
        },
      );

      if (res.ok) {
        const msg = (await res.json()) as {
          id: string;
          content: string;
          createdAt: string;
          sender: { username: string };
        };
        addOptimistic({ ...msg, senderId: "me" });
        setNewMessage("");
      } else {
        setError("Falha ao enviar.");
      }
    } catch {
      setError("Erro de conexão.");
    }

    setSending(false);
  }

  if (!otherUser) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          <p className="text-sm text-zinc-500">Carregando conversa...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col px-4 py-4 sm:px-6" style={{ height: "calc(100vh - 3.5rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3">
        <Link href="/matches" className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <Link
          href={`/profile/${otherUser.username}`}
          className="flex items-center gap-2 font-semibold hover:text-violet-600"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
            {otherUser.username[0]?.toUpperCase()}
          </div>
          {otherUser.username}
        </Link>
        {!demoMode && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-400" : "bg-zinc-300"}`} />
            <span className="text-xs text-zinc-400">{isConnected ? "Online" : "Offline"}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="chat-scroll mt-3 flex-1 overflow-y-auto rounded-xl px-2 py-4">
        {displayMessages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
              <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500">Nenhuma mensagem ainda.</p>
            <p className="text-xs text-zinc-400">Diga olá!</p>
          </div>
        )}

        {displayMessages.map((msg, idx) => {
          const isMe = otherUser ? msg.senderId !== otherUser.id : false;
          const showTime = idx === 0 ||
            new Date(msg.createdAt).getTime() - new Date(displayMessages[idx - 1]!.createdAt).getTime() > 300000;

          return (
            <div key={msg.id}>
              {showTime && (
                <p className="my-3 text-center text-xs text-zinc-400">
                  {new Date(msg.createdAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              <div className={`mb-1 flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 ${
                    isMe
                      ? "rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-sm"
                      : "rounded-2xl rounded-bl-md bg-zinc-100 text-zinc-800"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-2 flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
          maxLength={5000}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-md transition hover:shadow-lg active:scale-95 disabled:opacity-40"
        >
          {sending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          )}
        </button>
      </form>
      {error && (
        <p className="mt-1 text-center text-xs text-red-500">{error}</p>
      )}
    </main>
  );
}
