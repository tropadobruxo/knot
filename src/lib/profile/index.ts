import { prisma } from "@/lib/db";

const GEO_PRECISION = 2; // ~1.1km at equator

export function roundCoord(value: number): number {
  return Math.round(value * 10 ** GEO_PRECISION) / 10 ** GEO_PRECISION;
}

export async function getPublicProfile(
  username: string,
  viewerId?: string,
) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      bio: true,
      roleType: true,
      intent: true,
      city: true,
      ageVerified: true,
      ageVerifiedAt: true,
      premiumTier: true,
      discreetMode: true,
      lastActive: true,
      createdAt: true,
      interests: {
        select: {
          level: true,
          interest: { select: { id: true, name: true, category: true } },
        },
      },
      limits: { select: { id: true, description: true } },
      photos: {
        select: {
          id: true,
          url: true,
          visibility: true,
          verified: true,
          order: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!user) return null;

  // Check if viewer has a match with this user
  let hasMatch = false;
  if (viewerId && viewerId !== user.id) {
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { userAId: viewerId, userBId: user.id },
          { userAId: user.id, userBId: viewerId },
        ],
      },
    });
    hasMatch = !!match;
  }
  const isOwner = viewerId === user.id;

  // Filter photos by visibility
  const photos = user.photos.filter((photo) => {
    if (photo.visibility === "public") return true;
    if (photo.visibility === "afterMatch") return isOwner || hasMatch;
    // private: only owner
    return isOwner;
  });

  return {
    id: user.id,
    username: user.username,
    bio: user.bio,
    roleType: user.roleType,
    intent: user.intent,
    city: user.city,
    ageVerified: user.ageVerified,
    premiumTier: user.premiumTier,
    lastActive: user.lastActive,
    createdAt: user.createdAt,
    interests: user.interests.map((ui) => ({
      id: ui.interest.id,
      name: ui.interest.name,
      category: ui.interest.category,
      level: ui.level,
    })),
    limits: user.limits,
    photos: photos.map(({ visibility: _v, ...rest }) => rest),
    // Never expose: email, approxLat, approxLng, hashedPassword
  };
}
