"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DOC_TYPES = [
  { id: "rg", label: "RG", icon: "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" },
  { id: "cnh", label: "CNH", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" },
  { id: "passport", label: "Passaporte", icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" },
];

const STEPS = [
  { title: "Verificacao de idade", subtitle: "Passo 1 de 3" },
  { title: "Tipo de documento", subtitle: "Passo 2 de 3" },
  { title: "Selfie de confirmacao", subtitle: "Passo 3 de 3" },
];

export default function VerifyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStartVerification() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verification/start", { method: "POST" });
      if (!res.ok) {
        setError("Erro ao iniciar verificacao. Tente novamente.");
        return;
      }

      const data = (await res.json()) as { redirectUrl: string };

      if (data.redirectUrl.includes("sandbox")) {
        router.push("/onboarding");
        return;
      }

      window.location.href = data.redirectUrl;
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-6">
      {/* Background */}
      <div className="animate-float-slow pointer-events-none absolute -top-20 right-[10%] h-64 w-64 rounded-full bg-violet-100 opacity-40 blur-3xl" />
      <div className="animate-float-delayed pointer-events-none absolute -bottom-20 left-[15%] h-48 w-48 rounded-full bg-emerald-100 opacity-30 blur-3xl" />

      {/* Progress bar */}
      <div className="flex w-full max-w-md gap-2" style={{ animation: "slide-up 0.4s ease-out" }}>
        {STEPS.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ${i <= step ? "w-full" : "w-0"}`}
            />
          </div>
        ))}
      </div>

      {/* Step 1: Introduction */}
      {step === 0 && (
        <div className="flex flex-col items-center gap-6" style={{ animation: "slide-up 0.5s ease-out" }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200 to-violet-200 opacity-40 blur-2xl" />
            <div className="animate-float relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl">
              <svg className="h-14 w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>

          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold">Verificacao de idade</h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              A Knot e exclusiva para maiores de 18 anos. O processo e rapido e seguro.
            </p>
          </div>

          <div className="w-full max-w-md space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Privacidade total</p>
                <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">Nos nunca vemos nem guardamos seu documento. So recebemos confirmacao 18+.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Rapido</p>
                <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">Menos de 2 minutos. Foto do documento + selfie.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
                <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-violet-900 dark:text-violet-200">Badge verificado</p>
                <p className="mt-0.5 text-xs text-violet-700 dark:text-violet-300">Seu perfil recebe o selo &quot;18+ verificado&quot; visivel para outros usuarios.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full max-w-md rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98]"
          >
            Comecar verificacao
          </button>
        </div>
      )}

      {/* Step 2: Document type */}
      {step === 1 && (
        <div className="flex w-full max-w-md flex-col items-center gap-6" style={{ animation: "slide-up 0.5s ease-out" }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Escolha o documento</h2>
            <p className="mt-2 text-sm text-zinc-500">Selecione o tipo de documento que voce vai usar</p>
          </div>

          <div className="w-full space-y-3">
            {DOC_TYPES.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setDocType(doc.id)}
                className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 transition ${
                  docType === doc.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700"
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  docType === doc.id ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                }`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={doc.icon} />
                  </svg>
                </div>
                <span className="font-medium">{doc.label}</span>
                {docType === doc.id && (
                  <svg className="ml-auto h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="flex w-full gap-3">
            <button
              onClick={() => setStep(0)}
              className="flex-1 rounded-xl border border-zinc-300 px-6 py-3 font-medium transition hover:bg-zinc-50 dark:border-zinc-700"
            >
              Voltar
            </button>
            <button
              onClick={() => { if (docType) setStep(2); }}
              disabled={!docType}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98] disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Selfie instructions */}
      {step === 2 && (
        <div className="flex w-full max-w-md flex-col items-center gap-6" style={{ animation: "slide-up 0.5s ease-out" }}>
          <div className="relative">
            <div className="animate-float relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-xl">
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold">Selfie de confirmacao</h2>
            <p className="mt-2 text-sm text-zinc-500">Para garantir que voce e a pessoa do documento</p>
          </div>

          <div className="w-full space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Dicas para a selfie:</h3>
            <ul className="space-y-2">
              {[
                "Boa iluminacao — evite sombras no rosto",
                "Olhe diretamente para a camera",
                "Remova oculos escuros e bonés",
                "Fundo limpo e sem outras pessoas",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800/30 dark:bg-amber-950/30">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Voce sera redirecionado para nosso parceiro de verificacao. O processo leva menos de 2 minutos.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex w-full gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl border border-zinc-300 px-6 py-3 font-medium transition hover:bg-zinc-50 dark:border-zinc-700"
            >
              Voltar
            </button>
            <button
              onClick={handleStartVerification}
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Abrir camera"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
