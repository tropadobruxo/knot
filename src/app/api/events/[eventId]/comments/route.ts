import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

interface Params {
  params: Promise<{ eventId: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const [comments, total] = await Promise.all([
    prisma.eventComment.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, username: true, image: true } },
      },
    }),
    prisma.eventComment.count({ where: { eventId } }),
  ]);

  return NextResponse.json({
    comments: comments.reverse(),
    total,
    page,
    pages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { eventId } = await params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Evento nao encontrado." }, { status: 404 });
  }

  const body: unknown = await request.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const comment = await prisma.eventComment.create({
    data: {
      eventId,
      authorId: session.user.id,
      content: parsed.data.content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, username: true, image: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
