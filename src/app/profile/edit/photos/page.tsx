"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Photo {
  id: string;
  url: string;
  visibility: string;
  order: number;
}

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Pública" },
  { value: "afterMatch", label: "Após match" },
  { value: "private", label: "Privada" },
] as const;

export default function EditPhotosPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newVisibility, setNewVisibility] = useState("public");
  const [loading, setLoading] = useState(false);

  async function addPhoto() {
    if (!newUrl.trim()) return;
    setLoading(true);

    const res = await fetch("/api/profile/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newUrl, visibility: newVisibility }),
    });

    if (res.ok) {
      const photo = (await res.json()) as Photo;
      setPhotos((prev) => [...prev, photo]);
      setNewUrl("");
    }

    setLoading(false);
  }

  async function updateVisibility(id: string, visibility: string) {
    await fetch(`/api/profile/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility }),
    });

    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visibility } : p)),
    );
  }

  async function removePhoto(id: string) {
    await fetch(`/api/profile/photos/${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-bold">Fotos</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Controle quem pode ver cada foto.
      </p>

      <div className="mt-6 space-y-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3"
          >
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-zinc-200">
              <img
                src={photo.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <select
                value={photo.visibility}
                onChange={(e) => updateVisibility(photo.id, e.target.value)}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              >
                {VISIBILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => removePhoto(photo.id)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 rounded-lg border border-zinc-200 p-4">
        <p className="text-sm font-medium">Adicionar foto</p>
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="URL da imagem"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-3">
          <select
            value={newVisibility}
            onChange={(e) => setNewVisibility(e.target.value)}
            className="rounded border border-zinc-300 px-2 py-1 text-sm"
          >
            {VISIBILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={addPhoto}
            disabled={loading || !newUrl.trim()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
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
