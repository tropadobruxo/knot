import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteContext {
  params: Promise<{ groupId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { groupId } = await context.params;

  // Verify membership
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });
  if (!member) {
    return NextResponse.json({ error: "Voce nao e membro deste grupo." }, { status: 403 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor");
  const take = 50;

  const messages = await prisma.groupMessage.findMany({
    where: { groupId },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      content: true,
      createdAt: true,
      sender: { select: { id: true, username: true, image: true } },
    },
  });

  return NextResponse.json({
    messages: messages.reverse(),
    nextCursor: messages.length === take ? messages[0]?.id : null,
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { groupId } = await context.params;

  // Verify membership
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });
  if (!member) {
    return NextResponse.json({ error: "Voce nao e membro deste grupo." }, { status: 403 });
  }

  const body = (await request.json()) as { content?: string };
  const content = body.content?.trim();

  if (!content || content.length > 5000) {
    return NextResponse.json({ error: "Mensagem invalida (1-5000 caracteres)." }, { status: 400 });
  }

  const message = await prisma.groupMessage.create({
    data: {
      groupId,
      senderId: session.user.id,
      content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      sender: { select: { id: true, username: true, image: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}
