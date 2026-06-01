import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getVerificationProvider } from "@/lib/verification";

const FORBIDDEN_PII_FIELDS = [
  "document",
  "documentNumber",
  "cpf",
  "rg",
  "dateOfBirth",
  "birthDate",
  "identityDoc",
  "fullName",
  "realName",
];

const webhookSchema = z
  .object({
    userId: z.string().min(1),
  })
  .passthrough()
  .refine(
    (data) => !Object.keys(data).some((k) => FORBIDDEN_PII_FIELDS.includes(k)),
    { message: "Payload contém campos de PII proibidos." },
  );

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = webhookSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload inválido.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  let { userId } = parsed.data;

  // Sandbox: resolve "current" to the authenticated user
  if (userId === "current") {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    userId = session.user.id;
  }

  const provider = getVerificationProvider();
  const result = await provider.handleWebhook(body);

  if (result.verified) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ageVerified: true,
        ageVerifiedAt: new Date(),
        verificationToken: result.token,
      },
    });
  }

  return NextResponse.json({ verified: result.verified });
}
