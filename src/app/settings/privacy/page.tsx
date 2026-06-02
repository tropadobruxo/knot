"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PrivacySettingsPage() {
  const router = useRouter();
  const [discreetMode, setDiscreetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings/privacy")
      .then((r) => r.json() as Promise<{ discreetMode: boolean }>)
      .then((data) => setDiscreetMode(data.discreetMode))
      .catch(() => {});
  }, []);

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    await fetch("/api/settings/privacy", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discreetMode }),
    });

    setLoading(false);
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-bold">Privacidade</h1>

      <div className="mt-6 space-y-6">
        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modo discreto</p>
              <p className="mt-1 text-sm text-zinc-500">
                Ativado, o app aparece como &quot;Notes&quot; na tela inicial e nas
                notificações. Verificação, bloqueio e denúncia continuam
                funcionando normalmente.
              </p>
            </div>
            <button
              onClick={() => setDiscreetMode(!discreetMode)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                discreetMode ? "bg-violet-600" : "bg-zinc-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  discreetMode ? "left-5.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
          <p className="text-sm text-violet-900">
            Segurança nunca é paga: verificação, bloqueio, denúncia e controles
            de privacidade são sempre gratuitos.
          </p>
        </div>
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
