"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface MessageItem {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { username: string };
}

interface ConversationData {
  conversationId: string;
  otherUser: { id: string; username: string };
  messages: MessageItem[];
  total: number;
}

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [data, setData] = useState<ConversationData | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function loadConversation() {
    const res = await fetch(`/api/conversations/${conversationId}`);
    if (res.ok) {
      setData((await res.json()) as ConversationData);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch sets state in callback
    void loadConversation();

    // Poll for new messages every 5 seconds
    const interval = setInterval(loadConversation, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError("");

    const res = await fetch(
      `/api/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      },
    );

    if (res.ok) {
      setNewMessage("");
      await loadConversation();
    } else {
      const d = (await res.json()) as { error: string };
      setError(d.error);
    }
    setSending(false);
  }

  if (!data) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando conversa...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col px-6 py-6" style={{ height: "calc(100vh - 2rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
        <Link
          href="/matches"
          className="text-sm text-violet-600 hover:underline"
        >
          &larr;
        </Link>
        <Link
          href={`/profile/${data.otherUser.username}`}
          className="font-medium hover:text-violet-600"
        >
          {data.otherUser.username}
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {data.messages.length === 0 && (
          <p className="text-center text-sm text-zinc-400">
            Nenhuma mensagem ainda. Diga olá!
          </p>
        )}

        {data.messages.map((msg) => {
          const isMe = msg.senderId !== data.otherUser.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-100 text-zinc-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`mt-1 text-xs ${
                    isMe ? "text-violet-200" : "text-zinc-400"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 border-t border-zinc-200 pt-3">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none"
          maxLength={5000}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {sending ? "..." : "Enviar"}
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </main>
  );
}
