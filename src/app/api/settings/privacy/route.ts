import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const privacySchema = z.object({
  discreetMode: z.boolean().optional(),
  secretProfile: z.boolean().optional(),
  trustedContactName: z.string().max(120).optional(),
  trustedContactEmail: z.string().email().or(z.literal("")).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      discreetMode: true,
      secretProfile: true,
      trustedContactName: true,
      trustedContactEmail: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = privacySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.discreetMode !== undefined)
    data.discreetMode = parsed.data.discreetMode;
  if (parsed.data.secretProfile !== undefined)
    data.secretProfile = parsed.data.secretProfile;
  if (parsed.data.trustedContactName !== undefined)
    data.trustedContactName = parsed.data.trustedContactName.trim() || null;
  if (parsed.data.trustedContactEmail !== undefined)
    data.trustedContactEmail = parsed.data.trustedContactEmail.trim() || null;

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  return NextResponse.json({ ok: true });
}
