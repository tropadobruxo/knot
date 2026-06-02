"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setSent(true);
    setLoading(false);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Esqueceu a senha?</h1>

      {sent ? (
        <div className="mt-4">
          <p className="text-sm text-zinc-600">
            Se esse email estiver cadastrado, você receberá um link para redefinir sua senha.
          </p>
          <Link
            href="/welcome"
            className="mt-4 inline-block text-sm text-violet-600 hover:underline"
          >
            Voltar ao login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-sm text-zinc-500">
            Informe seu email e enviaremos um link para redefinir sua senha.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar link"}
          </button>
          <Link
            href="/welcome"
            className="block text-center text-sm text-violet-600 hover:underline"
          >
            Voltar ao login
          </Link>
        </form>
      )}
    </main>
  );
}
