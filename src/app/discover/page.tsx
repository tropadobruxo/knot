"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProfileCompleteness } from "@/components/profile-completeness";
import { MatchCelebration } from "@/components/match-celebration";

interface ProfilePhoto {
  url: string;
  verified: boolean;
}

interface CompatBreakdown {
  sharedInterests: number;
  complementaryRole: boolean;
  sameCity: boolean;
  sharedIntents: number;
}

interface Profile {
  id: string;
  username: string;
  bio: string | null;
  city: string | null;
  displayCity?: string | null;
  roleType: string | null;
  intent: string[];
  photos: ProfilePhoto[];
  compatibility?: number | null;
  compatibilityBreakdown?: CompatBreakdown | null;
  premiumTier?: string;
  selfieVerified?: boolean;
  traveling?: boolean;
  interests?: string[];
}

const ROLE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "dom", label: "Dominante" },
  { value: "sub", label: "Submisso(a)" },
  { value: "switch", label: "Switch" },
  { value: "exploring", label: "Explorando" },
];

const INTENT_OPTIONS = [
  { value: "", label: "Qualquer" },
  { value: "relacionamento", label: "Relacionamento" },
  { value: "amizade", label: "Amizade" },
  { value: "aprender", label: "Aprender" },
  { value: "casual", label: "Casual" },
];

