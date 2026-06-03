"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PrivacySettingsPage() {
  const router = useRouter();
  const [discreetMode, setDiscreetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Travel mode
  const [travelCity, setTravelCity] = useState("");
  const [travelDays, setTravelDays] = useState(7);
  const [activeTravel, setActiveTravel] = useState<{ city: string; until: string } | null>(null);
  const [travelLoading, setTravelLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings/privacy")
      .then((r) => r.json() as Promise<{ discreetMode: boolean }>)
      .then((data) => setDiscreetMode(data.discreetMode))
      .catch(() => {});

    fetch("/api/settings/travel")
      .then((r) => r.json() as Promise<{ travelCity: string | null; travelUntil: string | null }>)
      .then((data) => {
        if (data.travelCity && data.travelUntil) {
          setActiveTravel({ city: data.travelCity, until: data.travelUntil });
        }
      })
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

    localStorage.setItem("knot-discreet", String(discreetMode));
    if (discreetMode) {
      document.title = "Notes";
    } else {
      document.title = "Knot";
    }

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

        {/* Travel mode */}
        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            <p className="font-medium">Modo viagem</p>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Apareca no discover de outra cidade temporariamente.
          </p>

          {activeTravel ? (
            <div className="mt-3">
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950/20">
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{activeTravel.city}</span>
                <span className="text-xs text-blue-500">
                  ate {new Date(activeTravel.until).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                </span>
              </div>
              <button
                onClick={async () => {
                  setTravelLoading(true);
                  await fetch("/api/settings/travel", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                  });
                  setActiveTravel(null);
                  setTravelLoading(false);
                }}
                disabled={travelLoading}
                className="mt-2 text-sm text-red-600 hover:underline disabled:opacity-50"
              >
                Desativar modo viagem
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <input
                placeholder="Cidade destino"
                value={travelCity}
                onChange={(e) => setTravelCity(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
              <div className="flex items-center gap-2">
                <select
                  value={travelDays}
                  onChange={(e) => setTravelDays(Number(e.target.value))}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                >
                  {[3, 5, 7, 14, 30].map((d) => (
                    <option key={d} value={d}>{d} dias</option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    if (!travelCity.trim()) return;
                    setTravelLoading(true);
                    const res = await fetch("/api/settings/travel", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ travelCity: travelCity.trim(), days: travelDays }),
                    });
                    if (res.ok) {
                      const data = (await res.json()) as { travelCity: string; travelUntil: string };
                      setActiveTravel({ city: data.travelCity, until: data.travelUntil });
                      setTravelCity("");
                    }
                    setTravelLoading(false);
                  }}
                  disabled={travelLoading || !travelCity.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {travelLoading ? "..." : "Ativar"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selfie verification */}
        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <p className="font-medium">Verificacao por selfie</p>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Prove sua identidade com uma selfie e receba o badge de verificado.
          </p>
          <Link
            href="/verify/selfie"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100"
          >
            Verificar agora
          </Link>
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
