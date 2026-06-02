import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authLimiter, checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { welcomeEmail, verificationEmail } from "@/lib/email/templates";

const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateLimited = await checkRateLimit(authLimiter, ip);
  if (rateLimited) return rateLimited;

  const body: unknown = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { username, password } = parsed.data;
  const email = parsed.data.email.toLowerCase().trim();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Email ou pseudônimo já em uso." },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      hashedPassword,
    },
    select: { id: true, username: true },
  });

  // Send verification + welcome emails (non-blocking)
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email.toLowerCase(),
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  void sendEmail(email, "Confirme seu email — Knot", verificationEmail(username, token, baseUrl));
  void sendEmail(email, "Bem-vindo ao Knot!", welcomeEmail(username, baseUrl));

  return NextResponse.json({ user }, { status: 201 });
}
