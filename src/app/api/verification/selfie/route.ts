import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const GESTURES = [
  "Levante a mao direita",
  "Faca um V com os dedos",
  "Mostre 3 dedos",
  "Aponte para cima",
  "Faca um joinha",
];

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { selfieVerified: true },
  });

  // Check for pending verification
  const pending = await prisma.selfieVerification.findFirst({
    where: { userId: session.user.id, status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  // Pick a random gesture for new attempt
  const gesture = GESTURES[Math.floor(Math.random() * GESTURES.length)]!;

  return NextResponse.json({
    verified: user?.selfieVerified ?? false,
    pending: pending ? { id: pending.id, gesture: pending.gesture, createdAt: pending.createdAt } : null,
    gesture,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { selfieVerified: true },
  });

  if (user?.selfieVerified) {
    return NextResponse.json({ error: "Ja verificado." }, { status: 400 });
  }

  // Check for pending
  const pending = await prisma.selfieVerification.findFirst({
    where: { userId: session.user.id, status: "pending" },
  });
  if (pending) {
    return NextResponse.json({ error: "Voce ja tem uma verificacao pendente." }, { status: 400 });
  }

  const body = (await request.json()) as { selfieUrl?: string; gesture?: string };

  if (!body.selfieUrl || !body.gesture) {
    return NextResponse.json({ error: "Selfie e gesto sao obrigatorios." }, { status: 400 });
  }

  if (body.selfieUrl.length > 500000) {
    return NextResponse.json({ error: "Imagem muito grande." }, { status: 400 });
  }

  const verification = await prisma.selfieVerification.create({
    data: {
      userId: session.user.id,
      selfieUrl: body.selfieUrl,
      gesture: body.gesture,
    },
  });

  return NextResponse.json({ id: verification.id, status: "pending" }, { status: 201 });
}
