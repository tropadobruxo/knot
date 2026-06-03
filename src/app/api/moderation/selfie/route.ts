import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  // Check admin/moderator role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const pending = await prisma.selfieVerification.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: {
      id: true,
      selfieUrl: true,
      gesture: true,
      createdAt: true,
      user: { select: { id: true, username: true, image: true } },
    },
  });

  return NextResponse.json({ verifications: pending });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = (await request.json()) as { id?: string; action?: string; note?: string };

  if (!body.id || !body.action || !["approved", "rejected"].includes(body.action)) {
    return NextResponse.json({ error: "ID e acao (approved/rejected) obrigatorios." }, { status: 400 });
  }

  const verification = await prisma.selfieVerification.findUnique({
    where: { id: body.id },
  });
  if (!verification || verification.status !== "pending") {
    return NextResponse.json({ error: "Verificacao nao encontrada ou ja processada." }, { status: 404 });
  }

  await prisma.selfieVerification.update({
    where: { id: body.id },
    data: {
      status: body.action as "approved" | "rejected",
      reviewNote: body.note ?? null,
      reviewedAt: new Date(),
    },
  });

  if (body.action === "approved") {
    await prisma.user.update({
      where: { id: verification.userId },
      data: { selfieVerified: true, selfieVerifiedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
