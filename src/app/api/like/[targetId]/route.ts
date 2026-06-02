import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ targetId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { targetId } = await params;

  await prisma.like.deleteMany({
    where: { fromUserId: session.user.id, toUserId: targetId },
  });

  return NextResponse.json({ unliked: true });
}
