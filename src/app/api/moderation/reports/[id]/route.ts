import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateReportSchema } from "@/lib/trust-safety";
import type { ModerationAction, UserStatus } from "@/generated/prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  const body: unknown = await request.json();
  const parsed = updateReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const report = await prisma.report.findUnique({
    where: { id },
    select: { id: true, targetId: true, status: true },
  });
  if (!report) {
    return NextResponse.json({ error: "Denúncia não encontrada." }, { status: 404 });
  }

  const { status, action, reason } = parsed.data;

  // Update report status
  const updated = await prisma.report.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });

  // Apply moderation action if provided
  if (action && status === "actioned") {
    const statusMap: Record<string, UserStatus> = {
      warn: "active",
      suspend: "suspended",
      ban: "banned",
    };

    await prisma.$transaction([
      prisma.moderationLog.create({
        data: {
          userId: report.targetId,
          action: action as ModerationAction,
          reason: reason ?? `Ação de moderação: ${action}`,
        },
      }),
      prisma.user.update({
        where: { id: report.targetId },
        data: { status: statusMap[action] ?? "active" },
      }),
    ]);
  }

  return NextResponse.json(updated);
}
