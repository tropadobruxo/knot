"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "role" | "intent" | "conduct";

const ROLES = [
  { value: "dom", label: "Dominante" },
  { value: "sub", label: "Submisso(a)" },
  { value: "switch", label: "Switch" },
  { value: "exploring", label: "Explorando" },
] as const;

const INTENTS = [
  { value: "relacionamento", label: "Relacionamento" },
  { value: "amizade", label: "Amizade" },
  { value: "aprender", label: "Aprender" },
  { value: "casual", label: "Casual" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState("");
  const [intents, setIntents] = useState<string[]>([]);
  const [conductAccepted, setConductAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        setError(data.error);
        return;
      }

      router.push("/events");
    } finally {
      setLoading(false);
    }
  }

  if (step === "role") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <h1 className="text-2xl font-bold">Qual seu papel?</h1>
        <p className="text-zinc-600">Pode mudar depois nas configurações.</p>
        <div className="grid w-full max-w-sm gap-3">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`rounded-lg border px-4 py-3 text-left font-medium transition ${
                role === r.value
                  ? "border-violet-600 bg-violet-50 text-violet-900"
                  : "border-zinc-300 hover:border-zinc-400"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setStep("intent")}
          disabled={!role}
          className="rounded-lg bg-violet-600 px-8 py-3 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          Continuar
        </button>
      </main>
    );
  }

  if (step === "intent") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <h1 className="text-2xl font-bold">O que você busca?</h1>
        <p className="text-zinc-600">Selecione uma ou mais opções.</p>
        <div className="grid w-full max-w-sm gap-3">
          {INTENTS.map((i) => (
            <button
              key={i.value}
              onClick={() => toggleIntent(i.value)}
              className={`rounded-lg border px-4 py-3 text-left font-medium transition ${
                intents.includes(i.value)
                  ? "border-violet-600 bg-violet-50 text-violet-900"
                  : "border-zinc-300 hover:border-zinc-400"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setStep("role")}
            className="rounded-lg border border-zinc-300 px-6 py-3 font-medium hover:bg-zinc-50"
          >
            Voltar
          </button>
          <button
            onClick={() => setStep("conduct")}
            disabled={intents.length === 0}
            className="rounded-lg bg-violet-600 px-8 py-3 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold">Código de conduta</h1>
      <div className="max-w-md space-y-3 text-sm text-zinc-700">
        <p>Ao usar a Knot, você concorda em:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Respeitar limites declarados de todos os usuários.</li>
          <li>
            Não compartilhar informações pessoais de outros membros fora da
            plataforma.
          </li>
          <li>Denunciar comportamento abusivo ou suspeito.</li>
          <li>
            Não criar conteúdo explícito na plataforma — a Knot é um espaço de
            conexão.
          </li>
          <li>
            Tratar todos com dignidade, independentemente de papel, orientação ou
            identidade.
          </li>
        </ul>
      </div>

      <label className="flex max-w-md items-start gap-3">
        <input
          type="checkbox"
          checked={conductAccepted}
          onChange={(e) => setConductAccepted(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm">
          Li e aceito o código de conduta da Knot.
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => setStep("intent")}
          className="rounded-lg border border-zinc-300 px-6 py-3 font-medium hover:bg-zinc-50"
        >
          Voltar
        </button>
        <button
          onClick={handleComplete}
          disabled={!conductAccepted || loading}
          className="rounded-lg bg-violet-600 px-8 py-3 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Completar"}
        </button>
      </div>
    </main>
  );
}
