"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EventSummary {
  id: string;
  type: string;
  title: string;
  city: string;
  datetime: string;
  priceCents: number;
  capacity: number | null;
  rsvpCount: number;
  organizer: {
    username: string;
    organizer: { verified: boolean } | null;
  };
}

interface EventsResponse {
  events: EventSummary[];
  total: number;
  page: number;
  pages: number;
}

const TYPE_LABELS: Record<string, string> = {
  munch: "Munch",
  workshop: "Workshop",
  festa: "Festa",
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    params.set("page", String(page));

    fetch(`/api/events?${params.toString()}`)
      .then((r) => r.json() as Promise<EventsResponse>)
      .then((data) => {
        setEvents(data.events);
        setPages(data.pages);
      })
      .catch(() => {});
  }, [city, type, page]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Eventos</h1>
        <Link
          href="/organizer"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Painel organizador
        </Link>
      </div>

      <div className="mt-6 flex gap-3">
        <input
          type="text"
          placeholder="Filtrar por cidade..."
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(1);
          }}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          <option value="munch">Munch</option>
          <option value="workshop">Workshop</option>
          <option value="festa">Festa</option>
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {events.length === 0 && (
          <p className="text-center text-zinc-500">
            Nenhum evento encontrado.
          </p>
        )}
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="block rounded-lg border border-zinc-200 p-4 hover:border-violet-300 hover:bg-violet-50/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                  {TYPE_LABELS[event.type] ?? event.type}
                </span>
                <h3 className="mt-1 text-lg font-semibold">{event.title}</h3>
              </div>
              {event.priceCents > 0 && (
                <span className="text-sm font-medium text-zinc-600">
                  R$ {(event.priceCents / 100).toFixed(2)}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-500">
              <span>{event.city}</span>
              <span>
                {new Date(event.datetime).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>
                {event.rsvpCount} confirmado{event.rsvpCount !== 1 ? "s" : ""}
                {event.capacity ? ` / ${event.capacity} vagas` : ""}
              </span>
              {event.organizer.organizer?.verified && (
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                  Organizador verificado
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1 text-sm text-zinc-500">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </main>
  );
}
