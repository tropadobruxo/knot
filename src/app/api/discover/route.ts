import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scoreCandidate } from "@/lib/discovery/scoring";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const { searchParams } = request.nextUrl;
  const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") ?? "10")));

  // Public (unauthenticated) mode — show limited profiles without scoring
  if (!userId) {
    const profiles = await prisma.user.findMany({
      where: { status: "active", ageVerified: true },
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
          take: 5,
          orderBy: { order: "asc" },
          select: { url: true, verified: true },
        },
      },
    });

    return NextResponse.json({
      profiles: profiles.map((c) => ({
        id: c.id,
        username: c.username,
        bio: c.bio,
        city: c.city,
        roleType: c.roleType,
        intent: c.intent,
        photos: c.photos.map((p) => ({ url: p.url, verified: p.verified })),
        compatibility: null,
        premiumTier: "free",
        interests: [],
      })),
    });
  }

  // Authenticated mode — full scoring and filtering

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
      premiumTier: true,
      lastActive: true,
      interests: { select: { interestId: true, level: true, interest: { select: { name: true } } } },
      photos: {
        where: { visibility: "public" },
        take: 5,
        orderBy: { order: "asc" },
        select: { url: true, verified: true },
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

  // Compute max score for percentage normalization
  const maxScore = Math.max(1, ...scored.map((c) => c.score));

  return NextResponse.json({
    profiles: scored.map((c) => ({
      id: c.id,
      username: c.username,
      bio: c.bio,
      city: c.city,
      roleType: c.roleType,
      intent: c.intent,
      photos: c.photos.map((p) => ({ url: p.url, verified: p.verified })),
      compatibility: c.score > 0 ? Math.round((c.score / maxScore) * 100) : null,
      premiumTier: c.premiumTier,
      interests: c.interests.map((i) => i.interest.name),
    })),
  });
}
