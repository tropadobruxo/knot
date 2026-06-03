"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useChatStream, type ReactionGroup } from "@/lib/messaging/use-chat-stream";

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [otherUser, setOtherUser] = useState<{ id: string; username: string } | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, isConnected, addOptimistic, updateReactions } = useChatStream(conversationId);
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);
  const [panicDone, setPanicDone] = useState(false);
  const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "🔥", "👍"];

  // Send typing indicator
  const sendTypingSignal = useCallback(() => {
    if (demoMode) return;
    fetch(`/api/conversations/${conversationId}/typing`, { method: "POST" }).catch(() => {});
  }, [conversationId, demoMode]);

  async function handlePanic() {
    const res = await fetch(`/api/conversations/${conversationId}/panic`, { method: "POST" });
    if (res.ok) {
      setPanicDone(true);
      setShowPanicConfirm(false);
    }
  }

  function handleInputChange(value: string) {
    setNewMessage(value);
    sendTypingSignal();
  }

  // Toggle emoji reaction on a message
  async function toggleReaction(messageId: string, emoji: string) {
    setActiveReactionMenu(null);
    if (demoMode) return;
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages/${messageId}/reactions`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emoji }) },
      );
      if (res.ok) {
        // Refresh reactions for this message from the full conversation
        const convRes = await fetch(`/api/conversations/${conversationId}`);
        if (convRes.ok) {
          const data = (await convRes.json()) as { messages: { id: string; reactions: ReactionGroup[] }[] };
          const updated = data.messages.find((m) => m.id === messageId);
          if (updated) updateReactions(messageId, updated.reactions);
        }
      }
    } catch { /* ignore */ }
  }

  // Poll typing status from other user
  useEffect(() => {
    if (demoMode) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/typing`);
        if (res.ok) {
          const data = (await res.json()) as { typing: boolean };
          setOtherTyping(data.typing);
          if (data.typing) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 4000);
          }
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [conversationId, demoMode]);

  // Mark messages as read
  useEffect(() => {
    if (demoMode || messages.length === 0) return;
    fetch(`/api/conversations/${conversationId}/read`, { method: "POST" }).catch(() => {});
  }, [conversationId, demoMode, messages.length]);

  // Handle image selection
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("Imagem deve ter no maximo 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  // Audio recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      setError("Nao foi possivel acessar o microfone.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function cancelAudio() {
    setAudioBlob(null);
    setRecordingTime(0);
  }

  async function sendAudio() {
    if (!audioBlob) return;
    setSending(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: dataUrl }),
      });
      if (res.ok) {
        const msg = (await res.json()) as { id: string; content: string; createdAt: string; sender: { username: string } };
        addOptimistic({ ...msg, senderId: "me" });
        setAudioBlob(null);
        setRecordingTime(0);
      }
      setSending(false);
    };
    reader.readAsDataURL(audioBlob);
  }

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
  const displayMessages = messages;
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = imagePreview ?? newMessage.trim();
    if (!content) return;

    setSending(true);
    setError("");

    if (demoMode) {
      setSending(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
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
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setError("Falha ao enviar.");
      }
    } catch {
      setError("Erro de conexao.");
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
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-400" : "bg-zinc-300"}`} />
              <span className="text-xs text-zinc-400">{isConnected ? "Online" : "Offline"}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPanicConfirm(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-500 transition hover:bg-red-200"
              title="Safe word — emergencia"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Safe word confirmation modal */}
      {showPanicConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Safe Word</h3>
                <p className="text-sm text-zinc-500">Acao de emergencia</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Isso ira imediatamente:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 008.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>
                Bloquear esta pessoa
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                Enviar denuncia com contexto da conversa
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                Proteger voce de contato futuro
              </li>
            </ul>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPanicConfirm(false)}
                className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                onClick={handlePanic}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Ativar Safe Word
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panic done confirmation */}
      {panicDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-zinc-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold">Voce esta protegido(a)</h3>
            <p className="mt-2 text-sm text-zinc-500">
              A pessoa foi bloqueada e a denuncia enviada com o contexto da conversa. Nossa equipe ira analisar.
            </p>
            <Link
              href="/matches"
              className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              Voltar para matches
            </Link>
          </div>
        </div>
      )}

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
              <div className={`group/msg mb-1 flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className="relative max-w-[75%]">
                  <div
                    className={`px-4 py-2.5 ${
                      isMe
                        ? "rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-sm"
                        : "rounded-2xl rounded-bl-md bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100"
                    }`}
                  >
                    {msg.content.startsWith("data:audio/") ? (
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                        <audio src={msg.content} controls className="h-8 max-w-[200px]" preload="metadata" />
                      </div>
                    ) : msg.content.startsWith("data:image/") || (msg.content.startsWith("https://") && /\.(jpg|jpeg|png|gif|webp)/i.test(msg.content)) ? (
                      <div className="relative h-48 w-48 overflow-hidden rounded-lg">
                        <Image src={msg.content} alt="Imagem" fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                    {isMe && (
                      <div className="mt-0.5 flex justify-end">
                        <svg className={`h-3.5 w-3.5 ${idx === displayMessages.length - 1 ? "text-blue-300" : "text-white/50"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Reaction button */}
                  <button
                    type="button"
                    onClick={() => setActiveReactionMenu(activeReactionMenu === msg.id ? null : msg.id)}
                    className={`absolute ${isMe ? "-left-7" : "-right-7"} top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-zinc-400 opacity-0 shadow-sm transition hover:text-violet-500 group-hover/msg:opacity-100 dark:bg-zinc-800`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                    </svg>
                  </button>
                  {/* Emoji picker popup */}
                  {activeReactionMenu === msg.id && (
                    <div className={`absolute ${isMe ? "right-0" : "left-0"} -top-10 z-10 flex gap-1 rounded-full bg-white px-2 py-1 shadow-lg dark:bg-zinc-800`}>
                      {REACTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className="rounded-full px-1 text-lg transition hover:scale-125 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Display existing reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className={`mt-0.5 flex flex-wrap gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                      {msg.reactions.map((r) => (
                        <button
                          key={r.emoji}
                          type="button"
                          onClick={() => toggleReaction(msg.id, r.emoji)}
                          className="flex items-center gap-0.5 rounded-full border border-zinc-200 bg-white px-1.5 py-0.5 text-xs shadow-sm transition hover:border-violet-300 dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          <span>{r.emoji}</span>
                          <span className="text-zinc-500">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {/* Typing indicator */}
        {otherTyping && (
          <div className="mb-1 flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-zinc-100 px-4 py-3 dark:bg-zinc-700">
              <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Audio preview */}
      {audioBlob && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
          <svg className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
          <audio src={URL.createObjectURL(audioBlob)} controls className="h-8 flex-1" preload="metadata" />
          <span className="text-xs text-zinc-500">{recordingTime}s</span>
          <button
            type="button"
            onClick={sendAudio}
            disabled={sending}
            className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-40"
          >
            Enviar
          </button>
          <button type="button" onClick={cancelAudio} className="text-zinc-400 hover:text-zinc-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Recording indicator */}
      {recording && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2 dark:border-red-800/30 dark:bg-red-950/30">
          <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          <span className="flex-1 text-xs font-medium text-red-600">Gravando... {recordingTime}s</span>
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
          >
            Parar
          </button>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="relative h-16 w-16 overflow-hidden rounded-lg">
            <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
          </div>
          <span className="flex-1 text-xs text-zinc-500">Imagem anexada</span>
          <button
            type="button"
            onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
            className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="mt-2 flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleImageSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 transition hover:bg-zinc-50 hover:text-violet-500 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border transition ${
            recording
              ? "border-red-300 bg-red-50 text-red-500 hover:bg-red-100"
              : "border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:text-violet-500 dark:border-zinc-700 dark:hover:bg-zinc-800"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </button>
        <input
          value={newMessage}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:bg-zinc-700"
          maxLength={5000}
        />
        <button
          type="submit"
          disabled={sending || (!newMessage.trim() && !imagePreview)}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-md transition hover:shadow-lg active:scale-95 disabled:opacity-40"
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
