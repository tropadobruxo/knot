"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      setDone(true);
    } else {
      const data = (await res.json()) as { error: string };
      setError(data.error);
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
        <p className="text-zinc-500">Link inválido.</p>
        <Link href="/welcome" className="mt-2 text-sm text-violet-600 hover:underline">
          Voltar ao login
        </Link>
      </main>
    );
  }

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
        <h1 className="text-2xl font-bold">Senha redefinida!</h1>
        <p className="mt-2 text-sm text-zinc-600">Agora você pode entrar com sua nova senha.</p>
        <Link
          href="/welcome"
          className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-violet-700"
        >
          Ir para login
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Nova senha</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nova senha (mín. 8 caracteres)"
          minLength={8}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirmar nova senha"
          minLength={8}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Redefinindo..." : "Redefinir senha"}
        </button>
      </form>
    </main>
  );
}
