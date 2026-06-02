import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || !record.identifier.startsWith("reset:") || record.expires < new Date()) {
    return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
  }

  const email = record.identifier.replace("reset:", "");
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { hashedPassword },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ ok: true });
}
