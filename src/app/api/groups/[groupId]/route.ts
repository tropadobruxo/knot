import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateGroupSchema } from "@/lib/community";
import { canManageGroup } from "@/lib/community";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      description: true,
      city: true,
      moderated: true,
      createdAt: true,
      _count: { select: { members: true, posts: true } },
      members: {
        take: 20,
        orderBy: { joinedAt: "asc" },
        select: {
          role: true,
          user: { select: { username: true } },
        },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    ...group,
    memberCount: group._count.members,
    postCount: group._count.posts,
    _count: undefined,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { groupId } = await params;

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });
  if (!member || !canManageGroup(member.role)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body: unknown = await request.json();
  const parsed = updateGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.group.update({
    where: { id: groupId },
    data: parsed.data,
    select: { id: true, name: true },
  });

  return NextResponse.json(updated);
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

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });
  if (!member || member.role !== "admin") {
    return NextResponse.json({ error: "Apenas admin pode excluir o grupo." }, { status: 403 });
  }

  await prisma.group.delete({ where: { id: groupId } });

  return NextResponse.json({ deleted: true });
}
