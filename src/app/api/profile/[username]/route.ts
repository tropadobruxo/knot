import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPublicProfile } from "@/lib/profile";
import { prisma } from "@/lib/db";
import { scoreCandidateDetailed } from "@/lib/discovery/scoring";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const session = await auth();
  const profile = await getPublicProfile(username, session?.user?.id);

  if (!profile) {
    return NextResponse.json(
      { error: "Perfil não encontrado." },
      { status: 404 },
    );
  }

  // Compute compatibility if viewer is logged in and not viewing own profile
  let compatibility = null;
  if (session?.user?.id && session.user.id !== profile.id) {
    const viewer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        city: true,
        roleType: true,
        intent: true,
        lastActive: true,
        interests: { select: { interestId: true, level: true } },
      },
    });
    if (viewer) {
      const target = await prisma.user.findUnique({
        where: { id: profile.id },
        select: {
          city: true,
          roleType: true,
          intent: true,
          lastActive: true,
          interests: { select: { interestId: true, level: true } },
        },
      });
      if (target) {
        const breakdown = scoreCandidateDetailed(viewer, target);
        compatibility = {
          score: breakdown.score,
          sharedInterests: breakdown.sharedInterests,
          complementaryRole: breakdown.complementaryRole,
          sameCity: breakdown.sameCity,
          sharedIntents: breakdown.sharedIntents,
        };
      }
    }
  }

  return NextResponse.json({ ...profile, compatibility });
}
