import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const rsvps = await prisma.rsvp.findMany({
    where: { eventId, status: "confirmed" },
    select: {
      id: true,
      status: true,
      user: {
        select: { username: true, ageVerified: true },
      },
    },
  });

  // Never expose email or coordinates
  return NextResponse.json(
    rsvps.map((r) => ({
      id: r.id,
      status: r.status,
      username: r.user.username,
      ageVerified: r.user.ageVerified,
    })),
  );
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { eventId } = await params;
  const userId = session.user.id;

  // Check user accepted code of conduct
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { codeOfConductAcceptedAt: true },
  });

  if (!user?.codeOfConductAcceptedAt) {
    return NextResponse.json(
      { error: "Você precisa aceitar o código de conduta antes de confirmar presença." },
      { status: 403 },
    );
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, capacity: true, _count: { select: { rsvps: true } } },
  });

  if (!event) {
    return NextResponse.json(
      { error: "Evento não encontrado." },
      { status: 404 },
    );
  }

  // Check if already RSVP'd
  const existing = await prisma.rsvp.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Você já confirmou presença neste evento.", rsvp: existing },
      { status: 409 },
    );
  }

  // Determine status based on capacity
  const confirmedCount = event._count.rsvps;
  const status =
    event.capacity && confirmedCount >= event.capacity
      ? "waitlisted"
      : "confirmed";

  const rsvp = await prisma.rsvp.create({
    data: { eventId, userId, status },
    select: { id: true, status: true },
  });

  return NextResponse.json(rsvp, { status: 201 });
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
  const userId = session.user.id;

  const rsvp = await prisma.rsvp.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

  if (!rsvp) {
    return NextResponse.json(
      { error: "RSVP não encontrado." },
      { status: 404 },
    );
  }

  await prisma.rsvp.delete({
    where: { eventId_userId: { eventId, userId } },
  });

  return NextResponse.json({ ok: true });
}
