import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createEventSchema } from "@/lib/events";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const city = searchParams.get("city");
  const type = searchParams.get("type");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const where: Record<string, unknown> = {
    datetime: { gte: new Date() },
  };
  if (city) where.city = city;
  if (type && ["munch", "workshop", "festa"].includes(type)) where.type = type;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { datetime: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        type: true,
        title: true,
        city: true,
        datetime: true,
        priceCents: true,
        capacity: true,
        codeOfConductRequired: true,
        organizer: {
          select: {
            username: true,
            organizer: { select: { verified: true } },
          },
        },
        _count: { select: { rsvps: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({
    events: events.map((e) => ({
      ...e,
      rsvpCount: e._count.rsvps,
      _count: undefined,
    })),
    total,
    page,
    pages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const organizer = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
  });
  if (!organizer) {
    return NextResponse.json(
      { error: "Você precisa ser um organizador para criar eventos." },
      { status: 403 },
    );
  }

  const body: unknown = await request.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const event = await prisma.event.create({
    data: {
      ...parsed.data,
      datetime: new Date(parsed.data.datetime),
      organizerId: session.user.id,
    },
    select: { id: true, title: true, type: true, datetime: true },
  });

  return NextResponse.json(event, { status: 201 });
}
