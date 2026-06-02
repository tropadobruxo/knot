import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateEventSchema } from "@/lib/events";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      city: true,
      venue: true,
      datetime: true,
      priceCents: true,
      capacity: true,
      safetyInfo: true,
      codeOfConductRequired: true,
      createdAt: true,
      organizer: {
        select: {
          username: true,
          ageVerified: true,
          organizer: { select: { verified: true, bio: true } },
        },
      },
      rsvps: {
        where: { status: "confirmed" },
        select: {
          user: {
            select: { username: true, ageVerified: true },
          },
        },
      },
      _count: { select: { rsvps: true } },
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: "Evento não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ...event,
    rsvpCount: event._count.rsvps,
    attendees: event.rsvps.map((r) => ({
      username: r.user.username,
      ageVerified: r.user.ageVerified,
    })),
    rsvps: undefined,
    _count: undefined,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event || event.organizerId !== session.user.id) {
    return NextResponse.json(
      { error: "Evento não encontrado ou sem permissão." },
      { status: 404 },
    );
  }

  const body: unknown = await request.json();
  const parsed = updateEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.datetime) {
    data.datetime = new Date(parsed.data.datetime);
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data,
    select: { id: true, title: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event || event.organizerId !== session.user.id) {
    return NextResponse.json(
      { error: "Evento não encontrado ou sem permissão." },
      { status: 404 },
    );
  }

  await prisma.event.delete({ where: { id: eventId } });

  return NextResponse.json({ ok: true });
}
