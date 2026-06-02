import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendMessageSchema } from "@/lib/discovery";
import { messageLimiter, checkRateLimit } from "@/lib/rate-limit";
import { sendPushToUser } from "@/lib/push";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const rateLimited = await checkRateLimit(messageLimiter, session.user.id);
  if (rateLimited) return rateLimited;

  const { conversationId } = await params;
  const userId = session.user.id;

  // Verify conversation exists and user is a participant
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

  const body: unknown = await request.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content: parsed.data.content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      sender: { select: { username: true } },
    },
  });

  // Send push to the other user
  const recipientId = conversation.match.userAId === userId
    ? conversation.match.userBId
    : conversation.match.userAId;
  void sendPushToUser(recipientId, {
    title: "Nova mensagem",
    body: parsed.data.content.slice(0, 100),
    url: `/chat/${conversationId}`,
  });

  return NextResponse.json(message, { status: 201 });
}
