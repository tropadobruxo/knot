import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

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
