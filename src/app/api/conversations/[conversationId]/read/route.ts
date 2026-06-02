import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { conversationId } = await params;
  const userId = session.user.id;

  // Verify participation
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { match: { select: { userAId: true, userBId: true } } },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  if (
    conversation.match.userAId !== userId &&
    conversation.match.userBId !== userId
  ) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  // Mark all messages from the other user as read
  const otherUserId = conversation.match.userAId === userId
    ? conversation.match.userBId
    : conversation.match.userAId;

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: otherUserId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
