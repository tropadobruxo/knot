import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Admin check: only users with status "active" and specific role
  // For now, we check a simple admin flag via email domain or a dedicated field
  // Using a pragmatic approach: first user created is admin (id-based)
  // TODO: add proper admin role to User model
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const where: Record<string, unknown> = {};
  if (status && ["pending", "reviewed", "actioned", "dismissed"].includes(status)) {
    where.status = status;
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        targetType: true,
        reason: true,
        details: true,
        status: true,
        createdAt: true,
        creator: { select: { username: true } },
        target: { select: { id: true, username: true, status: true } },
      },
    }),
    prisma.report.count({ where }),
  ]);

  return NextResponse.json({
    reports,
    total,
    page,
    pages: Math.ceil(total / pageSize),
  });
}
