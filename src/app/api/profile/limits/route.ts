import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const limitsSchema = z.object({
  limits: z.array(
    z.object({
      description: z.string().min(1).max(300),
      type: z.enum(["hard", "soft"]),
    }),
  ),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const limits = await prisma.limit.findMany({
    where: { userId: session.user.id },
    select: { id: true, description: true, type: true },
  });

  return NextResponse.json(limits);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = limitsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = session.user.id;

  // Replace all limits
  await prisma.$transaction([
    prisma.limit.deleteMany({ where: { userId } }),
    ...parsed.data.limits.map(({ description, type }) =>
      prisma.limit.create({ data: { userId, description, type } }),
    ),
  ]);

  const updated = await prisma.limit.findMany({ where: { userId } });

  return NextResponse.json(updated);
}
