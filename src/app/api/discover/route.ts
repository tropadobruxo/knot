import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = request.nextUrl;
  const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") ?? "10")));

  // Gather IDs to exclude
  const [likedByMe, matches, blockedByMe, blockedMe] = await Promise.all([
    prisma.like.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true },
    }),
    prisma.match.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      select: { userAId: true, userBId: true },
    }),
    prisma.block.findMany({
      where: { creatorId: userId },
      select: { targetId: true },
    }),
    prisma.block.findMany({
      where: { targetId: userId },
      select: { creatorId: true },
    }),
  ]);

  const excludeIds = new Set<string>();
  excludeIds.add(userId);
  for (const l of likedByMe) excludeIds.add(l.toUserId);
  for (const m of matches) {
    excludeIds.add(m.userAId);
    excludeIds.add(m.userBId);
  }
  for (const b of blockedByMe) excludeIds.add(b.targetId);
  for (const b of blockedMe) excludeIds.add(b.creatorId);

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludeIds) },
      status: "active",
      ageVerified: true,
    },
    take: limit,
    orderBy: { lastActive: "desc" },
    select: {
      id: true,
      username: true,
      bio: true,
      city: true,
      roleType: true,
      intent: true,
      photos: {
        where: { visibility: "public" },
        take: 1,
        orderBy: { order: "asc" },
        select: { url: true },
      },
    },
  });

  return NextResponse.json({
    profiles: candidates.map((c) => ({
      ...c,
      photo: c.photos[0]?.url ?? null,
      photos: undefined,
    })),
  });
}
