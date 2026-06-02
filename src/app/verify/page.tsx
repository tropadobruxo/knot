"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStartVerification() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verification/start", { method: "POST" });
      if (!res.ok) {
        setError("Erro ao iniciar verificação. Tente novamente.");
        return;
      }

      const data = (await res.json()) as { redirectUrl: string };

      // In sandbox/demo mode, skip webhook and go to onboarding
      if (data.redirectUrl.includes("sandbox")) {
        router.push("/onboarding");
        return;
      }

      // In production, redirect to provider's verification page
      window.location.href = data.redirectUrl;
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-6">
      {/* Background decorations */}
      <div className="animate-float-slow pointer-events-none absolute -top-20 right-[10%] h-64 w-64 rounded-full bg-violet-100 opacity-40 blur-3xl" />
      <div className="animate-float-delayed pointer-events-none absolute -bottom-20 left-[15%] h-48 w-48 rounded-full bg-emerald-100 opacity-30 blur-3xl" />

      {/* Shield illustration */}
      <div className="relative" style={{ animation: "slide-up 0.5s ease-out" }}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200 to-violet-200 opacity-40 blur-2xl" />
        <div className="animate-float relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl">
          <svg className="h-14 w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        {/* Floating lock */}
        <div className="animate-float-delayed absolute -right-3 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg dark:bg-zinc-800">
          <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="max-w-md text-center" style={{ animation: "slide-up 0.6s ease-out" }}>
        <h1 className="text-3xl font-bold">Verificação de idade</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          A Knot é exclusiva para maiores de 18 anos. Precisamos verificar sua
          idade antes de continuar.
        </p>
      </div>

      <div className="max-w-md rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 text-center shadow-sm dark:border-emerald-800/30 dark:from-emerald-950/30 dark:to-teal-950/30" style={{ animation: "slide-up 0.7s ease-out" }}>
        <div className="mb-3 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-emerald-900 dark:text-emerald-200">
          Um parceiro seguro confere sua idade.{" "}
          <strong>Nós nunca vemos nem guardamos seu documento.</strong>{" "}
          Só recebemos a confirmação de que você tem 18+.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleStartVerification}
        disabled={loading}
        className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
        style={{ animation: "slide-up 0.8s ease-out" }}
      >
        {loading ? "Verificando..." : "Verificar minha idade"}
      </button>
    </main>
  );
}
