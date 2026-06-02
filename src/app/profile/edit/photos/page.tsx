"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PhotoUploader } from "@/components/PhotoUploader";

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

const MAX_PHOTOS = 6;

export default function EditPhotosPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [newVisibility, setNewVisibility] = useState("public");

  useEffect(() => {
    fetch("/api/profile/photos")
      .then((r) => (r.ok ? (r.json() as Promise<{ photos: Photo[] }>) : null))
      .then((d) => { if (d) setPhotos(d.photos); })
      .catch(() => {});
  }, []);

  async function handleUploaded(url: string) {
    const res = await fetch("/api/profile/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, visibility: newVisibility }),
    });

    if (res.ok) {
      const photo = (await res.json()) as Photo;
      setPhotos((prev) => [...prev, photo]);
    }
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
        Controle quem pode ver cada foto. Máximo {MAX_PHOTOS} fotos.
      </p>

      <div className="mt-6 space-y-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3"
          >
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-zinc-200">
              <Image
                src={photo.url}
                alt=""
                fill
                className="object-cover"
                unoptimized
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

      {photos.length < MAX_PHOTOS && (
        <div className="mt-6 space-y-3 rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Visibilidade:</span>
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
          </div>
          <PhotoUploader
            onUploaded={handleUploaded}
            disabled={photos.length >= MAX_PHOTOS}
          />
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="mt-6 text-sm text-violet-600 hover:underline"
      >
        Voltar
      </button>
    </main>
  );
}
