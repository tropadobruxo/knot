"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TrustActions } from "@/components/trust-actions";

interface EventComment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; image: string | null };
}

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
  const [comments, setComments] = useState<EventComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json() as Promise<EventDetail>)
      .then(setEvent)
      .catch(() => {});

    fetch(`/api/events/${eventId}/comments`)
      .then((r) => r.json() as Promise<{ comments: EventComment[] }>)
      .then((d) => setComments(d.comments))
      .catch(() => {});
  }, [eventId]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);

    const res = await fetch(`/api/events/${eventId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText.trim() }),
    });

    if (res.ok) {
      const comment = (await res.json()) as EventComment;
      setComments((prev) => [...prev, comment]);
      setCommentText("");
    }
    setCommentLoading(false);
  }

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

      {/* Comments */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold">
          Comentarios
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-zinc-400">({comments.length})</span>
          )}
        </h3>

        {/* Comment form */}
        <form onSubmit={handleComment} className="mt-3 flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escreva um comentario..."
            maxLength={2000}
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="submit"
            disabled={commentLoading || !commentText.trim()}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-40"
          >
            {commentLoading ? "..." : "Enviar"}
          </button>
        </form>

        {/* Comment list */}
        {comments.length === 0 && (
          <p className="mt-4 text-sm text-zinc-400">Nenhum comentario ainda. Seja o primeiro!</p>
        )}

        {comments.length > 0 && (
          <div className="mt-4 space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Link href={`/profile/${c.author.username}`} className="flex-shrink-0">
                  {c.author.image ? (
                    <Image
                      src={c.author.image}
                      alt={c.author.username}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                      unoptimized={c.author.image.includes("dicebear") || c.author.image.includes("randomuser")}
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                      {c.author.username[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${c.author.username}`} className="text-sm font-medium hover:text-violet-600">
                      {c.author.username}
                    </Link>
                    <span className="text-xs text-zinc-400">
                      {new Date(c.createdAt).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report event */}
      <div className="mt-6 border-t border-zinc-200 pt-4">
        <p className="text-xs text-zinc-400">Algo errado com este evento?</p>
        <TrustActions targetId={eventId} targetType="event" />
      </div>
    </main>
  );
}
