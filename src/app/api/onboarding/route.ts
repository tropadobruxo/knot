import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const onboardingSchema = z.object({
  roleType: z.enum(["dom", "sub", "switch", "exploring"]),
  intent: z
    .array(z.enum(["relacionamento", "amizade", "aprender", "casual"]))
    .min(1),
  codeOfConductAccepted: z.literal(true, {
    error: "É necessário aceitar o código de conduta.",
  }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      roleType: parsed.data.roleType,
      intent: parsed.data.intent,
      codeOfConductAcceptedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
