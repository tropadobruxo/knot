import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const userId = session.user.id;

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      userA: { select: { id: true, username: true, image: true, lastActive: true } },
      userB: { select: { id: true, username: true, image: true, lastActive: true } },
      conversation: {
        select: {
          id: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, createdAt: true, senderId: true },
          },
        },
      },
    },
  });

  const now = Date.now();
  const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  const result = matches.map((m) => {
    const other = m.userA.id === userId ? m.userB : m.userA;
    const lastMsg = m.conversation?.messages[0] ?? null;
    const isOnline = other.lastActive ? now - new Date(other.lastActive).getTime() < ONLINE_THRESHOLD : false;

    return {
      matchId: m.id,
      conversationId: m.conversation?.id ?? null,
      createdAt: m.createdAt,
      user: { id: other.id, username: other.username, image: other.image },
      lastMessage: lastMsg ? {
        content: lastMsg.content.length > 60 ? lastMsg.content.slice(0, 60) + "..." : lastMsg.content,
        createdAt: lastMsg.createdAt,
        isMe: lastMsg.senderId === userId,
      } : null,
      isOnline,
    };
  });

  return NextResponse.json({ matches: result });
}
