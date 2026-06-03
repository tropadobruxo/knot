import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createGroupSchema } from "@/lib/community";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const city = searchParams.get("city");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const where: Record<string, unknown> = {};
  if (city) where.city = city;

  const [groups, total] = await Promise.all([
    prisma.group.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        description: true,
        city: true,
        moderated: true,
        createdAt: true,
        _count: { select: { members: true, posts: true } },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.group.count({ where }),
  ]);

  return NextResponse.json({
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      city: g.city,
      moderated: g.moderated,
      createdAt: g.createdAt,
      memberCount: g._count.members,
      postCount: g._count.posts,
      lastPostAt: g.posts[0]?.createdAt ?? null,
    })),
    total,
    page,
    pages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const group = await prisma.group.create({
    data: parsed.data,
    select: { id: true, name: true },
  });

  // Creator becomes admin
  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: session.user.id,
      role: "admin",
    },
  });

  return NextResponse.json(group, { status: 201 });
}
