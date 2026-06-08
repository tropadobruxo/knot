"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LimitType = "hard" | "soft";

interface LimitDraft {
  description: string;
  type: LimitType;
}

export default function EditLimitsPage() {
  const router = useRouter();
  const [limits, setLimits] = useState<LimitDraft[]>([{ description: "", type: "hard" }]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile/limits")
      .then((r) => r.json() as Promise<{ description: string; type: LimitType }[]>)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLimits(data.map((l) => ({ description: l.description, type: l.type })));
        }
      })
      .catch(() => {});
  }, []);

  function addLimit() {
    setLimits((prev) => [...prev, { description: "", type: "hard" }]);
  }

  function updateDescription(index: number, value: string) {
    setLimits((prev) => prev.map((l, i) => (i === index ? { ...l, description: value } : l)));
  }

  function updateType(index: number, type: LimitType) {
    setLimits((prev) => prev.map((l, i) => (i === index ? { ...l, type } : l)));
  }

  function removeLimit(index: number) {
    setLimits((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    const filtered = limits.filter((l) => l.description.trim().length > 0);

    await fetch("/api/profile/limits", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limits: filtered }),
    });

    setLoading(false);
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-bold">Limites e consentimento</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Declare seus limites. Eles aparecem no seu perfil, visíveis antes de
        qualquer match, para que sejam respeitados.
      </p>

      <div className="mt-4 rounded-xl border border-zinc-200/80 bg-white p-3 text-xs text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-400">
        <p>
          <span className="font-semibold text-rose-600 dark:text-rose-400">Limite rígido</span> —
          inegociável, nunca ultrapasse.
        </p>
        <p className="mt-1">
          <span className="font-semibold text-amber-600 dark:text-amber-400">Limite flexível</span> —
          só com conversa e consentimento explícito.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {limits.map((limit, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200/80 bg-white p-3 dark:border-zinc-800/80 dark:bg-zinc-900/60"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={limit.description}
                onChange={(e) => updateDescription(i, e.target.value)}
                placeholder="Ex: Sem impacto no rosto"
                maxLength={300}
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
              <button
                onClick={() => removeLimit(i)}
                className="text-sm text-rose-500 hover:text-rose-700"
              >
                Remover
              </button>
            </div>
            <div className="mt-2 flex gap-1.5">
              {(["hard", "soft"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateType(i, t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    limit.type === t
                      ? t === "hard"
                        ? "bg-rose-600 text-white"
                        : "bg-amber-500 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {t === "hard" ? "Rígido" : "Flexível"}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={addLimit}
          className="text-sm text-violet-600 hover:underline"
        >
          + Adicionar limite
        </button>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-violet-600 px-6 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
        {saved && <span className="text-sm text-green-600">Salvo!</span>}
        <button
          onClick={() => router.back()}
          className="text-sm text-violet-600 hover:underline"
        >
          Voltar
        </button>
      </div>
    </main>
  );
}
