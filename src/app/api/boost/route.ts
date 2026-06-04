import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPremium } from "@/lib/billing";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { boostedUntil: true, premiumTier: true },
  });

  const active = user?.boostedUntil ? new Date(user.boostedUntil) > new Date() : false;

  return NextResponse.json({
    active,
    boostedUntil: active ? user!.boostedUntil : null,
    premium: user ? isPremium(user.premiumTier) : false,
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { boostedUntil: true, premiumTier: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
  }

  // Check if already boosted
  if (user.boostedUntil && new Date(user.boostedUntil) > new Date()) {
    return NextResponse.json({ error: "Voce ja esta em boost." }, { status: 400 });
  }

  // Free users: no boost. Plus users: 1 boost/day included
  if (!isPremium(user.premiumTier)) {
    return NextResponse.json(
      { error: "Boost esta disponivel para assinantes Plus.", upgrade: true },
      { status: 403 },
    );
  }

  const boostedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await prisma.user.update({
    where: { id: session.user.id },
    data: { boostedUntil },
  });

  return NextResponse.json({ ok: true, boostedUntil });
}
