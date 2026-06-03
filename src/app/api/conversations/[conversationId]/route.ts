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
        reactions: { select: { emoji: true, userId: true } },
      },
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  const formatted = messages.reverse().map((m) => {
    const grouped = new Map<string, string[]>();
    for (const r of m.reactions) {
      const arr = grouped.get(r.emoji) ?? [];
      arr.push(r.userId);
      grouped.set(r.emoji, arr);
    }
    return {
      ...m,
      reactions: Array.from(grouped.entries()).map(([emoji, userIds]) => ({
        emoji,
        count: userIds.length,
        userIds,
      })),
    };
  });

  return NextResponse.json({
    conversationId,
    otherUser: other,
    messages: formatted,
    total,
    page,
    pages: Math.ceil(total / pageSize),
  });
}
