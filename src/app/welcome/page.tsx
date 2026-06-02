"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function WelcomePage() {
  const [mode, setMode] = useState<"landing" | "login" | "register">(
    "landing",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        setError(data.error);
        return;
      }

      await signIn("credentials", { email, password, callbackUrl: "/verify" });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha incorretos.");
        return;
      }

      window.location.href = "/verify";
    } finally {
      setLoading(false);
    }
  }

  if (mode === "landing") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Knot</h1>
          <p className="mt-3 text-lg text-zinc-600">
            Conexão para a comunidade kink/fetichista adulta.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => setMode("register")}
            className="w-full rounded-lg bg-violet-600 px-4 py-3 font-medium text-white hover:bg-violet-700"
          >
            Criar conta
          </button>
          <button
            onClick={() => setMode("login")}
            className="w-full rounded-lg border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-50"
          >
            Entrar
          </button>
        </div>

        <button
          onClick={() => (window.location.href = "/verify")}
          className="text-sm text-violet-600 hover:underline"
        >
          Explorar em modo demo
        </button>

        <p className="max-w-xs text-center text-sm text-zinc-500">
          Plataforma exclusiva para maiores de 18 anos. Verificação de idade
          obrigatória.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <form
        onSubmit={mode === "register" ? handleRegister : handleLogin}
        className="w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-semibold">
          {mode === "register" ? "Criar conta" : "Entrar"}
        </h2>

        {mode === "register" && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Pseudônimo
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_-]+"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="seu_pseudonimo"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Seu nome real nunca será exigido nem exibido.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="seu@email.com"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Seu email é privado e nunca será exibido a outros usuários.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 px-4 py-3 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading
            ? "Aguarde..."
            : mode === "register"
              ? "Criar conta"
              : "Entrar"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "register" ? "login" : "register");
            setError("");
          }}
          className="w-full text-sm text-violet-600 hover:underline"
        >
          {mode === "register"
            ? "Já tem conta? Entrar"
            : "Não tem conta? Criar"}
        </button>
      </form>
    </main>
  );
}
