import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { id } = await params;

  const [total, byReason, byStatus, moderationLogs, reports] = await Promise.all([
    prisma.report.count({ where: { targetId: id } }),
    prisma.report.groupBy({
      by: ["reason"],
      where: { targetId: id },
      _count: { reason: true },
      orderBy: { _count: { reason: "desc" } },
    }),
    prisma.report.groupBy({
      by: ["status"],
      where: { targetId: id },
      _count: { status: true },
    }),
    prisma.moderationLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true, action: true, reason: true, createdAt: true },
    }),
    prisma.report.findMany({
      where: { targetId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        creator: { select: { username: true } },
      },
    }),
  ]);

  // Count distinct reporters — repeated reporters vs many separate ones
  const distinctReporters = new Set(
    (
      await prisma.report.findMany({
        where: { targetId: id },
        select: { creatorId: true },
      })
    ).map((r) => r.creatorId),
  ).size;

  return NextResponse.json({
    targetId: id,
    total,
    distinctReporters,
    byReason: byReason.map((r) => ({ reason: r.reason, count: r._count.reason })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.status })),
    moderationLogs,
    reports,
  });
}
