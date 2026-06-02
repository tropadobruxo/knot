import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scoreCandidate } from "@/lib/discovery/scoring";

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

  // Get viewer's profile for scoring
  const viewer = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      city: true,
      roleType: true,
      intent: true,
      lastActive: true,
      interests: { select: { interestId: true, level: true } },
    },
  });

  // Fetch more candidates than needed, then score and sort
  const fetchLimit = Math.min(limit * 3, 60);

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludeIds) },
      status: "active",
      ageVerified: true,
    },
    take: fetchLimit,
    orderBy: { lastActive: "desc" },
    select: {
      id: true,
      username: true,
      bio: true,
      city: true,
      roleType: true,
      intent: true,
      lastActive: true,
      interests: { select: { interestId: true, level: true } },
      photos: {
        where: { visibility: "public" },
        take: 1,
        orderBy: { order: "asc" },
        select: { url: true },
      },
    },
  });

  // Score and sort by compatibility
  const viewerProfile = viewer ?? { city: null, roleType: null, intent: [], interests: [], lastActive: new Date() };

  const scored = candidates
    .map((c) => ({
      ...c,
      score: scoreCandidate(viewerProfile, c),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json({
    profiles: scored.map((c) => ({
      id: c.id,
      username: c.username,
      bio: c.bio,
      city: c.city,
      roleType: c.roleType,
      intent: c.intent,
      photo: c.photos[0]?.url ?? null,
    })),
  });
}
