"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

type RoleType = "dom" | "sub" | "switch" | "exploring";
type IntentType = "relacionamento" | "amizade" | "aprender" | "casual";

interface OnboardingData {
  photoPlaceholder: boolean;
  bio: string;
  city: string;
  roleType: RoleType | null;
  intents: IntentType[];
}

const ROLES: { value: RoleType; label: string; emoji: string; desc: string }[] = [
  { value: "dom", label: "Dominante", emoji: "\u2B50", desc: "Lidera cenas e dinamicas" },
  { value: "sub", label: "Submisso(a)", emoji: "\uD83D\uDC9C", desc: "Entrega controle com confianca" },
  { value: "switch", label: "Switch", emoji: "\uD83D\uDD00", desc: "Alterna entre papeis" },
  { value: "exploring", label: "Explorando", emoji: "\uD83C\uDF0D", desc: "Descobrindo o que curte" },
];

const INTENTS: { value: IntentType; label: string; color: string }[] = [
  { value: "relacionamento", label: "Relacionamento", color: "from-pink-500 to-rose-500" },
  { value: "amizade", label: "Amizade", color: "from-emerald-500 to-teal-500" },
  { value: "aprender", label: "Aprender", color: "from-blue-500 to-indigo-500" },
  { value: "casual", label: "Casual", color: "from-amber-500 to-orange-500" },
];

