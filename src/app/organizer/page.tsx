"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface OrgEvent {
  id: string;
  type: string;
  title: string;
  city: string;
  datetime: string;
  capacity: number | null;
  rsvpCount: number;
}

interface OrganizerData {
  id: string;
  verified: boolean;
  bio: string | null;
  events: OrgEvent[];
}

const TYPE_LABELS: Record<string, string> = {
  munch: "Munch",
  workshop: "Workshop",
  festa: "Festa",
};

export default function OrganizerPage() {
  const [org, setOrg] = useState<OrganizerData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [creating, setCreating] = useState(false);
  const [bio, setBio] = useState("");

  // Create event form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("munch");
  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [datetime, setDatetime] = useState("");
  const [safetyInfo, setSafetyInfo] = useState("");
  const [capacity, setCapacity] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetch("/api/organizer")
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json() as Promise<OrganizerData>;
      })
      .then((data) => {
        if (data) {
          setOrg({ ...data, events: data.events ?? [] });
        }
      })
      .catch(() => setNotFound(true));
  }, []);

  async function handleBecomeOrganizer() {
    setCreating(true);
    const res = await fetch("/api/organizer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
    if (res.ok) {
      window.location.reload();
    }
    setCreating(false);
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title,
        city,
        venue: venue || undefined,
        datetime: new Date(datetime).toISOString(),
        safetyInfo: safetyInfo || undefined,
        capacity: capacity ? Number(capacity) : undefined,
      }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error: string };
      setFormError(data.error);
    } else {
      setShowForm(false);
      setTitle("");
      setCity("");
      setVenue("");
      setDatetime("");
      setSafetyInfo("");
      setCapacity("");
      // Reload organizer data
      const orgRes = await fetch("/api/organizer");
      const orgData = (await orgRes.json()) as OrganizerData;
      setOrg(orgData);
    }

    setFormLoading(false);
  }

  if (notFound) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <h1 className="text-2xl font-bold">Tornar-se organizador</h1>
        <p className="mt-2 text-zinc-600">
          Organizadores podem criar eventos (munches, workshops, festas) na
          plataforma.
        </p>
        <div className="mt-6">
          <label htmlFor="bio" className="block text-sm font-medium">
            Bio do organizador (opcional)
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={1000}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <button
          onClick={handleBecomeOrganizer}
          disabled={creating}
          className="mt-4 rounded-lg bg-violet-600 px-6 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {creating ? "Criando..." : "Criar perfil de organizador"}
        </button>
      </main>
    );
  }

  if (!org) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel do organizador</h1>
          <div className="mt-1 flex items-center gap-2">
            {org.verified ? (
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                Verificado
              </span>
            ) : (
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                Aguardando verificação
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          {showForm ? "Cancelar" : "Criar evento"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateEvent}
          className="mt-6 space-y-4 rounded-lg border border-zinc-200 p-4"
        >
          <h3 className="font-semibold">Novo evento</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="munch">Munch</option>
                <option value="workshop">Workshop</option>
                <option value="festa">Festa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Cidade</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Título</label>
            <input
              type="text"
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Data e hora</label>
              <input
                type="datetime-local"
                required
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Capacidade (opcional)
              </label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Local / Venue (opcional)
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder={
                type === "munch" ? "Obrigatório: local público" : ""
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Informações de segurança
              {type === "munch" && (
                <span className="text-red-500"> *</span>
              )}
            </label>
            <textarea
              value={safetyInfo}
              onChange={(e) => setSafetyInfo(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Regras do local, contato de emergência, protocolos..."
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <button
            type="submit"
            disabled={formLoading}
            className="rounded-lg bg-violet-600 px-6 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {formLoading ? "Criando..." : "Criar evento"}
          </button>
        </form>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Seus eventos</h2>
        {org.events.length === 0 ? (
          <p className="mt-2 text-zinc-500">Nenhum evento criado ainda.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {org.events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-4"
              >
                <div>
                  <span className="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                    {TYPE_LABELS[event.type] ?? event.type}
                  </span>
                  <h3 className="mt-1 font-medium">{event.title}</h3>
                  <p className="text-sm text-zinc-500">
                    {event.city} &middot;{" "}
                    {new Date(event.datetime).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    &middot; {event.rsvpCount} RSVP
                    {event.capacity ? ` / ${event.capacity}` : ""}
                  </p>
                </div>
                <Link
                  href={`/events/${event.id}`}
                  className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50"
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
