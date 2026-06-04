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

  const premium = user ? isPremium(user.premiumTier) : false;

  const likes = await prisma.like.findMany({
    where: { toUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      createdAt: true,
      superLike: true,
      note: true,
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
    premium,
    count: likes.length,
    likes: likes.map((l) => ({
      createdAt: l.createdAt,
      superLike: l.superLike,
      note: premium ? l.note : null,
      user: premium
        ? {
            id: l.fromUser.id,
            username: l.fromUser.username,
            city: l.fromUser.city,
            roleType: l.fromUser.roleType,
            photo: l.fromUser.photos[0]?.url ?? null,
          }
        : {
            id: l.fromUser.id,
            username: null,
            city: null,
            roleType: null,
            photo: l.fromUser.photos[0]?.url ?? null,
          },
    })),
  });
}
