import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { conversationId } = await context.params;

  // Verify conversation exists and user is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      match: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, content: true, senderId: true, createdAt: true },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversa nao encontrada." }, { status: 404 });
  }

  const { match } = conversation;
  const isParticipant = match.userAId === session.user.id || match.userBId === session.user.id;
  if (!isParticipant) {
    return NextResponse.json({ error: "Voce nao participa desta conversa." }, { status: 403 });
  }

  const otherId = match.userAId === session.user.id ? match.userBId : match.userAId;

  // Load the acting user's trusted contact (set in privacy settings)
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, trustedContactName: true, trustedContactEmail: true },
  });

  // Save last 20 messages as context in the report
  const context_summary = conversation.messages
    .reverse()
    .map((m) => `[${m.senderId === session.user!.id ? "EU" : "OUTRO"}] ${m.content.slice(0, 200)}`)
    .join("\n");

  // 1. Block the other user
  await prisma.block.upsert({
    where: { creatorId_targetId: { creatorId: session.user.id, targetId: otherId } },
    create: { creatorId: session.user.id, targetId: otherId },
    update: {},
  });

  // 2. Remove mutual likes and matches
  await prisma.like.deleteMany({
    where: {
      OR: [
        { fromUserId: session.user.id, toUserId: otherId },
        { fromUserId: otherId, toUserId: session.user.id },
      ],
    },
  });

  // 3. Create report with conversation context (kept for moderation even after deletion)
  const report = await prisma.report.create({
    data: {
      creatorId: session.user.id,
      targetId: otherId,
      targetType: "user",
      reason: "safe_word",
      details: `[SAFE WORD ATIVADA] Contexto da conversa:\n${context_summary}`,
    },
  });

  // 4. Delete the conversation entirely (messages cascade on delete)
  await prisma.conversation.delete({ where: { id: conversationId } });

  // 5. Discreetly alert the trusted contact, if one is configured
  let alertedContact = false;
  if (me?.trustedContactEmail) {
    const contactName = me.trustedContactName?.trim() || "";
    const greeting = contactName ? `Olá ${contactName},` : "Olá,";
    const sent = await sendEmail(
      me.trustedContactEmail,
      "Alerta de segurança",
      `<p>${greeting}</p>
       <p>${me.username} ativou um alerta de segurança no app e indicou você como contato de confiança.</p>
       <p>Considere entrar em contato para confirmar que está tudo bem.</p>
       <p style="color:#888;font-size:12px">Nenhum dado de conversa é compartilhado neste alerta.</p>`,
    );
    alertedContact = sent;
  }

  return NextResponse.json({
    ok: true,
    blocked: true,
    conversationDeleted: true,
    alertedContact,
    reportId: report.id,
  });
}
