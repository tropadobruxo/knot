import { NextRequest, NextResponse } from "next/server";
import type { Prisma, RoleType, IntentType } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scoreCandidateDetailed } from "@/lib/discovery/scoring";

const ROLE_VALUES = ["dom", "sub", "switch", "exploring"];
const INTENT_VALUES = ["relacionamento", "amizade", "aprender", "casual"];

/**
 * Build a Prisma where-fragment from discover filter query params.
 */
function buildFilterWhere(searchParams: URLSearchParams): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  const role = searchParams.get("role");
  if (role && ROLE_VALUES.includes(role)) {
    where.roleType = role as RoleType;
  }

  const intent = searchParams.get("intent");
  if (intent && INTENT_VALUES.includes(intent)) {
    where.intent = { has: intent as IntentType };
  }

  const city = searchParams.get("city");
  if (city && city.trim()) {
    where.city = { contains: city.trim(), mode: "insensitive" };
  }

  const interest = searchParams.get("interest");
  if (interest && interest.trim()) {
    where.interests = {
      some: { interest: { name: { contains: interest.trim(), mode: "insensitive" } } },
    };
  }

  if (searchParams.get("verified") === "1") {
    where.photos = { some: { verified: true } };
  }

  return where;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const { searchParams } = request.nextUrl;
  const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") ?? "10")));
  const filterWhere = buildFilterWhere(searchParams);

  // Public (unauthenticated) mode — show limited profiles without scoring
  if (!userId) {
    const profiles = await prisma.user.findMany({
      where: { status: "active", ageVerified: true, ...filterWhere },
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

  // Get viewer's profile for scoring (use travel city if active)
  const viewer = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      city: true,
      travelCity: true,
      travelUntil: true,
      roleType: true,
      intent: true,
      lastActive: true,
      approxLat: true,
      approxLng: true,
      interests: { select: { interestId: true, level: true } },
    },
  });

  // Use travel city if active
  const travelActive = viewer?.travelCity && viewer?.travelUntil && new Date(viewer.travelUntil) > new Date();
  if (viewer && travelActive) {
    viewer.city = viewer.travelCity;
  }

  // IDs of users the viewer has liked (for secret profile visibility)
  const likedByMeIds = new Set(likedByMe.map((l) => l.toUserId));

  // Fetch more candidates than needed, then score and sort
  const fetchLimit = Math.min(limit * 3, 60);

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludeIds) },
      status: "active",
      ageVerified: true,
      ...filterWhere,
    },
    take: fetchLimit,
    orderBy: { lastActive: "desc" },
    select: {
      id: true,
      username: true,
      bio: true,
      city: true,
      travelCity: true,
      travelUntil: true,
      roleType: true,
      intent: true,
      premiumTier: true,
      selfieVerified: true,
      secretProfile: true,
      boostedUntil: true,
      lastActive: true,
      approxLat: true,
      approxLng: true,
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

  // Filter out secret profile users unless the viewer has liked them
  const visible = candidates.filter((c) => !c.secretProfile || likedByMeIds.has(c.id));

  const scored = visible
    .map((c) => {
      const breakdown = scoreCandidateDetailed(viewerProfile, c);
      return { ...c, ...breakdown };
    })
    .sort((a, b) => {
      // Boosted users appear first
      const aBoosted = a.boostedUntil && new Date(a.boostedUntil) > new Date() ? 1 : 0;
      const bBoosted = b.boostedUntil && new Date(b.boostedUntil) > new Date() ? 1 : 0;
      if (bBoosted !== aBoosted) return bBoosted - aBoosted;
      return b.score - a.score;
    })
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
      compatibilityBreakdown: c.score > 0 ? {
        sharedInterests: c.sharedInterests,
        complementaryRole: c.complementaryRole,
        sameCity: c.sameCity,
        sharedIntents: c.sharedIntents,
        nearby: c.nearby,
        distanceKm: c.distanceKm,
      } : null,
      premiumTier: c.premiumTier,
      selfieVerified: c.selfieVerified,
      traveling: !!(c.travelCity && c.travelUntil && new Date(c.travelUntil) > new Date()),
      displayCity: (c.travelCity && c.travelUntil && new Date(c.travelUntil) > new Date()) ? c.travelCity : c.city,
      interests: c.interests.map((i) => i.interest.name),
    })),
  });
}
