import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createOrganizerSchema = z.object({
  bio: z.string().max(1000).optional(),
});

const updateOrganizerSchema = z.object({
  bio: z.string().max(1000).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const organizer = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      verified: true,
      verifiedAt: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!organizer) {
    return NextResponse.json(
      { error: "Perfil de organizador não encontrado." },
      { status: 404 },
    );
  }

  const events = await prisma.event.findMany({
    where: { organizerId: session.user.id },
    orderBy: { datetime: "desc" },
    select: {
      id: true,
      type: true,
      title: true,
      city: true,
      datetime: true,
      capacity: true,
      _count: { select: { rsvps: true } },
    },
  });

  return NextResponse.json({
    ...organizer,
    events: events.map((e) => ({
      ...e,
      rsvpCount: e._count.rsvps,
      _count: undefined,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const existing = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Você já tem um perfil de organizador." },
      { status: 409 },
    );
  }

  const body: unknown = await request.json();
  const parsed = createOrganizerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const organizer = await prisma.organizer.create({
    data: {
      userId: session.user.id,
      bio: parsed.data.bio,
    },
    select: { id: true, verified: true },
  });

  return NextResponse.json(organizer, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const organizer = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
  });
  if (!organizer) {
    return NextResponse.json(
      { error: "Perfil de organizador não encontrado." },
      { status: 404 },
    );
  }

  const body: unknown = await request.json();
  const parsed = updateOrganizerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.organizer.update({
    where: { userId: session.user.id },
    data: parsed.data,
    select: { id: true, bio: true, verified: true },
  });

  return NextResponse.json(updated);
}
