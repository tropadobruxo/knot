import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updatePostSchema, canDeletePost } from "@/lib/community";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      content: true,
      moderationStatus: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { username: true } },
      group: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    ...post,
    commentCount: post._count.comments,
    _count: undefined,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }
  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Apenas o autor pode editar." }, { status: 403 });
  }

  const body: unknown = await request.json();
  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: parsed.data,
    select: { id: true, title: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, groupId: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: post.groupId, userId: session.user.id } },
  });

  if (!canDeletePost(post.authorId, session.user.id, member?.role ?? null)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: postId } });

  return NextResponse.json({ deleted: true });
}