const PREVIEW_PROFILES: Profile[] = [
  {
    id: "preview-1", username: "luna_rope",
    bio: "Artista de shibari, explorando conexões através de cordas e confiança. SP capital.",
    city: "São Paulo", roleType: "dom", intent: ["relacionamento", "aprender"],
    photos: [
      { url: "https://randomuser.me/api/portraits/women/44.jpg", verified: true },
      { url: "https://randomuser.me/api/portraits/women/45.jpg", verified: false },
      { url: "https://randomuser.me/api/portraits/women/46.jpg", verified: false },
    ],
    compatibility: 92,
  },
  {
    id: "preview-2", username: "kai_switch",
    bio: "Switch versátil, curto workshops e munches. Fotógrafo nas horas vagas.",
    city: "Rio de Janeiro", roleType: "switch", intent: ["amizade", "casual"],
    photos: [
      { url: "https://randomuser.me/api/portraits/men/32.jpg", verified: true },
      { url: "https://randomuser.me/api/portraits/men/33.jpg", verified: false },
      { url: "https://randomuser.me/api/portraits/men/34.jpg", verified: false },
      { url: "https://randomuser.me/api/portraits/men/35.jpg", verified: false },
    ],
    compatibility: 87,
  },
  {
    id: "preview-3", username: "selene_sub",
    bio: "Submissa, buscando dinâmica D/s com segurança e carinho. Adoro pet play.",
    city: "Belo Horizonte", roleType: "sub", intent: ["relacionamento"],
    photos: [
      { url: "https://randomuser.me/api/portraits/women/68.jpg", verified: true },
      { url: "https://randomuser.me/api/portraits/women/69.jpg", verified: false },
    ],
    compatibility: 78,
  },
  {
    id: "preview-4", username: "thor_dom",
    bio: "Dominante experiente, mentor de novos praticantes. Educação e consentimento sempre.",
    city: "São Paulo", roleType: "dom", intent: ["aprender", "amizade"],
    photos: [
      { url: "https://randomuser.me/api/portraits/men/75.jpg", verified: true },
      { url: "https://randomuser.me/api/portraits/men/76.jpg", verified: false },
      { url: "https://randomuser.me/api/portraits/men/77.jpg", verified: false },
      { url: "https://randomuser.me/api/portraits/men/78.jpg", verified: false },
      { url: "https://randomuser.me/api/portraits/men/79.jpg", verified: false },
    ],
    compatibility: 95,
  },
  {
    id: "preview-5", username: "iris_explore",
    bio: "Curiosa e recém-chegada ao universo kink. Aqui pra aprender sem julgamentos.",
    city: "Curitiba", roleType: "exploring", intent: ["aprender", "amizade"],
    photos: [
      { url: "https://randomuser.me/api/portraits/women/22.jpg", verified: false },
      { url: "https://randomuser.me/api/portraits/women/23.jpg", verified: false },
    ],
    compatibility: 65,
  },
  {
    id: "preview-6", username: "fenix_primal",
    bio: "Primal play e impacto. Adoro festas e eventos presenciais. Salvador representando.",
    city: "Salvador", roleType: "switch", intent: ["casual", "amizade"],
    photos: [
      { url: "https://randomuser.me/api/portraits/men/11.jpg", verified: true },
      { url: "https://randomuser.me/api/portraits/men/12.jpg", verified: false },
      { url: "https://randomuser.me/api/portraits/men/13.jpg", verified: false },
    ],
    compatibility: 81,
  },
  {
    id: "preview-7", username: "maya_rope",
    bio: "Rigger e modelo de shibari. Ensino bondage seguro para iniciantes.",
    city: "Porto Alegre", roleType: "dom", intent: ["aprender", "relacionamento"],
    photos: [
      { url: "https://randomuser.me/api/portraits/women/85.jpg", verified: true },
      { url: "https://randomuser.me/api/portraits/women/86.jpg", verified: false },
      { url: "https://randomuser.me/api/portraits/women/87.jpg", verified: false },
    ],
    compatibility: 88,
  },
  {
    id: "preview-8", username: "neo_latex",
    bio: "Fetichista por latex e couro. Designer de moda alternativa.",
    city: "São Paulo", roleType: "sub", intent: ["casual"],
    photos: [
      { url: "https://randomuser.me/api/portraits/men/52.jpg", verified: false },
      { url: "https://randomuser.me/api/portraits/men/53.jpg", verified: false },
    ],
    compatibility: 72,
  },
];

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchUsername, setMatchUsername] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterIntent, setFilterIntent] = useState("");
  const [filterInterest, setFilterInterest] = useState("");
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [showSuperLike, setShowSuperLike] = useState(false);
  const [superLikeNote, setSuperLikeNote] = useState("");
  const [superLikeError, setSuperLikeError] = useState("");
  const [boostActive, setBoostActive] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const loadingMoreRef = useRef(false);
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    fetch("/api/boost").then((r) => r.json() as Promise<{ active: boolean }>).then((d) => setBoostActive(d.active)).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/discover?limit=20")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ profiles: Profile[] }>;
      })
      .then((d) => {
        if (d.profiles.length > 0) {
          setProfiles(d.profiles);
          setExhausted(d.profiles.length < 20);
        } else {
          setProfiles(PREVIEW_PROFILES);
          setExhausted(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setProfiles(PREVIEW_PROFILES);
        setExhausted(true);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (filterCity && (!p.city || !p.city.toLowerCase().includes(filterCity.toLowerCase()))) return false;
      if (filterRole && p.roleType !== filterRole) return false;
      if (filterIntent && !p.intent.includes(filterIntent)) return false;
      if (filterInterest && (!p.interests || !p.interests.some((i) => i.toLowerCase().includes(filterInterest.toLowerCase())))) return false;
      if (filterVerifiedOnly && !p.photos.some((ph) => ph.verified)) return false;
      return true;
    });
  }, [profiles, filterCity, filterRole, filterIntent, filterInterest, filterVerifiedOnly]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const p of profiles) {
      if (p.city) set.add(p.city);
    }
    return Array.from(set).sort();
  }, [profiles]);

  // Auto-fetch more profiles when running low
  useEffect(() => {
    const remaining = filtered.length - index;
    if (remaining > 5 || loadingMoreRef.current || exhausted) return;

    loadingMoreRef.current = true;
    fetch("/api/discover?limit=20")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ profiles: Profile[] }>;
      })
      .then((d) => {
        if (d.profiles.length === 0) {
          setExhausted(true);
        } else {
          const existingIds = new Set(profiles.map((p) => p.id));
          const newProfiles = d.profiles.filter((p: Profile) => !existingIds.has(p.id));
          if (newProfiles.length === 0) {
            setExhausted(true);
          } else {
            setProfiles((prev) => [...prev, ...newProfiles]);
          }
        }
        loadingMoreRef.current = false;
      })
      .catch(() => { loadingMoreRef.current = false; });
  }, [index, filtered.length, exhausted, profiles]);

  const activeFilters = [filterCity, filterRole, filterIntent, filterInterest, filterVerifiedOnly].filter(Boolean).length;

  const dismissMatch = useCallback(() => setMatchUsername(null), []);

  function haptic(ms = 10) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(ms);
    }
  }

  async function handleLike(isSuper = false, note?: string) {
    const profile = filtered[index];
    if (!profile) return;
    haptic(isSuper ? 25 : 15);

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: profile.id, superLike: isSuper, note }),
      });

      if (res.ok) {
        const data = (await res.json()) as { matched: boolean; conversationId: string | null };
        if (data.matched) {
          haptic(30);
          setMatchUsername(profile.username);
        }
      } else if (isSuper && res.status === 429) {
        const err = (await res.json()) as { error: string };
        setSuperLikeError(err.error);
        return;
      }
    } catch {
      if (Math.random() > 0.5) {
        haptic(30);
        setMatchUsername(profile.username);
      }
    }

    setShowSuperLike(false);
    setSuperLikeNote("");
    setSuperLikeError("");
    setIndex((i) => i + 1);
    setPhotoIndex(0);
  }

  function handlePass() {
    haptic(5);
    setIndex((i) => i + 1);
    setPhotoIndex(0);
  }

  function clearFilters() {
    setFilterCity("");
    setFilterRole("");
    setFilterIntent("");
    setFilterInterest("");
    setFilterVerifiedOnly(false);
    setIndex(0);
  }

  const SWIPE_THRESHOLD = 80;

  function onTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    setSwiping(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    // Only swipe horizontally if not scrolling vertically
    if (dy > Math.abs(dx) && Math.abs(dx) < 20) return;
    setSwipeX(dx);
  }

  function onTouchEnd() {
    if (!touchStartRef.current) return;
    if (swipeX > SWIPE_THRESHOLD) {
      handleLike();
    } else if (swipeX < -SWIPE_THRESHOLD) {
      handlePass();
    }
    setSwipeX(0);
    setSwiping(false);
    touchStartRef.current = null;
  }

  // Mouse drag support for desktop
  function onMouseDown(e: React.MouseEvent) {
    touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    setSwiping(true);

    function onMouseMove(ev: MouseEvent) {
      if (!touchStartRef.current) return;
      setSwipeX(ev.clientX - touchStartRef.current.x);
    }

    function onMouseUp() {
      if (touchStartRef.current) {
        const finalX = swipeX;
        if (finalX > SWIPE_THRESHOLD) {
          handleLike();
        } else if (finalX < -SWIPE_THRESHOLD) {
          handlePass();
        }
      }
      setSwipeX(0);
      setSwiping(false);
      touchStartRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  const swipeRotation = swipeX * 0.1;
  const swipeOpacity = Math.max(0, 1 - Math.abs(swipeX) / 300);

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-6 py-10">
        <div className="skeleton h-8 w-32" />
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
          <div className="skeleton aspect-square w-full" style={{ borderRadius: 0 }} />
          <div className="space-y-3 p-4">
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-full" />
            <div className="flex gap-3 pt-2">
              <div className="skeleton h-12 flex-1" />
              <div className="skeleton h-12 flex-1" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const current = filtered[index];

  if (!current) {
    return (
      <main className="mx-auto max-w-md px-6 py-10 text-center">
        <h1 className="text-2xl font-bold">Descobrir</h1>
        {activeFilters > 0 ? (
          <>
            <p className="mt-4 text-zinc-500">Nenhum perfil com esses filtros.</p>
            <button
              onClick={clearFilters}
              className="mt-4 inline-block rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Limpar filtros
            </button>
          </>
        ) : (
          <div className="mt-10" style={{ animation: "slide-up 0.5s ease-out" }}>
            <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-200 to-pink-200 opacity-50 blur-xl" />
              <div className="animate-float relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-pink-100">
                <svg className="h-16 w-16 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.502-4.688-4.502-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.748 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <svg className="animate-float-delayed absolute -right-2 -top-1 h-6 w-6 text-pink-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <svg className="animate-float absolute -left-3 top-4 h-4 w-4 text-violet-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <p className="mt-6 text-lg font-semibold text-zinc-700 dark:text-zinc-200">Sem mais perfis por agora</p>
            <p className="mt-1 text-sm text-zinc-400">Volte mais tarde para novas conexoes!</p>
            <Link
              href="/matches"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              Ver seus matches
            </Link>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Descobrir</h1>
        <div className="flex items-center gap-2">
        {/* Boost button */}
        <button
          onClick={async () => {
            setBoostLoading(true);
            const res = await fetch("/api/boost", { method: "POST" });
            if (res.ok) {
              setBoostActive(true);
              setTimeout(() => setBoostActive(false), 30 * 60 * 1000);
            }
            setBoostLoading(false);
          }}
          disabled={boostActive || boostLoading}
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition ${
            boostActive
              ? "border-purple-300 bg-purple-50 text-purple-600"
              : "border-zinc-300 text-zinc-500 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          {boostActive ? "Boost ativo" : "Boost"}
        </button>
        <Link href="/likes" className="flex items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm font-medium text-zinc-500 transition hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          Curtidas
        </Link>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
            showFilters || activeFilters > 0
              ? "border-violet-300 bg-violet-50 text-violet-700"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-50"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filtros
          {activeFilters > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
              {activeFilters}
            </span>
          )}
        </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="space-y-3">
            <div>
              <label htmlFor="filter-city" className="block text-xs font-medium text-zinc-500">Cidade</label>
              <select
                id="filter-city"
                value={filterCity}
                onChange={(e) => { setFilterCity(e.target.value); setIndex(0); }}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              >
                <option value="">Todas</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filter-role" className="block text-xs font-medium text-zinc-500">Papel</label>
              <select
                id="filter-role"
                value={filterRole}
                onChange={(e) => { setFilterRole(e.target.value); setIndex(0); }}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filter-intent" className="block text-xs font-medium text-zinc-500">Busca</label>
              <select
                id="filter-intent"
                value={filterIntent}
                onChange={(e) => { setFilterIntent(e.target.value); setIndex(0); }}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              >
                {INTENT_OPTIONS.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filter-interest" className="block text-xs font-medium text-zinc-500">Interesse</label>
              <input
                id="filter-interest"
                placeholder="Ex: shibari, latex..."
                value={filterInterest}
                onChange={(e) => { setFilterInterest(e.target.value); setIndex(0); }}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="filter-verified"
                checked={filterVerifiedOnly}
                onChange={(e) => { setFilterVerifiedOnly(e.target.checked); setIndex(0); }}
                className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
              />
              <label htmlFor="filter-verified" className="text-xs font-medium text-zinc-500">Apenas com foto verificada</label>
            </div>
          </div>
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="mt-3 text-xs text-violet-600 hover:underline"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      )}

      <div className="mt-4">
        <ProfileCompleteness />
      </div>

      {matchUsername && (
        <MatchCelebration
          username={matchUsername}
          onClose={dismissMatch}
        />
      )}

      <div
        ref={cardRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        className="mt-6 rounded-xl border border-zinc-200 overflow-hidden dark:border-zinc-700 animate-card-enter select-none cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(${swipeX}px) rotate(${swipeRotation}deg)`,
          opacity: swipeOpacity,
          transition: swiping ? "none" : "transform 0.3s ease, opacity 0.3s ease",
        }}
      >
        {/* Swipe indicators */}
        {swipeX > 30 && (
          <div className="absolute left-4 top-4 z-30 rounded-lg border-2 border-green-400 bg-green-400/20 px-3 py-1 text-lg font-bold text-green-400 backdrop-blur" style={{ transform: `rotate(-15deg)` }}>
            CURTIR
          </div>
        )}
        {swipeX < -30 && (
          <div className="absolute right-4 top-4 z-30 rounded-lg border-2 border-red-400 bg-red-400/20 px-3 py-1 text-lg font-bold text-red-400 backdrop-blur" style={{ transform: `rotate(15deg)` }}>
            PASSAR
          </div>
        )}
        {/* Photo Gallery */}
        <div className="relative aspect-[3/4] bg-zinc-200 dark:bg-zinc-800">
          {current.photos.length > 0 ? (
            <>
              <Image
                key={current.photos[photoIndex]?.url}
                src={current.photos[photoIndex]?.url ?? ""}
                alt={`${current.username} — foto ${photoIndex + 1}`}
                fill
                className="object-cover transition-opacity duration-300"
                unoptimized={current.photos[photoIndex]?.url.includes("dicebear") ?? false}
              />
              {/* Tap zones to navigate photos */}
              {current.photos.length > 1 && (
                <>
                  <button
                    aria-label="Foto anterior"
                    className="absolute inset-y-0 left-0 w-1/3 z-10"
                    onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => Math.max(0, i - 1)); }}
                  />
                  <button
                    aria-label="Proxima foto"
                    className="absolute inset-y-0 right-0 w-1/3 z-10"
                    onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => Math.min(current.photos.length - 1, i + 1)); }}
                  />
                </>
              )}
              {/* Photo dots */}
              {current.photos.length > 1 && (
                <div className="absolute top-3 left-1/2 z-20 flex -translate-x-1/2 gap-1">
                  {current.photos.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === photoIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
              {/* Verified badge */}
              {current.photos[photoIndex]?.verified && (
                <div className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-full bg-blue-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow backdrop-blur">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Verificada
                </div>
              )}
              {/* Photo count */}
              {current.photos.length > 1 && (
                <div className="absolute bottom-3 right-3 z-20 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                  {photoIndex + 1} / {current.photos.length}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-200 to-pink-200 text-4xl font-bold text-violet-500">
                {current.username[0]?.toUpperCase()}
              </div>
              <span className="text-xs text-zinc-400">Sem foto</span>
            </div>
          )}
          {/* Gradient overlay at bottom for readability */}
          {current.photos.length > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          )}
          {current.compatibility != null && current.compatibility > 0 && (
            <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold shadow-md backdrop-blur dark:bg-zinc-900/90">
              <svg className="h-3.5 w-3.5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.723.723 0 01-.692 0h-.002z" />
              </svg>
              <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                {current.compatibility}%
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${current.username}`}
              className="text-xl font-bold hover:text-violet-600"
            >
              {current.username}
            </Link>
            {current.premiumTier === "plus" && (
              <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                </svg>
                Plus
              </span>
            )}
            {current.selfieVerified && (
              <span className="flex items-center gap-0.5 rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                Verificado
              </span>
            )}
            {current.roleType && (
              <span className="rounded bg-violet-100 px-2 py-0.5 text-xs text-violet-800">
                {current.roleType}
              </span>
            )}
          </div>
          {(current.displayCity ?? current.city) && (
            <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
              {current.traveling && (
                <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
              {current.displayCity ?? current.city}
              {current.traveling && <span className="text-xs text-blue-500">(viajando)</span>}
            </p>
          )}
          {current.bio && (
            <p className="mt-2 text-sm text-zinc-700 line-clamp-3 dark:text-zinc-300">{current.bio}</p>
          )}
          {current.intent.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {current.intent.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800"
                >
                  {i}
                </span>
              ))}
            </div>
          )}

          {/* Compatibility breakdown */}
          {current.compatibilityBreakdown && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {current.compatibilityBreakdown.complementaryRole && (
                <span className="flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-[11px] font-medium text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" /></svg>
                  Roles complementares
                </span>
              )}
              {current.compatibilityBreakdown.sharedInterests > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                  {current.compatibilityBreakdown.sharedInterests} interesse{current.compatibilityBreakdown.sharedInterests > 1 ? "s" : ""} em comum
                </span>
              )}
              {current.compatibilityBreakdown.sameCity && (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  Mesma cidade
                </span>
              )}
              {current.compatibilityBreakdown.sharedIntents > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974 1.999 1.999 0 01-1.894 1.279H6.084a2 2 0 01-1.414-.586L3.586 14.83A2 2 0 013 13.414V9.768a2 2 0 01.586-1.414l5.828-5.828A2 2 0 0110.828 2H11z" /></svg>
                  Objetivos alinhados
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 pt-0">
          <button
            onClick={handlePass}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-300 py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 active:scale-95 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Passar
          </button>
          <button
            onClick={() => setShowSuperLike(true)}
            className="flex items-center justify-center gap-1 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-600 transition hover:bg-amber-100 active:scale-95 dark:border-amber-500 dark:bg-amber-950/20 dark:text-amber-400"
            title="Super Like com nota"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
            </svg>
          </button>
          <button
            onClick={() => handleLike()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 text-sm font-medium text-white shadow-md transition hover:shadow-lg active:scale-95"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            Curtir
          </button>
        </div>

        {/* Super Like modal */}
        {showSuperLike && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Super Like</h3>
                  <p className="text-xs text-zinc-500">Envie uma nota para {current.username}</p>
                </div>
              </div>
              <textarea
                value={superLikeNote}
                onChange={(e) => setSuperLikeNote(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="O que te chamou atencao nesse perfil?"
                className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-zinc-600 dark:bg-zinc-800"
              />
              <p className="mt-1 text-right text-xs text-zinc-400">{superLikeNote.length}/200</p>
              {superLikeError && <p className="mt-1 text-sm text-red-500">{superLikeError}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => { setShowSuperLike(false); setSuperLikeNote(""); setSuperLikeError(""); }}
                  className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleLike(true, superLikeNote || undefined)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg"
                >
                  Enviar Super Like
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-zinc-400">
        {index + 1} / {filtered.length}
      </p>
    </main>
  );
}
