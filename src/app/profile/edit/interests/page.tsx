"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Interest {
  id: string;
  name: string;
  category: string | null;
}

interface SelectedInterest {
  interestId: string;
  level: string;
}

const LEVELS = ["curious", "experienced", "hard_yes"] as const;
const LEVEL_LABELS: Record<string, string> = {
  curious: "Curioso(a)",
  experienced: "Experiente",
  hard_yes: "Sim!",
};

export default function EditInterestsPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Interest[]>([]);
  const [selected, setSelected] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/interests")
      .then((r) => r.json() as Promise<Interest[]>)
      .then(setCatalog)
      .catch(() => {});
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, "curious");
      }
      return next;
    });
  }

  function setLevel(id: string, level: string) {
    setSelected((prev) => new Map(prev).set(id, level));
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    const interests: SelectedInterest[] = Array.from(selected.entries()).map(
      ([interestId, level]) => ({ interestId, level }),
    );

    await fetch("/api/profile/interests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests }),
    });

    setLoading(false);
    setSaved(true);
  }

  const grouped = catalog.reduce<Record<string, Interest[]>>((acc, i) => {
    const cat = i.category ?? "Outros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(i);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-bold">Interesses</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Selecione seus interesses e indique seu nível.
      </p>

      <div className="mt-6 space-y-6">
        {Object.entries(grouped).map(([category, interests]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-zinc-500">{category}</h3>
            <div className="mt-2 space-y-2">
              {interests.map((interest) => {
                const isSelected = selected.has(interest.id);
                return (
                  <div key={interest.id} className="flex items-center gap-3">
                    <button
                      onClick={() => toggle(interest.id)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-left text-sm ${
                        isSelected
                          ? "border-violet-600 bg-violet-50"
                          : "border-zinc-300"
                      }`}
                    >
                      {interest.name}
                    </button>
                    {isSelected && (
                      <select
                        value={selected.get(interest.id)}
                        onChange={(e) => setLevel(interest.id, e.target.value)}
                        className="rounded border border-zinc-300 px-2 py-1 text-xs"
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {LEVEL_LABELS[l]}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
