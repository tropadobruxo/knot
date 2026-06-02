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
        // Demo fallback
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
        <p className="text-zinc-500">Carregando conversa...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col px-6 py-6" style={{ height: "calc(100vh - 2rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
        <Link href="/matches" className="text-sm text-violet-600 hover:underline">
          &larr;
        </Link>
        <Link
          href={`/profile/${otherUser.username}`}
          className="font-medium hover:text-violet-600"
        >
          {otherUser.username}
        </Link>
        {!demoMode && (
          <span className={`ml-auto h-2 w-2 rounded-full ${isConnected ? "bg-green-400" : "bg-zinc-300"}`} />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {displayMessages.length === 0 && (
          <p className="text-center text-sm text-zinc-400">
            Nenhuma mensagem ainda. Diga olá!
          </p>
        )}

        {displayMessages.map((msg) => {
          const isMe = otherUser ? msg.senderId !== otherUser.id : false;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe ? "bg-violet-600 text-white" : "bg-zinc-100 text-zinc-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`mt-1 text-xs ${isMe ? "text-violet-200" : "text-zinc-400"}`}>
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
