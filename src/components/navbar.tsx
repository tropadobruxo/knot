"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useUnreadCount } from "@/lib/hooks/use-unread-count";

const NAV_ITEMS = [
  { href: "/discover",      label: "Descobrir" },
  { href: "/matches",       label: "Matches",   badge: true },
  { href: "/groups",        label: "Grupos" },
  { href: "/events",        label: "Eventos" },
  { href: "/stories",       label: "Moments" },
  { href: "/search",        label: "Buscar" },
  { href: "/notifications", label: "Avisos" },
  { href: "/profile/edit",  label: "Perfil" },
];

const BOTTOM_NAV = [
  {
    href: "/discover",
    label: "Descobrir",
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  },
  {
    href: "/events",
    label: "Eventos",
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  },
  {
    href: "/matches",
    label: "Chat",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    badge: true,
  },
  {
    href: "/groups",
    label: "Grupos",
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  },
  {
    href: "/profile/edit",
    label: "Perfil",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const unreadCount = useUnreadCount();

  if (["/welcome", "/verify", "/onboarding"].includes(pathname)) return null;
  if (pathname.startsWith("/chat/")) return null;

  function UnreadBadge({ show }: { show: boolean }) {
    if (!show) return null;
    return (
      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[9px] font-bold leading-none text-white">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    );
  }

  return (
    <>
      {/* ── Desktop top nav ── */}
      <nav className="sticky top-0 z-50 hidden border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sm:block dark:border-zinc-800/60 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">

          {/* Wordmark */}
          <Link
            href="/"
            className="text-lg font-black tracking-[-0.04em] text-zinc-900 transition hover:opacity-70 dark:text-zinc-50"
          >
            Knot
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
                    active
                      ? "text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300"
                  }`}
                >
                  {item.label}
                  {"badge" in item && item.badge && (
                    <UnreadBadge show={unreadCount > 0} />
                  )}
                  {active && (
                    <span className="absolute inset-x-2 bottom-0.5 h-px rounded-full bg-zinc-900 dark:bg-zinc-50" />
                  )}
                </Link>
              );
            })}
            <div className="ml-1">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile top bar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-200/80 bg-white/80 px-5 py-3 backdrop-blur-md sm:hidden dark:border-zinc-800/60 dark:bg-zinc-950/80">
        <Link
          href="/"
          className="text-lg font-black tracking-[-0.04em] text-zinc-900 dark:text-zinc-50"
        >
          Knot
        </Link>
        <ThemeToggle />
      </nav>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200/80 bg-white/90 backdrop-blur-md sm:hidden dark:border-zinc-800/60 dark:bg-zinc-950/90">
        <div className="flex items-center justify-around px-1 py-1">
          {BOTTOM_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-opacity active:opacity-50 ${
                  active
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-400 dark:text-zinc-600"
                }`}
              >
                <span className="relative">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={active ? 2 : 1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {"badge" in item && item.badge && (
                    <UnreadBadge show={unreadCount > 0} />
                  )}
                </span>
                <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
