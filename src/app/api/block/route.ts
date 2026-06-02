import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createBlockSchema, validateBlock } from "@/lib/trust-safety";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = createBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const error = validateBlock(session.user.id, parsed.data.targetId);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const { targetId } = parsed.data;

  // Check target exists
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  // Upsert block (idempotent)
  await prisma.block.upsert({
    where: {
      creatorId_targetId: {
        creatorId: session.user.id,
        targetId,
      },
    },
    create: { creatorId: session.user.id, targetId },
    update: {},
  });

  // Remove mutual likes and matches
  const userId = session.user.id;
  await prisma.like.deleteMany({
    where: {
      OR: [
        { fromUserId: userId, toUserId: targetId },
        { fromUserId: targetId, toUserId: userId },
      ],
    },
  });

  await prisma.match.deleteMany({
    where: {
      OR: [
        { userAId: userId, userBId: targetId },
        { userAId: targetId, userBId: userId },
      ],
    },
  });

  return NextResponse.json({ blocked: true });
}
