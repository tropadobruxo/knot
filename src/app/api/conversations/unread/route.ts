import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const userId = session.user.id;

  const count = await prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: {
        match: {
          OR: [{ userAId: userId }, { userBId: userId }],
        },
      },
    },
  });

  return NextResponse.json({ count });
}
