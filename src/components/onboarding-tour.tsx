"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const TIPS = [
  {
    page: "/discover",
    message: "Deslize pelos perfis e curta quem te interessa! Se for mútuo, é match.",
    position: "bottom" as const,
  },
  {
    page: "/matches",
    message: "Aqui ficam seus matches. Toque em Chat para conversar!",
    position: "top" as const,
  },
  {
    page: "/events",
    message: "Encontre munches, workshops e festas perto de você.",
    position: "top" as const,
  },
  {
    page: "/groups",
    message: "Participe de comunidades e troque experiências.",
    position: "top" as const,
  },
  {
    page: "/profile/edit",
    message: "Complete seu perfil para aparecer mais no discover!",
    position: "top" as const,
  },
];

function getSeenPages(): string[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("knot-tour-pages") ?? "[]") as string[];
}

function isTourDone(): boolean {
  if (typeof window === "undefined") return true;
  return !!localStorage.getItem("knot-tour-seen");
}

export function OnboardingTour() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(isTourDone);
  const [seenPages, setSeenPages] = useState(getSeenPages);

  const currentTip = useMemo(() => {
    if (dismissed) return null;
    return TIPS.find((t) => pathname.startsWith(t.page) && !seenPages.includes(t.page)) ?? null;
  }, [pathname, dismissed, seenPages]);

  function handleDismiss() {
    if (!currentTip) return;
    const updated = [...seenPages, currentTip.page];
    localStorage.setItem("knot-tour-pages", JSON.stringify(updated));
    setSeenPages(updated);

    if (updated.length >= TIPS.length) {
      localStorage.setItem("knot-tour-seen", "true");
      setDismissed(true);
    }
  }

  function handleSkipAll() {
    localStorage.setItem("knot-tour-seen", "true");
    setDismissed(true);
  }

  if (!currentTip) return null;

  return (
    <div
      className={`fixed left-4 right-4 z-[60] mx-auto max-w-sm rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 p-4 shadow-2xl ${
        currentTip.position === "top" ? "top-16 sm:top-14" : "bottom-20 sm:bottom-4"
      }`}
      style={{ animation: "slide-up 0.4s ease-out" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{currentTip.message}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleDismiss}
              className="rounded-lg bg-white/20 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/30"
            >
              Entendi
            </button>
            <button
              onClick={handleSkipAll}
              className="px-2 py-1 text-xs text-white/70 hover:text-white"
            >
              Pular tour
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-white/60 hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
