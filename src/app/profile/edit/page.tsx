"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileCompleteness } from "@/components/profile-completeness";

const ROLES = [
  { value: "dom", label: "Dominante", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" },
  { value: "sub", label: "Submisso(a)", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" },
  { value: "switch", label: "Switch", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },
  { value: "exploring", label: "Explorando", icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" },
];

const INTENTS = [
  { value: "relacionamento", label: "Relacionamento" },
  { value: "amizade", label: "Amizade" },
  { value: "aprender", label: "Aprender" },
  { value: "casual", label: "Casual" },
];

const LINKS = [
  { href: "/profile/edit/photos", label: "Gerenciar fotos", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" },
  { href: "/profile/edit/interests", label: "Gerenciar interesses", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
  { href: "/profile/edit/limits", label: "Gerenciar limites", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
  { href: "/settings/privacy", label: "Privacidade e modo discreto", icon: "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" },
];

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

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Editar perfil</h1>
      </div>

      <div className="mt-4">
        <ProfileCompleteness />
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-zinc-700">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={3}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            placeholder="Conte um pouco sobre você..."
          />
          <p className="mt-1 text-right text-xs text-zinc-400">{bio.length}/500</p>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-zinc-700">
            Cidade
          </label>
          <div className="relative mt-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 py-2.5 pl-10 pr-4 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              placeholder="Ex: São Paulo"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-zinc-700">Papel</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm transition active:scale-[0.98] ${
                  role === r.value
                    ? "border-violet-500 bg-violet-50 font-medium text-violet-900"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <svg className={`h-4 w-4 ${role === r.value ? "text-violet-500" : "text-zinc-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
                </svg>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-zinc-700">Busca</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {INTENTS.map((i) => (
              <button
                key={i.value}
                type="button"
                onClick={() => toggleIntent(i.value)}
                className={`rounded-xl border-2 px-3 py-2.5 text-sm transition active:scale-[0.98] ${
                  intents.includes(i.value)
                    ? "border-violet-500 bg-violet-50 font-medium text-violet-900"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Salvando..." : saved ? "Salvo!" : "Salvar alterações"}
        </button>
      </form>

      <div className="mt-8 space-y-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3.5 text-sm font-medium transition hover:border-violet-300 hover:bg-violet-50/50"
          >
            <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
            </svg>
            {link.label}
            <svg className="ml-auto h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </main>
  );
}
