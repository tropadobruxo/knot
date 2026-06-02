import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true, premiumTier: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  if (user.premiumTier === "plus") {
    return NextResponse.json({ error: "Já é assinante Plus." }, { status: 400 });
  }

  const url = await createCheckoutSession(
    session.user.id,
    user.email,
    user.stripeCustomerId,
  );

  if (!url) {
    return NextResponse.json(
      { error: "Pagamento não configurado." },
      { status: 503 },
    );
  }

  return NextResponse.json({ url });
}
