"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface EventDetail {
  id: string;
  type: string;
  title: string;
  description: string | null;
  city: string;
  venue: string | null;
  datetime: string;
  priceCents: number;
  capacity: number | null;
  safetyInfo: string | null;
  codeOfConductRequired: boolean;
  rsvpCount: number;
  organizer: {
    username: string;
    ageVerified: boolean;
    organizer: { verified: boolean; bio: string | null } | null;
  };
  attendees: { username: string; ageVerified: boolean }[];
}

const TYPE_LABELS: Record<string, string> = {
  munch: "Munch",
  workshop: "Workshop",
  festa: "Festa",
};

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json() as Promise<EventDetail>)
      .then(setEvent)
      .catch(() => {});
  }, [eventId]);

  async function handleRsvp() {
    setRsvpLoading(true);
    setError("");

    const res = await fetch(`/api/events/${eventId}/rsvp`, {
      method: "POST",
    });

    if (!res.ok) {
      const data = (await res.json()) as { error: string };
      setError(data.error);
    } else {
      const data = (await res.json()) as { status: string };
      setRsvpStatus(data.status);
    }

    setRsvpLoading(false);
  }

  async function handleCancelRsvp() {
    setRsvpLoading(true);
    await fetch(`/api/events/${eventId}/rsvp`, { method: "DELETE" });
    setRsvpStatus(null);
    setRsvpLoading(false);
  }

  if (!event) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <button
        onClick={() => router.back()}
        className="text-sm text-violet-600 hover:underline"
      >
        &larr; Voltar
      </button>

      <div className="mt-4">
        <span className="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
          {TYPE_LABELS[event.type] ?? event.type}
        </span>
        <h1 className="mt-2 text-3xl font-bold">{event.title}</h1>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-600">
        <span>{event.city}</span>
        {event.venue && <span>{event.venue}</span>}
        <span>
          {new Date(event.datetime).toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {event.priceCents > 0 && (
          <span className="font-medium">
            R$ {(event.priceCents / 100).toFixed(2)}
          </span>
        )}
      </div>

      {/* Organizer */}
      <div className="mt-6 rounded-lg border border-zinc-200 p-4">
        <p className="text-sm text-zinc-500">Organizador</p>
        <div className="mt-1 flex items-center gap-2">
          <Link
            href={`/profile/${event.organizer.username}`}
            className="font-medium text-violet-600 hover:underline"
          >
            {event.organizer.username}
          </Link>
          {event.organizer.organizer?.verified && (
            <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
              Verificado
            </span>
          )}
        </div>
        {event.organizer.organizer?.bio && (
          <p className="mt-1 text-sm text-zinc-600">
            {event.organizer.organizer.bio}
          </p>
        )}
      </div>

      {event.description && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-zinc-500">Descrição</h3>
          <p className="mt-1 whitespace-pre-wrap text-zinc-700">
            {event.description}
          </p>
        </div>
      )}

      {/* Safety info */}
      {event.safetyInfo && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-medium text-amber-900">
            Informações de segurança
          </h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-amber-800">
            {event.safetyInfo}
          </p>
        </div>
      )}

      {/* Code of conduct */}
      {event.codeOfConductRequired && (
        <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-4">
          <p className="text-sm text-violet-900">
            Este evento exige aceite do código de conduta da plataforma para
            confirmar presença.
          </p>
        </div>
      )}

      {/* RSVP */}
      <div className="mt-6">
        <div className="flex items-center gap-4">
          {rsvpStatus ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-green-600">
                {rsvpStatus === "confirmed"
                  ? "Presença confirmada"
                  : "Na lista de espera"}
              </span>
              <button
                onClick={handleCancelRsvp}
                disabled={rsvpLoading}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={handleRsvp}
              disabled={rsvpLoading}
              className="rounded-lg bg-violet-600 px-6 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {rsvpLoading ? "Confirmando..." : "Confirmar presença"}
            </button>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <p className="mt-2 text-sm text-zinc-500">
          {event.rsvpCount} confirmado{event.rsvpCount !== 1 ? "s" : ""}
          {event.capacity ? ` / ${event.capacity} vagas` : ""}
        </p>
      </div>

      {/* Attendees */}
      {event.attendees.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-zinc-500">Confirmados</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {event.attendees.map((a) => (
              <Link
                key={a.username}
                href={`/profile/${a.username}`}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm hover:bg-zinc-200"
              >
                {a.username}
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
