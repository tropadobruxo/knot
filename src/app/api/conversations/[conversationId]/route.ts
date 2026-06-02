import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { conversationId } = await params;
  const userId = session.user.id;
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 50;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      match: {
        select: {
          userAId: true,
          userBId: true,
          userA: { select: { id: true, username: true } },
          userB: { select: { id: true, username: true } },
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  // Only matched users can access
  if (
    conversation.match.userAId !== userId &&
    conversation.match.userBId !== userId
  ) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const other =
    conversation.match.userA.id === userId
      ? conversation.match.userB
      : conversation.match.userA;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        sender: { select: { username: true } },
      },
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  return NextResponse.json({
    conversationId,
    otherUser: other,
    messages: messages.reverse(),
    total,
    page,
    pages: Math.ceil(total / pageSize),
  });
}
