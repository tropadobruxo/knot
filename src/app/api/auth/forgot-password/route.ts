import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email/templates";
import { authLimiter, checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateLimited = await checkRateLimit(authLimiter, `forgot:${ip}`);
  if (rateLimited) return rateLimited;

  const body: unknown = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  // Always return 200 to prevent user enumeration
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, username: true },
  });

  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    void sendEmail(
      email,
      "Redefinir senha — Knot",
      passwordResetEmail(user.username, token, baseUrl),
    );
  }

  return NextResponse.json({ ok: true });
}
