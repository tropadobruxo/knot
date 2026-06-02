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
          <div className="animate-float-slow absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-200 opacity-40 blur-3xl" />
          <div className="animate-float-delayed absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-pink-200 opacity-40 blur-3xl" />
          <div className="animate-float absolute -left-10 top-1/3 h-40 w-40 rounded-full bg-fuchsia-200 opacity-20 blur-3xl" />

          {/* Decorative floating SVG illustrations */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Knot/rope icon top-left */}
            <svg className="animate-float absolute left-[10%] top-[15%] h-16 w-16 text-violet-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            {/* Heart top-right */}
            <svg className="animate-float-delayed absolute right-[12%] top-[20%] h-12 w-12 text-pink-300/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            {/* Shield bottom-left */}
            <svg className="animate-float-slow absolute bottom-[20%] left-[8%] h-14 w-14 text-emerald-300/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            {/* Sparkle bottom-right */}
            <svg className="animate-float absolute bottom-[25%] right-[10%] h-10 w-10 text-amber-300/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            {/* Users icon mid-right */}
            <svg className="animate-float-delayed absolute right-[5%] top-[50%] h-10 w-10 text-violet-300/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>

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
