import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scoreCandidateDetailed } from "@/lib/discovery/scoring";
import { sendPushToUser } from "@/lib/push";

/**
 * Check for high-compatibility users near the viewer and send push.
 * Called periodically (e.g., via cron or on app open).
 */
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const userId = session.user.id;

  const viewer = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      city: true,
      travelCity: true,
      travelUntil: true,
      roleType: true,
      intent: true,
      lastActive: true,
      interests: { select: { interestId: true, level: true } },
    },
  });

  if (!viewer) {
    return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
  }

  // Use travel city if active
  const travelActive = viewer.travelCity && viewer.travelUntil && new Date(viewer.travelUntil) > new Date();
  const effectiveCity = travelActive ? viewer.travelCity : viewer.city;

  // Gather IDs to exclude
  const [likedByMe, matches, blocks] = await Promise.all([
    prisma.like.findMany({ where: { fromUserId: userId }, select: { toUserId: true } }),
    prisma.match.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      select: { userAId: true, userBId: true },
    }),
    prisma.block.findMany({
      where: { OR: [{ creatorId: userId }, { targetId: userId }] },
      select: { creatorId: true, targetId: true },
    }),
  ]);

  const excludeIds = new Set<string>([userId]);
  for (const l of likedByMe) excludeIds.add(l.toUserId);
  for (const m of matches) { excludeIds.add(m.userAId); excludeIds.add(m.userBId); }
  for (const b of blocks) { excludeIds.add(b.creatorId); excludeIds.add(b.targetId); }

  // Find recent users in same city (active in last 48h)
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludeIds) },
      status: "active",
      lastActive: { gte: twoDaysAgo },
      ...(effectiveCity ? { city: effectiveCity } : {}),
    },
    take: 20,
    orderBy: { lastActive: "desc" },
    select: {
      id: true,
      username: true,
      city: true,
      roleType: true,
      intent: true,
      lastActive: true,
      interests: { select: { interestId: true, level: true } },
    },
  });

  // Score and find high-compat matches (>= 15 raw score)
  const highCompat = candidates
    .map((c) => ({ ...c, breakdown: scoreCandidateDetailed(viewer, c) }))
    .filter((c) => c.breakdown.score >= 15)
    .sort((a, b) => b.breakdown.score - a.breakdown.score)
    .slice(0, 3);

  if (highCompat.length > 0) {
    const top = highCompat[0]!;
    const maxScore = Math.max(1, ...candidates.map((c) => scoreCandidateDetailed(viewer, c).score));
    const pct = Math.round((top.breakdown.score / maxScore) * 100);

    void sendPushToUser(userId, {
      title: "Alta compatibilidade!",
      body: `Alguem com ${pct}% de compatibilidade esta ${effectiveCity ? `em ${effectiveCity}` : "por perto"}. Descubra quem!`,
      url: "/discover",
    });
  }

  return NextResponse.json({
    found: highCompat.length,
    topScore: highCompat[0]?.breakdown.score ?? 0,
  });
}
