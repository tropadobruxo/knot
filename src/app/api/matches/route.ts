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
      userA: { select: { id: true, username: true, image: true } },
      userB: { select: { id: true, username: true, image: true } },
      conversation: { select: { id: true } },
    },
  });

  const result = matches.map((m) => {
    const other = m.userA.id === userId ? m.userB : m.userA;
    return {
      matchId: m.id,
      conversationId: m.conversation?.id ?? null,
      createdAt: m.createdAt,
      user: other,
    };
  });

  return NextResponse.json({ matches: result });
}
