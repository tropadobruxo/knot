import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPremium } from "@/lib/billing";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { premiumTier: true },
  });

  if (!user || !isPremium(user.premiumTier)) {
    return NextResponse.json(
      {
        error: "Recurso exclusivo do plano Plus.",
        upgrade: true,
      },
      { status: 403 },
    );
  }

  const likes = await prisma.like.findMany({
    where: { toUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      createdAt: true,
      fromUser: {
        select: {
          id: true,
          username: true,
          city: true,
          roleType: true,
          photos: {
            where: { visibility: "public" },
            take: 1,
            orderBy: { order: "asc" },
            select: { url: true },
          },
        },
      },
    },
  });

  return NextResponse.json({
    likes: likes.map((l) => ({
      createdAt: l.createdAt,
      user: {
        ...l.fromUser,
        photo: l.fromUser.photos[0]?.url ?? null,
        photos: undefined,
      },
    })),
  });
}
