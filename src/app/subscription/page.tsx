"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice, PLUS_PRICE_CENTS } from "@/lib/billing";

interface SubscriptionData {
  subscription: {
    id: string;
    tier: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  } | null;
  currentTier: string;
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json() as Promise<SubscriptionData>)
      .then(setData)
      .catch(() => {});
  }, []);

  async function handleCancel() {
    if (!confirm("Cancelar sua assinatura Plus?")) return;
    setCancelling(true);
    setMessage("");

    const res = await fetch("/api/subscription", { method: "DELETE" });
    if (res.ok) {
      const d = (await res.json()) as { message: string };
      setMessage(d.message);
      // Reload
      const r = await fetch("/api/subscription");
      setData((await r.json()) as SubscriptionData);
    }
    setCancelling(false);
  }

  if (!data) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  const sub = data.subscription;
  const isActive = sub?.status === "active";

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-bold">Sua assinatura</h1>

      <div className="mt-6 rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">Plano atual</p>
            <p className="text-xl font-bold">
              {data.currentTier === "plus" ? "Plus" : "Free"}
            </p>
          </div>
          {isActive && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              Ativo
            </span>
          )}
          {sub?.status === "cancelled" && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              Cancelado
            </span>
          )}
        </div>

        {sub && (
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              Valor: <span className="font-medium">{formatPrice(PLUS_PRICE_CENTS)}/mês</span>
            </p>
            <p>
              Período:{" "}
              {new Date(sub.currentPeriodStart).toLocaleDateString("pt-BR")} —{" "}
              {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}

        {isActive && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="mt-4 rounded border border-red-300 px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {cancelling ? "Cancelando..." : "Cancelar assinatura"}
          </button>
        )}

        {!isActive && data.currentTier === "free" && (
          <Link
            href="/premium"
            className="mt-4 inline-block rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Assinar Plus
          </Link>
        )}
      </div>

      {message && (
        <p className="mt-4 text-sm text-zinc-600">{message}</p>
      )}
    </main>
  );
}
