"use client";

import { useEffect, useState } from "react";

type NotificationType = "new_match" | "new_message" | "event_reminder" | "like_received";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

const PREVIEW_NOTIFICATIONS: Notification[] = [
  {
    id: "preview-1",
    type: "new_match",
    title: "Novo match!",
    description: "Voce e Luna fizeram match. Comece uma conversa!",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
  },
  {
    id: "preview-2",
    type: "new_message",
    title: "Nova mensagem",
    description: "Kai enviou uma mensagem: \"Oi, tudo bem?\"",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
  },
  {
    id: "preview-3",
    type: "event_reminder",
    title: "Evento amanha",
    description: "Munch SP acontece amanha as 19h. Nao esqueca!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: "preview-4",
    type: "like_received",
    title: "Alguem curtiu voce",
    description: "Uma pessoa curtiu seu perfil. Descubra quem!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
  {
    id: "preview-5",
    type: "new_match",
    title: "Novo match!",
    description: "Voce e Ariel fizeram match.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: "preview-6",
    type: "new_message",
    title: "Nova mensagem",
    description: "Sol enviou uma foto.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
  },
];

const TYPE_CONFIG: Record<NotificationType, { icon: string; color: string; bg: string }> = {
  new_match: {
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    color: "text-pink-500",
    bg: "bg-pink-100 dark:bg-pink-900/30",
  },
  new_message: {
    icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
    color: "text-violet-500",
    bg: "bg-violet-100 dark:bg-violet-900/30",
  },
  event_reminder: {
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  like_received: {
    icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ notifications: Notification[] }>;
      })
      .then((d) => {
        setNotifications(d.notifications);
        setLoading(false);
      })
      .catch(() => {
        setNotifications(PREVIEW_NOTIFICATIONS);
        setLoading(false);
      });
  }, []);

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    }).catch(() => {
      /* silently ignore — UI already updated */
    });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-6 py-10">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton mt-2 h-4 w-32" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-48" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificacoes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {unreadCount > 0
              ? `${unreadCount} nao lida${unreadCount > 1 ? "s" : ""}`
              : "Tudo em dia"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="mt-16 text-center" style={{ animation: "slide-up 0.5s ease-out" }}>
          <div className="relative mx-auto h-28 w-28">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-200 to-pink-200 opacity-50 blur-xl" />
            <div className="animate-float relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-pink-100">
              <svg
                className="h-14 w-14 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </div>
            {/* Sparkles */}
            <svg
              className="animate-float-delayed absolute -right-2 -top-1 h-5 w-5 text-pink-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <svg
              className="animate-float absolute -left-3 top-3 h-4 w-4 text-violet-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <svg
              className="animate-float-delayed absolute -bottom-1 right-2 h-3 w-3 text-amber-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <p className="mt-5 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
            Nenhuma notificacao
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Quando algo acontecer, voce vera aqui
          </p>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-6 space-y-3">
          {notifications.map((n, idx) => {
            const config = TYPE_CONFIG[n.type];
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-xl border p-4 transition hover:shadow-sm animate-card-enter${idx > 0 && idx <= 4 ? `-${idx}` : ""} ${
                  n.read
                    ? "border-zinc-200 dark:border-zinc-700"
                    : "border-l-4 border-violet-400 border-t-zinc-200 border-r-zinc-200 border-b-zinc-200 dark:border-t-zinc-700 dark:border-r-zinc-700 dark:border-b-zinc-700"
                }`}
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${config.bg}`}
                >
                  <svg
                    className={`h-5 w-5 ${config.color}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        n.read
                          ? "text-zinc-600 dark:text-zinc-400"
                          : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {n.title}
                    </p>
                    <span className="flex-shrink-0 text-xs text-zinc-400">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {n.description}
                  </p>
                </div>
                {!n.read && (
                  <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-violet-500" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
