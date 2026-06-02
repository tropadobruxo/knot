"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState("");
  const [intents, setIntents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile", { method: "GET" })
      .then(() => {
        // Profile data will be loaded in a future iteration
        // when we add GET /api/profile (own profile)
      })
      .catch(() => {});
  }, []);

  function toggleIntent(value: string) {
    setIntents((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value],
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const data: Record<string, unknown> = {};
    if (bio) data.bio = bio;
    if (city) data.city = city;
    if (role) data.roleType = role;
    if (intents.length > 0) data.intent = intents;

    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    setSaved(true);
  }

  const ROLES = [
    { value: "dom", label: "Dominante" },
    { value: "sub", label: "Submisso(a)" },
    { value: "switch", label: "Switch" },
    { value: "exploring", label: "Explorando" },
  ];

  const INTENTS = [
    { value: "relacionamento", label: "Relacionamento" },
    { value: "amizade", label: "Amizade" },
    { value: "aprender", label: "Aprender" },
    { value: "casual", label: "Casual" },
  ];

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-bold">Editar perfil</h1>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <div>
          <label htmlFor="bio" className="block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={3}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium">
            Cidade
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="Ex: São Paulo"
          />
        </div>

        <div>
          <p className="text-sm font-medium">Papel</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  role === r.value
                    ? "border-violet-600 bg-violet-50 text-violet-900"
                    : "border-zinc-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Busca</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {INTENTS.map((i) => (
              <button
                key={i.value}
                type="button"
                onClick={() => toggleIntent(i.value)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  intents.includes(i.value)
                    ? "border-violet-600 bg-violet-50 text-violet-900"
                    : "border-zinc-300"
                }`}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-violet-600 px-6 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
          {saved && (
            <span className="text-sm text-green-600">Salvo!</span>
          )}
        </div>
      </form>

      <div className="mt-8 space-y-2">
        <Link
          href="/profile/edit/interests"
          className="block rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium hover:bg-zinc-50"
        >
          Gerenciar interesses
        </Link>
        <Link
          href="/profile/edit/limits"
          className="block rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium hover:bg-zinc-50"
        >
          Gerenciar limites
        </Link>
        <Link
          href="/profile/edit/photos"
          className="block rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium hover:bg-zinc-50"
        >
          Gerenciar fotos
        </Link>
        <Link
          href="/settings/privacy"
          className="block rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium hover:bg-zinc-50"
        >
          Privacidade e modo discreto
        </Link>
      </div>

      <button
        onClick={() => router.back()}
        className="mt-6 text-sm text-violet-600 hover:underline"
      >
        Voltar
      </button>
    </main>
  );
}
