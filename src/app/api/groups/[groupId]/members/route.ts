import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { groupId } = await params;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 });
  }

  // Upsert — idempotent join
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId, userId: session.user.id } },
    create: { groupId, userId: session.user.id, role: "member" },
    update: {},
  });

  return NextResponse.json({ joined: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { groupId } = await params;

  await prisma.groupMember.deleteMany({
    where: { groupId, userId: session.user.id },
  });

  return NextResponse.json({ left: true });
}
