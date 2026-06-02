"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_EVENTS } from "@/lib/demo-data";

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

const TYPE_COLORS: Record<string, string> = {
  munch: "bg-emerald-100 text-emerald-800",
  workshop: "bg-blue-100 text-blue-800",
  festa: "bg-pink-100 text-pink-800",
};

const TYPE_ICONS: Record<string, string> = {
  munch: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  workshop: "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
  festa: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
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
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<EventsResponse>;
      })
      .then((data) => {
        setEvents(data.events.length > 0 ? data.events : DEMO_EVENTS as unknown as EventSummary[]);
        setPages(data.pages || 1);
      })
      .catch(() => {
        setEvents(DEMO_EVENTS as unknown as EventSummary[]);
        setPages(1);
      });
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
            className="group block rounded-xl border border-zinc-200 p-4 transition hover:border-violet-300 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${TYPE_COLORS[event.type] ?? "bg-zinc-100 text-zinc-600"}`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={TYPE_ICONS[event.type] ?? TYPE_ICONS["munch"]} />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[event.type] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {TYPE_LABELS[event.type] ?? event.type}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold group-hover:text-violet-600">{event.title}</h3>
                  </div>
                  {event.priceCents > 0 ? (
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
                      R$ {(event.priceCents / 100).toFixed(0)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      Grátis
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-500">
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {event.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {new Date(event.datetime).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    {event.rsvpCount}{event.capacity ? `/${event.capacity}` : ""}
                  </span>
                  {event.organizer.organizer?.verified && (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      Verificado
                    </span>
                  )}
                </div>
                {event.capacity && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-zinc-100">
                      <div
                        className="h-1.5 rounded-full bg-violet-400"
                        style={{ width: `${Math.min(100, (event.rsvpCount / event.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
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
