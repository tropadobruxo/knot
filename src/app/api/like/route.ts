import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createLikeSchema, validateLike } from "@/lib/discovery";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = createLikeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { targetId } = parsed.data;
  const userId = session.user.id;

  const error = validateLike(userId, targetId);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
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
    create: { fromUserId: userId, toUserId: targetId },
    update: {},
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
    }
  }

  return NextResponse.json({ liked: true, matched, conversationId });
}
