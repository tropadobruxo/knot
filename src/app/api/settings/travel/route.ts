import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { city: true, travelCity: true, travelUntil: true },
  });

  // Auto-expire travel mode
  const isActive = user?.travelCity && user?.travelUntil && new Date(user.travelUntil) > new Date();

  return NextResponse.json({
    homeCity: user?.city ?? null,
    travelCity: isActive ? user!.travelCity : null,
    travelUntil: isActive ? user!.travelUntil : null,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as { travelCity?: string; days?: number };

  // Disable travel mode
  if (!body.travelCity) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { travelCity: null, travelUntil: null },
    });
    return NextResponse.json({ ok: true, travelCity: null });
  }

  const city = body.travelCity.trim();
  if (!city || city.length > 100) {
    return NextResponse.json({ error: "Cidade invalida." }, { status: 400 });
  }

  const days = Math.min(30, Math.max(1, body.days ?? 7));
  const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { travelCity: city, travelUntil: until },
  });

  return NextResponse.json({ ok: true, travelCity: city, travelUntil: until });
}
