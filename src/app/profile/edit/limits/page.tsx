"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditLimitsPage() {
  const router = useRouter();
  const [limits, setLimits] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function addLimit() {
    setLimits((prev) => [...prev, ""]);
  }

  function updateLimit(index: number, value: string) {
    setLimits((prev) => prev.map((l, i) => (i === index ? value : l)));
  }

  function removeLimit(index: number) {
    setLimits((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    const filtered = limits.filter((l) => l.trim().length > 0);

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
      <h1 className="text-2xl font-bold">Limites</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Declare seus limites. Eles aparecerão no seu perfil para que outros os
        respeitem.
      </p>

      <div className="mt-6 space-y-3">
        {limits.map((limit, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={limit}
              onChange={(e) => updateLimit(i, e.target.value)}
              placeholder="Ex: Sem impacto no rosto"
              maxLength={300}
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              onClick={() => removeLimit(i)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remover
            </button>
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
