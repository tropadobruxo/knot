import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createReportSchema, validateReport } from "@/lib/trust-safety";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { targetId, targetType, reason, details } = parsed.data;

  const error = validateReport(session.user.id, targetId, reason);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  // Check target user exists
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) {
    return NextResponse.json({ error: "Alvo não encontrado." }, { status: 404 });
  }

  const report = await prisma.report.create({
    data: {
      creatorId: session.user.id,
      targetId,
      targetType,
      reason,
      details,
    },
    select: { id: true, status: true },
  });

  return NextResponse.json(report, { status: 201 });
}
