import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const interestsSchema = z.object({
  interests: z.array(
    z.object({
      interestId: z.string().min(1),
      level: z.enum(["curious", "experienced", "hard_yes"]).optional(),
    }),
  ),
});

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = interestsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = session.user.id;

  // Replace all user interests
  await prisma.$transaction([
    prisma.userInterest.deleteMany({ where: { userId } }),
    ...parsed.data.interests.map((i) =>
      prisma.userInterest.create({
        data: {
          userId,
          interestId: i.interestId,
          level: i.level ?? null,
        },
      }),
    ),
  ]);

  const updated = await prisma.userInterest.findMany({
    where: { userId },
    include: { interest: true },
  });

  return NextResponse.json(updated);
}
