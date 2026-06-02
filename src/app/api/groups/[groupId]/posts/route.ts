import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPostSchema, shouldAutoApprovePost } from "@/lib/community";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params;
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { groupId, moderationStatus: "approved" },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        content: true,
        moderationStatus: true,
        createdAt: true,
        author: { select: { username: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count({ where: { groupId, moderationStatus: "approved" } }),
  ]);

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      commentCount: p._count.comments,
      _count: undefined,
    })),
    total,
    page,
    pages: Math.ceil(total / pageSize),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { groupId } = await params;

  // Must be a member to post
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });
  if (!member) {
    return NextResponse.json(
      { error: "Você precisa ser membro do grupo para postar." },
      { status: 403 },
    );
  }

  const body: unknown = await request.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { moderated: true },
  });

  const autoApprove = shouldAutoApprovePost(group?.moderated ?? true, member.role);

  const post = await prisma.post.create({
    data: {
      ...parsed.data,
      groupId,
      authorId: session.user.id,
      moderationStatus: autoApprove ? "approved" : "pending",
    },
    select: { id: true, title: true, moderationStatus: true },
  });

  return NextResponse.json(post, { status: 201 });
}
