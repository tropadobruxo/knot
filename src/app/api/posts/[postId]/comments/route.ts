import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCommentSchema, shouldAutoApprovePost } from "@/lib/community";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 50;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { postId, moderationStatus: "approved" },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        content: true,
        moderationStatus: true,
        createdAt: true,
        author: { select: { username: true } },
      },
    }),
    prisma.comment.count({ where: { postId, moderationStatus: "approved" } }),
  ]);

  return NextResponse.json({
    comments,
    total,
    page,
    pages: Math.ceil(total / pageSize),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { groupId: true, group: { select: { moderated: true } } },
  });
  if (!post) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }

  // Must be a member to comment
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: post.groupId, userId: session.user.id } },
  });
  if (!member) {
    return NextResponse.json(
      { error: "Você precisa ser membro do grupo para comentar." },
      { status: 403 },
    );
  }

  const body: unknown = await request.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const autoApprove = shouldAutoApprovePost(post.group.moderated, member.role);

  const comment = await prisma.comment.create({
    data: {
      ...parsed.data,
      postId,
      authorId: session.user.id,
      moderationStatus: autoApprove ? "approved" : "pending",
    },
    select: { id: true, content: true, moderationStatus: true },
  });

  return NextResponse.json(comment, { status: 201 });
}
