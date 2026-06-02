"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CompletenessItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
}

export function ProfileCompleteness() {
  const [percentage, setPercentage] = useState<number | null>(null);
  const [items, setItems] = useState<CompletenessItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("knot-completeness-hidden");
    }
    return false;
  });

  useEffect(() => {
    if (dismissed) return;

    fetch("/api/profile/completeness")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ percentage: number; items: CompletenessItem[] }>;
      })
      .then((d) => {
        setPercentage(d.percentage);
        setItems(d.items);
      })
      .catch(() => {
        // Not authenticated or demo mode — hide component
        setPercentage(null);
      });
  }, [dismissed]);

  if (dismissed || percentage === null || percentage === 100) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3"
      >
        <div className="relative h-10 w-10 flex-shrink-0">
          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke="url(#completeness-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 0.942} 100`}
            />
            <defs>
              <linearGradient id="completeness-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {percentage}%
          </span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold">Complete seu perfil</p>
          <p className="text-xs text-zinc-500">Perfis completos aparecem mais no Discover</p>
        </div>
        <svg
          className={`h-4 w-4 text-zinc-400 transition ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          {items.filter((i) => !i.done).map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-300 dark:border-zinc-600">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
              <svg className="ml-auto h-3 w-3 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
          {items.filter((i) => i.done).map((item) => (
            <div key={item.key} className="flex items-center gap-2 px-2 py-1.5 text-sm opacity-60">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="line-through">{item.label}</span>
            </div>
          ))}
          <button
            onClick={() => {
              localStorage.setItem("knot-completeness-hidden", "true");
              setDismissed(true);
            }}
            className="mt-1 text-xs text-zinc-400 hover:text-zinc-600"
          >
            Esconder
          </button>
        </div>
      )}
    </div>
  );
}
