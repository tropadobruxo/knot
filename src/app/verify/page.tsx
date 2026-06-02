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
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold">Verificação de idade</h1>
        <p className="mt-4 text-zinc-600">
          A Knot é exclusiva para maiores de 18 anos. Precisamos verificar sua
          idade antes de continuar.
        </p>
      </div>

      <div className="max-w-md rounded-xl border border-violet-200 bg-violet-50 p-6 text-center">
        <p className="text-sm text-violet-900">
          🔒 Um parceiro seguro confere sua idade.{" "}
          <strong>
            Nós nunca vemos nem guardamos seu documento.
          </strong>{" "}
          Só recebemos a confirmação de que você tem 18+.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleStartVerification}
        disabled={loading}
        className="rounded-lg bg-violet-600 px-8 py-3 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? "Verificando..." : "Verificar minha idade"}
      </button>
    </main>
  );
}