const STEP_ICONS: { path: string; gradient: string }[] = [
  {
    path: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    path: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    path: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    path: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const STEP_TITLES = [
  "Bem-vindo ao Knot",
  "Sobre voce",
  "Seu papel",
  "Pronto!",
];

const BIO_MAX_LENGTH = 500;
const TOTAL_STEPS = 4;

async function patchProfile(data: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({ error: "Erro ao salvar." }))) as { error?: string };
      return { ok: false, error: body.error ?? "Erro ao salvar." };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Erro de conexao. Tente novamente." };
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState<OnboardingData>({
    photoPlaceholder: false,
    bio: "",
    city: "",
    roleType: null,
    intents: [],
  });

  const updateData = useCallback(<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleIntent = useCallback((intent: IntentType) => {
    setData((prev) => ({
      ...prev,
      intents: prev.intents.includes(intent)
        ? prev.intents.filter((i) => i !== intent)
        : [...prev.intents, intent],
    }));
  }, []);

  async function saveAndAdvance() {
    setSaving(true);
    setError("");

    let payload: Record<string, unknown> = {};

    if (currentStep === 0) {
      payload = { photoUploaded: data.photoPlaceholder };
    } else if (currentStep === 1) {
      payload = { bio: data.bio, city: data.city };
    } else if (currentStep === 2) {
      payload = { roleType: data.roleType, intent: data.intents };
    }

    if (currentStep < 3) {
      const result = await patchProfile(payload);
      setSaving(false);

      if (!result.ok) {
        setError(result.error ?? "Erro ao salvar.");
        return;
      }
    } else {
      setSaving(false);
    }

    if (currentStep < TOTAL_STEPS - 1) {
      setDirection("forward");
      setCurrentStep((s) => s + 1);
    }
  }

  function goBack() {
    setError("");
    setDirection("backward");
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  function handleFinish() {
    router.push("/discover");
  }

  const canAdvance = (): boolean => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return data.bio.trim().length > 0 && data.city.trim().length > 0;
    if (currentStep === 2) return data.roleType !== null && data.intents.length > 0;
    return true;
  };

  const animationClass =
    direction === "forward"
      ? "animate-[slideInRight_0.35s_ease-out]"
      : "animate-[slideInLeft_0.35s_ease-out]";

  const stepIcon = STEP_ICONS[currentStep] ?? STEP_ICONS[0]!;

  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-6 py-8 dark:bg-zinc-950">
      {/* Decorative background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-violet-200 opacity-30 blur-3xl dark:bg-violet-900 dark:opacity-20" />
        <div className="absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-pink-200 opacity-30 blur-3xl dark:bg-pink-900 dark:opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Passo {currentStep + 1} de {TOTAL_STEPS}
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {STEP_TITLES[currentStep]}
          </span>
        </div>
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step icon */}
        <div className="mb-6 flex justify-center">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${stepIcon.gradient} shadow-lg`}
          >
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={stepIcon.path} />
            </svg>
          </div>
        </div>

        {/* Step content with animation */}
        <div key={currentStep} className={animationClass}>
          {/* Step 1: Photo */}
          {currentStep === 0 && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Bem-vindo ao Knot
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Adicione uma foto para que outros membros possam te conhecer.
              </p>

              <button
                type="button"
                onClick={() => updateData("photoPlaceholder", !data.photoPlaceholder)}
                className={`mx-auto mt-8 flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                  data.photoPlaceholder
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                    : "border-zinc-300 hover:border-violet-400 dark:border-zinc-700 dark:hover:border-violet-600"
                }`}
              >
                {data.photoPlaceholder ? (
                  <>
                    <svg
                      className="h-12 w-12 text-violet-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="mt-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                      Foto selecionada
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-12 w-12 text-zinc-400 dark:text-zinc-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                    <span className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      Toque para adicionar foto
                    </span>
                  </>
                )}
              </button>

              <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
                Voce pode pular este passo e adicionar depois.
              </p>
            </div>
          )}

          {/* Step 2: Bio + City */}
          {currentStep === 1 && (
            <div>
              <h1 className="text-center text-2xl font-bold text-zinc-900 dark:text-white">
                Sobre voce
              </h1>
              <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Conte um pouco sobre quem voce e e o que busca.
              </p>

              <div className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="bio"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    maxLength={BIO_MAX_LENGTH}
                    value={data.bio}
                    onChange={(e) => updateData("bio", e.target.value)}
                    placeholder="Ex: Curto shibari, workshops e conexoes genuinas..."
                    className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
                  />
                  <p className="mt-1 text-right text-xs text-zinc-400 dark:text-zinc-500">
                    {data.bio.length}/{BIO_MAX_LENGTH}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Cidade
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={data.city}
                    onChange={(e) => updateData("city", e.target.value)}
                    placeholder="Ex: Sao Paulo"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Role + Intent */}
          {currentStep === 2 && (
            <div>
              <h1 className="text-center text-2xl font-bold text-zinc-900 dark:text-white">
                Seu papel
              </h1>
              <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Pode mudar depois nas configuracoes.
              </p>

              <div className="mt-6 grid gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => updateData("roleType", r.value)}
                    className={`flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition active:scale-[0.98] ${
                      data.roleType === r.value
                        ? "border-violet-500 bg-violet-50 shadow-md dark:bg-violet-950/30"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-lg ${
                        data.roleType === r.value
                          ? "bg-violet-500 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800"
                      }`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={
                            r.value === "dom"
                              ? "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                              : r.value === "sub"
                                ? "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                : r.value === "switch"
                                  ? "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                                  : "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                          }
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">{r.label}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h2 className="text-center text-lg font-semibold text-zinc-900 dark:text-white">
                  O que voce busca?
                </h2>
                <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  Selecione uma ou mais opcoes.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {INTENTS.map((i) => {
                    const selected = data.intents.includes(i.value);
                    return (
                      <label
                        key={i.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition active:scale-[0.98] ${
                          selected
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                            : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleIntent(i.value)}
                          className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600"
                        />
                        <span
                          className={`text-sm font-medium ${
                            selected
                              ? "text-violet-700 dark:text-violet-300"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {i.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 3 && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Pronto!</h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Seu perfil esta configurado. Aqui esta um resumo:
              </p>

              <div className="mt-8 space-y-4 text-left">
                {/* Photo */}
                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-violet-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Foto</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {data.photoPlaceholder ? "Adicionada" : "Nenhuma (pode adicionar depois)"}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-pink-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Bio</p>
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                      {data.bio || "--"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {data.city || "--"}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Papel</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {ROLES.find((r) => r.value === data.roleType)?.label ?? "--"}
                    </p>
                  </div>
                </div>

                {/* Intents */}
                <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Buscando</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {data.intents.length > 0
                        ? data.intents
                            .map((iv) => INTENTS.find((it) => it.value === iv)?.label ?? iv)
                            .join(", ")
                        : "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex gap-3">
          {currentStep > 0 && currentStep < 3 && (
            <button
              type="button"
              onClick={goBack}
              className="flex-1 rounded-xl border border-zinc-300 py-3.5 font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Voltar
            </button>
          )}

          {currentStep < 3 && (
            <button
              type="button"
              onClick={saveAndAdvance}
              disabled={!canAdvance() || saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Continuar"}
            </button>
          )}

          {currentStep === 3 && (
            <div className="flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={goBack}
                className="w-full rounded-xl border border-zinc-300 py-3.5 font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Voltar e editar
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 py-4 text-lg font-bold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98]"
              >
                Comecar a explorar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </main>
  );
}
