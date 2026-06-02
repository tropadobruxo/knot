import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createBillingPortalSession } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "Nenhuma assinatura ativa." }, { status: 400 });
  }

  const url = await createBillingPortalSession(user.stripeCustomerId);
  if (!url) {
    return NextResponse.json({ error: "Pagamento não configurado." }, { status: 503 });
  }

  return NextResponse.json({ url });
}
