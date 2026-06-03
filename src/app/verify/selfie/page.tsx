"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function SelfieVerificationPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gesture, setGesture] = useState("");
  const [step, setStep] = useState<"loading" | "ready" | "captured" | "pending" | "verified">("loading");
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetch("/api/verification/selfie")
      .then((r) => r.json() as Promise<{ verified: boolean; pending: { gesture: string } | null; gesture: string }>)
      .then((data) => {
        if (data.verified) {
          setStep("verified");
        } else if (data.pending) {
          setGesture(data.pending.gesture);
          setStep("pending");
        } else {
          setGesture(data.gesture);
          setStep("ready");
        }
      })
      .catch(() => setError("Erro ao carregar."));
  }, []);

  useEffect(() => {
    if (step !== "ready") return;
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 480, height: 480 } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => setError("Nao foi possivel acessar a camera."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [step]);

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = 480;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the selfie
    ctx.translate(480, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 480, 480);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setSelfieUrl(dataUrl);
    setStep("captured");
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function retake() {
    setSelfieUrl(null);
    setStep("ready");
  }

  async function submit() {
    if (!selfieUrl) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/verification/selfie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selfieUrl, gesture }),
    });

    if (res.ok) {
      setStep("pending");
    } else {
      const data = (await res.json()) as { error: string };
      setError(data.error);
    }
    setSubmitting(false);
  }

  if (step === "loading") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
      </main>
    );
  }

  if (step === "verified") {
    return (
      <main className="mx-auto max-w-md px-6 py-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold">Verificado!</h1>
        <p className="mt-2 text-sm text-zinc-500">Sua identidade foi confirmada por selfie. O badge aparece no seu perfil.</p>
        <button onClick={() => router.push("/profile/edit")} className="mt-6 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700">
          Ver meu perfil
        </button>
      </main>
    );
  }

  if (step === "pending") {
    return (
      <main className="mx-auto max-w-md px-6 py-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold">Em analise</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sua selfie com o gesto &quot;{gesture}&quot; foi enviada e esta sendo revisada. Voce recebera uma notificacao quando for aprovada.
        </p>
        <button onClick={() => router.back()} className="mt-6 text-sm text-violet-600 hover:underline">
          Voltar
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <button onClick={() => router.back()} className="text-sm text-violet-600 hover:underline">
        &larr; Voltar
      </button>

      <h1 className="mt-4 text-2xl font-bold">Verificacao por selfie</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Para provar que voce e voce, tire uma selfie fazendo o gesto indicado abaixo. Um moderador ira revisar.
      </p>

      {/* Gesture instruction */}
      <div className="mt-6 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 p-4 text-center dark:border-violet-700 dark:bg-violet-950/20">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">Gesto solicitado</p>
        <p className="mt-1 text-lg font-bold text-violet-800 dark:text-violet-200">{gesture}</p>
      </div>

      {step === "ready" && (
        <div className="mt-6">
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <div className="absolute inset-0 rounded-2xl border-4 border-white/30" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <button
            onClick={capture}
            className="mt-4 w-full rounded-xl bg-violet-600 py-3 text-sm font-medium text-white hover:bg-violet-700"
          >
            Tirar selfie
          </button>
        </div>
      )}

      {step === "captured" && selfieUrl && (
        <div className="mt-6">
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selfieUrl} alt="Sua selfie" className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={retake}
              className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Tirar outra
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {submitting ? "Enviando..." : "Enviar para verificacao"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

      <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Como funciona</h3>
        <ul className="mt-2 space-y-1.5 text-xs text-zinc-500">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600">1</span>
            Fazemos um gesto aleatorio para garantir que a foto e ao vivo
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600">2</span>
            Um moderador compara a selfie com suas fotos do perfil
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600">3</span>
            Se aprovado, voce recebe o badge de verificado no perfil
          </li>
        </ul>
      </div>
    </main>
  );
}
