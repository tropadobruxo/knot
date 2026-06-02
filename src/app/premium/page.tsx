"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FEATURE_LABELS,
  PREMIUM_FEATURES,
  ALWAYS_FREE_FEATURES,
  PLUS_PRICE_CENTS,
  formatPrice,
} from "@/lib/billing";

const FREE_FEATURES = [
  "Até 10 likes por dia",
  "Participar de grupos",
  "Criar eventos",
  "Chat com matches",
];

const ALWAYS_FREE_LABELS: Record<string, string> = {
  block: "Bloquear usuários",
  report: "Denunciar conteúdo",
  discreet_mode: "Modo discreto",
  age_verification: "Verificação de idade",
  code_of_conduct: "Código de conduta",
  safety_info: "Informações de segurança",
};

export default function PremiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: "plus" }),
    });

    if (res.ok) {
      router.push("/subscription");
    } else {
      const d = (await res.json()) as { error: string };
      setError(d.error);
    }
    setLoading(false);
  }

  return (
    <main className="relative mx-auto max-w-3xl overflow-hidden px-6 py-10">
      {/* Decorative floating elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float-slow absolute -top-10 right-[15%] h-48 w-48 rounded-full bg-violet-200 opacity-20 blur-3xl" />
        <div className="animate-float-delayed absolute bottom-[20%] left-[10%] h-36 w-36 rounded-full bg-pink-200 opacity-20 blur-3xl" />
        <svg className="animate-float absolute left-[5%] top-[15%] h-8 w-8 text-amber-300/30" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
        </svg>
        <svg className="animate-float-delayed absolute right-[8%] top-[25%] h-6 w-6 text-violet-300/30" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        <svg className="animate-float absolute bottom-[30%] right-[12%] h-7 w-7 text-pink-300/25" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      </div>

      <div className="relative text-center" style={{ animation: "slide-up 0.5s ease-out" }}>
        <div className="mb-3 flex items-center justify-center gap-1">
          <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
          </svg>
          <svg className="h-8 w-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
          </svg>
          <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
          </svg>
        </div>
        <h1 className="animate-gradient bg-gradient-to-r from-violet-600 via-pink-500 to-violet-600 bg-clip-text text-4xl font-extrabold text-transparent">
          Knot Plus
        </h1>
        <p className="mt-2 text-zinc-500">
          Desbloqueie recursos exclusivos para uma experiência completa.
        </p>
      </div>

      {/* Plans comparison */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-1 text-3xl font-bold">
            R$ 0<span className="text-sm font-normal text-zinc-500">/mês</span>
          </p>
          <ul className="mt-6 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <svg className="h-5 w-5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Plus */}
        <div className="animate-glow relative overflow-hidden rounded-2xl border-2 border-violet-500 bg-gradient-to-b from-violet-50 to-white p-6 shadow-lg">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-200 opacity-50 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-violet-800">Plus</h2>
              <span className="rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-3 py-0.5 text-xs font-semibold text-white">
                Recomendado
              </span>
            </div>
            <p className="mt-1 text-3xl font-bold text-violet-800">
              {formatPrice(PLUS_PRICE_CENTS)}
              <span className="text-sm font-normal text-violet-500">/mês</span>
            </p>
            <ul className="mt-6 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <svg className="h-5 w-5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-violet-800">
                  <svg className="h-5 w-5 flex-shrink-0 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                  </svg>
                  {FEATURE_LABELS[f]}
                </li>
              ))}
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Processando..." : "Assinar Plus"}
            </button>
            {error && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security always free */}
      <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <h3 className="font-semibold text-green-900">
            Segurança nunca é paga
          </h3>
        </div>
        <p className="mt-2 text-sm text-green-700">
          Estes recursos são gratuitos para todos os usuários, sempre:
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {ALWAYS_FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-green-800">
              <svg className="h-4 w-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              {ALWAYS_FREE_LABELS[f] ?? f}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
