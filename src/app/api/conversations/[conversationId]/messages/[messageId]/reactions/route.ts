import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const ALLOWED_EMOJIS = ["❤️", "😂", "😮", "😢", "🔥", "👍"];

const reactionSchema = z.object({
  emoji: z.string().refine((e) => ALLOWED_EMOJIS.includes(e), "Emoji invalido"),
});

interface Params {
  params: Promise<{ conversationId: string; messageId: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { conversationId, messageId } = await params;
  const body: unknown = await request.json();
  const parsed = reactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Emoji invalido." }, { status: 400 });
  }

  // Verify message belongs to this conversation
  const message = await prisma.message.findFirst({
    where: { id: messageId, conversationId },
  });
  if (!message) {
    return NextResponse.json({ error: "Mensagem nao encontrada." }, { status: 404 });
  }

  // Toggle: if reaction exists, remove it; otherwise, add it
  const existing = await prisma.reaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId,
        userId: session.user.id,
        emoji: parsed.data.emoji,
      },
    },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ action: "removed" });
  }

  const reaction = await prisma.reaction.create({
    data: {
      messageId,
      userId: session.user.id,
      emoji: parsed.data.emoji,
    },
  });

  return NextResponse.json({ action: "added", id: reaction.id }, { status: 201 });
}
