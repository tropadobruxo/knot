"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "role" | "intent" | "conduct";

const STEPS: Step[] = ["role", "intent", "conduct"];
const STEP_LABELS = { role: "Papel", intent: "Busca", conduct: "Conduta" };

const ROLES = [
  { value: "dom", label: "Dominante", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z", desc: "Lidera cenas e dinâmicas" },
  { value: "sub", label: "Submisso(a)", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z", desc: "Entrega controle com confiança" },
  { value: "switch", label: "Switch", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5", desc: "Alterna entre papéis" },
  { value: "exploring", label: "Explorando", icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418", desc: "Descobrindo o que curte" },
] as const;

const INTENTS = [
  { value: "relacionamento", label: "Relacionamento", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z", color: "from-pink-500 to-rose-500" },
  { value: "amizade", label: "Amizade", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z", color: "from-emerald-500 to-teal-500" },
  { value: "aprender", label: "Aprender", icon: "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5", color: "from-blue-500 to-indigo-500" },
  { value: "casual", label: "Casual", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z", color: "from-amber-500 to-orange-500" },
] as const;

const CONDUCT_RULES = [
  { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", text: "Respeitar limites declarados de todos os usuários." },
  { icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z", text: "Não compartilhar informações pessoais de outros membros fora da plataforma." },
  { icon: "M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5", text: "Denunciar comportamento abusivo ou suspeito." },
  { icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", text: "Não criar conteúdo explícito na plataforma — a Knot é um espaço de conexão." },
  { icon: "M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z", text: "Tratar todos com dignidade, independentemente de papel, orientação ou identidade." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState("");
  const [intents, setIntents] = useState<string[]>([]);
  const [conductAccepted, setConductAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stepIndex = STEPS.indexOf(step);

  function toggleIntent(value: string) {
    setIntents((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value],
    );
  }

  async function handleComplete() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleType: role,
          intent: intents,
          codeOfConductAccepted: conductAccepted,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        if (data.error === "Não autenticado.") {
          router.push("/discover");
          return;
        }
        setError(data.error);
        return;
      }

      router.push("/discover");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
                i <= stepIndex
                  ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                  : "bg-zinc-100 text-zinc-400"
              }`}
            >
              {i + 1}
            </div>
            <span className={`hidden text-sm sm:inline ${i <= stepIndex ? "font-medium text-zinc-800" : "text-zinc-400"}`}>
              {STEP_LABELS[s]}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 rounded ${i < stepIndex ? "bg-violet-400" : "bg-zinc-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step: Role */}
      {step === "role" && (
        <div className="mt-10 w-full max-w-md" style={{ animation: "slide-up 0.4s ease-out" }}>
          <h1 className="text-center text-2xl font-bold">Qual seu papel?</h1>
          <p className="mt-1 text-center text-sm text-zinc-500">Pode mudar depois nas configurações.</p>
          <div className="mt-6 grid gap-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition active:scale-[0.98] ${
                  role === r.value
                    ? "border-violet-500 bg-violet-50 shadow-md"
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                  role === r.value ? "bg-violet-500 text-white" : "bg-zinc-100 text-zinc-500"
                }`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">{r.label}</p>
                  <p className="text-sm text-zinc-500">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep("intent")}
            disabled={!role}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Step: Intent */}
      {step === "intent" && (
        <div className="mt-10 w-full max-w-md" style={{ animation: "slide-up 0.4s ease-out" }}>
          <h1 className="text-center text-2xl font-bold">O que você busca?</h1>
          <p className="mt-1 text-center text-sm text-zinc-500">Selecione uma ou mais opções.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {INTENTS.map((i) => (
              <button
                key={i.value}
                onClick={() => toggleIntent(i.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition active:scale-[0.98] ${
                  intents.includes(i.value)
                    ? "border-violet-500 bg-violet-50 shadow-md"
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${i.color} text-white`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={i.icon} />
                  </svg>
                </div>
                <span className="font-semibold">{i.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep("role")}
              className="flex-1 rounded-xl border border-zinc-300 py-3.5 font-semibold transition hover:bg-zinc-50 active:scale-[0.98]"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep("conduct")}
              disabled={intents.length === 0}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step: Conduct */}
      {step === "conduct" && (
        <div className="mt-10 w-full max-w-md" style={{ animation: "slide-up 0.4s ease-out" }}>
          <h1 className="text-center text-2xl font-bold">Código de conduta</h1>
          <p className="mt-1 text-center text-sm text-zinc-500">Ao usar a Knot, você concorda em:</p>
          <div className="mt-6 space-y-3">
            {CONDUCT_RULES.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={rule.icon} />
                  </svg>
                </div>
                <p className="text-sm text-zinc-700">{rule.text}</p>
              </div>
            ))}
          </div>

          <label className="mt-6 flex items-center gap-3 rounded-xl border-2 border-zinc-200 p-4 transition hover:border-violet-300">
            <input
              type="checkbox"
              checked={conductAccepted}
              onChange={(e) => setConductAccepted(e.target.checked)}
              className="h-5 w-5 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm font-medium">
              Li e aceito o código de conduta da Knot.
            </span>
          </label>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep("intent")}
              className="flex-1 rounded-xl border border-zinc-300 py-3.5 font-semibold transition hover:bg-zinc-50 active:scale-[0.98]"
            >
              Voltar
            </button>
            <button
              onClick={handleComplete}
              disabled={!conductAccepted || loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Completar"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
