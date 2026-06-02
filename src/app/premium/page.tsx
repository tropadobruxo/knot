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
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-center text-3xl font-bold">Knot Plus</h1>
      <p className="mt-2 text-center text-zinc-500">
        Desbloqueie recursos exclusivos para uma experiência completa.
      </p>

      {/* Plans comparison */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-1 text-2xl font-bold">
            R$ 0<span className="text-sm font-normal text-zinc-500">/mês</span>
          </p>
          <ul className="mt-4 space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">&#10003;</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Plus */}
        <div className="rounded-xl border-2 border-violet-500 bg-violet-50 p-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-violet-800">Plus</h2>
            <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-medium text-white">
              Recomendado
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-violet-800">
            {formatPrice(PLUS_PRICE_CENTS)}
            <span className="text-sm font-normal text-violet-500">/mês</span>
          </p>
          <ul className="mt-4 space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">&#10003;</span>
                {f}
              </li>
            ))}
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm font-medium text-violet-800">
                <span className="text-violet-500">&#9733;</span>
                {FEATURE_LABELS[f]}
              </li>
            ))}
          </ul>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-violet-600 py-2.5 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Processando..." : "Assinar Plus"}
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {/* Security always free */}
      <div className="mt-10 rounded-xl border border-green-200 bg-green-50 p-6">
        <h3 className="font-semibold text-green-900">
          Segurança nunca é paga
        </h3>
        <p className="mt-1 text-sm text-green-700">
          Estes recursos são gratuitos para todos os usuários, sempre:
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {ALWAYS_FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-green-800">
              <span className="text-green-500">&#10003;</span>
              {ALWAYS_FREE_LABELS[f] ?? f}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
