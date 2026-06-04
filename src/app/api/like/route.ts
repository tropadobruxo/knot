import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createLikeSchema, validateLike } from "@/lib/discovery";
import { likeLimiter, checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { matchNotificationEmail } from "@/lib/email/templates";
import { sendPushToUser } from "@/lib/push";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const rateLimited = await checkRateLimit(likeLimiter, session.user.id);
  if (rateLimited) return rateLimited;

  const body: unknown = await request.json();
  const parsed = createLikeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { targetId, superLike, note } = parsed.data;
  const userId = session.user.id;

  const error = validateLike(userId, targetId);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  // Super like: 1/day free, unlimited for Plus
  if (superLike) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { premiumTier: true, lastSuperLikeAt: true },
    });
    const isPremiumUser = user?.premiumTier !== "free";
    if (!isPremiumUser && user?.lastSuperLikeAt) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (user.lastSuperLikeAt > dayAgo) {
        return NextResponse.json(
          { error: "Voce ja usou seu super like hoje. Assine Plus para ilimitados!", upgrade: true },
          { status: 429 },
        );
      }
    }
    await prisma.user.update({
      where: { id: userId },
      data: { lastSuperLikeAt: new Date() },
    });
  }

  // Check target exists and is active
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, status: true },
  });
  if (!target || target.status !== "active") {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  // Check not blocked
  const blocked = await prisma.block.findFirst({
    where: {
      OR: [
        { creatorId: userId, targetId },
        { creatorId: targetId, targetId: userId },
      ],
    },
  });
  if (blocked) {
    return NextResponse.json({ error: "Ação não permitida." }, { status: 403 });
  }

  // Upsert like
  await prisma.like.upsert({
    where: { fromUserId_toUserId: { fromUserId: userId, toUserId: targetId } },
    create: { fromUserId: userId, toUserId: targetId, superLike: !!superLike, note: superLike ? (note?.slice(0, 200) ?? null) : null },
    update: { superLike: !!superLike, note: superLike ? (note?.slice(0, 200) ?? null) : null },
  });

  // Check for mutual like → create match
  const reciprocal = await prisma.like.findUnique({
    where: { fromUserId_toUserId: { fromUserId: targetId, toUserId: userId } },
  });

  let matched = false;
  let conversationId: string | null = null;

  if (reciprocal) {
    // Check if match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { userAId: userId, userBId: targetId },
          { userAId: targetId, userBId: userId },
        ],
      },
    });

    if (!existingMatch) {
      const [userA, userB] = userId < targetId ? [userId, targetId] : [targetId, userId];

      const match = await prisma.match.create({
        data: { userAId: userA, userBId: userB },
      });

      const conversation = await prisma.conversation.create({
        data: { matchId: match.id },
      });

      matched = true;
      conversationId = conversation.id;

      // Send match notifications (non-blocking)
      const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const [me, them] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { username: true, email: true } }),
        prisma.user.findUnique({ where: { id: targetId }, select: { username: true, email: true } }),
      ]);
      if (me && them) {
        void sendEmail(them.email, "Novo match no Knot!", matchNotificationEmail(them.username, me.username, baseUrl));
        void sendEmail(me.email, "Novo match no Knot!", matchNotificationEmail(me.username, them.username, baseUrl));
        void sendPushToUser(targetId, { title: "Novo match!", body: `Você e ${me.username} deram match!`, url: "/matches" });
        void sendPushToUser(userId, { title: "Novo match!", body: `Você e ${them.username} deram match!`, url: "/matches" });
      }
    }
  }

  return NextResponse.json({ liked: true, matched, conversationId });
}
