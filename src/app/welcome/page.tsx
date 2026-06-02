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
      <main className="flex min-h-screen flex-col">
        {/* Hero */}
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6">
          {/* Background gradient orbs */}
          <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-200 opacity-40 blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-pink-200 opacity-40 blur-3xl" />

          <div className="relative z-10 text-center" style={{ animation: "slide-up 0.6s ease-out" }}>
            <h1 className="bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent">
              Knot
            </h1>
            <p className="mt-4 text-xl text-zinc-600">
              Conexões autênticas para a comunidade kink.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              Descubra pessoas, participe de eventos, junte-se a grupos.
              Tudo com privacidade e segurança.
            </p>
          </div>

          {/* Feature pills */}
          <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-2" style={{ animation: "slide-up 0.8s ease-out" }}>
            {["Verificação 18+", "Pseudônimos", "Zero PII", "Modo discreto"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs text-zinc-600 backdrop-blur"
              >
                {f}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="relative z-10 mt-10 w-full max-w-sm space-y-3" style={{ animation: "slide-up 1s ease-out" }}>
            <button
              onClick={() => setMode("register")}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98]"
            >
              Criar conta
            </button>
            <button
              onClick={() => setMode("login")}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 font-semibold transition hover:bg-zinc-50 active:scale-[0.98]"
            >
              Entrar
            </button>
          </div>

          <button
            onClick={() => (window.location.href = "/verify")}
            className="relative z-10 mt-6 text-sm text-violet-600 hover:underline"
          >
            Explorar em modo demo
          </button>

          <p className="relative z-10 mt-8 max-w-xs text-center text-xs text-zinc-400">
            Plataforma exclusiva para maiores de 18 anos.
            Verificação de idade obrigatória.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-200 opacity-30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-24 right-1/4 h-72 w-72 rounded-full bg-pink-200 opacity-30 blur-3xl" />

      <form
        onSubmit={mode === "register" ? handleRegister : handleLogin}
        className="relative z-10 w-full max-w-sm space-y-5 rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur"
        style={{ animation: "slide-up 0.4s ease-out" }}
      >
        <div className="text-center">
          <h2 className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
            {mode === "register" ? "Criar conta" : "Bem-vindo de volta"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {mode === "register"
              ? "Junte-se à comunidade Knot"
              : "Entre na sua conta"}
          </p>
        </div>

        {mode === "register" && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-zinc-700">
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
              className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              placeholder="seu_pseudonimo"
            />
            <p className="mt-1 text-xs text-zinc-400">
              Seu nome real nunca será exigido nem exibido.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            placeholder="seu@email.com"
          />
          <p className="mt-1 text-xs text-zinc-400">
            Privado — nunca exibido a outros usuários.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
        >
          {loading
            ? "Aguarde..."
            : mode === "register"
              ? "Criar conta"
              : "Entrar"}
        </button>

        <div className="flex flex-col items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "register" ? "login" : "register");
              setError("");
            }}
            className="text-violet-600 hover:underline"
          >
            {mode === "register"
              ? "Já tem conta? Entrar"
              : "Não tem conta? Criar"}
          </button>
          {mode === "login" && (
            <a
              href="/forgot-password"
              className="text-zinc-400 hover:text-violet-600 hover:underline"
            >
              Esqueceu a senha?
            </a>
          )}
        </div>
      </form>
    </main>
  );
}
