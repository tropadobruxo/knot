"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
  username: string;
  onClose: () => void;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
}

const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#f97316"];

export function MatchCelebration({ username, onClose }: Props) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      color: COLORS[i % COLORS.length] ?? "#8b5cf6",
      size: randomBetween(6, 12),
      delay: randomBetween(0, 0.5),
      duration: randomBetween(1.5, 3),
      rotation: randomBetween(0, 360),
    })),
  );

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ animation: "fade-in 0.3s ease-out" }} />

      {/* Confetti particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: "-10px",
              width: p.size,
              height: p.size * 1.5,
              backgroundColor: p.color,
              borderRadius: p.size > 9 ? "50%" : "2px",
              transform: `rotate(${p.rotation}deg)`,
              animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>

      {/* Match card */}
      <div
        className="relative z-10 mx-6 max-w-sm rounded-3xl bg-gradient-to-br from-violet-600 via-pink-500 to-orange-400 p-8 text-center shadow-2xl"
        style={{ animation: "match-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hearts */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <svg className="h-10 w-10 text-white" style={{ animation: "match-heart 0.6s 0.3s ease-out both" }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          <svg className="h-10 w-10 text-white" style={{ animation: "match-heart 0.6s 0.5s ease-out both" }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>

        <h2 className="text-3xl font-extrabold text-white">Match!</h2>
        <p className="mt-2 text-lg text-white/90">
          Você e <span className="font-bold">{username}</span> se curtiram
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/matches"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-violet-600 shadow-lg transition hover:shadow-xl active:scale-95"
            onClick={onClose}
          >
            Ir para Matches
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl px-6 py-2.5 text-sm font-medium text-white/80 transition hover:text-white"
          >
            Continuar descobrindo
          </button>
        </div>
      </div>
    </div>
  );
}
