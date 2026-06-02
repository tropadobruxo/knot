import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createSubscriptionSchema,
  calculatePeriod,
  PLUS_PRICE_CENTS,
} from "@/lib/billing";
import { createCheckoutSession, getStripe } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      tier: true,
      status: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      createdAt: true,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { premiumTier: true, stripeCustomerId: true },
  });

  return NextResponse.json({
    subscription,
    currentTier: user?.premiumTier ?? "free",
    hasStripe: !!user?.stripeCustomerId,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Check existing active subscription
  const existing = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (existing?.status === "active") {
    return NextResponse.json(
      { error: "Você já tem uma assinatura ativa." },
      { status: 409 },
    );
  }

  // If Stripe is configured, redirect to Checkout
  if (getStripe() && process.env.STRIPE_PRICE_ID) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, stripeCustomerId: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const url = await createCheckoutSession(
      session.user.id,
      user.email,
      user.stripeCustomerId,
    );
    if (url) {
      return NextResponse.json({ checkoutUrl: url });
    }
  }

  // Fallback: simulate payment (dev/demo mode)
  const body: unknown = await request.json();
  const parsed = createSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { start, end } = calculatePeriod(new Date());

  const subscription = await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      tier: "plus",
      status: "active",
      currentPeriodStart: start,
      currentPeriodEnd: end,
    },
    update: {
      tier: "plus",
      status: "active",
      currentPeriodStart: start,
      currentPeriodEnd: end,
    },
    select: { id: true, tier: true, status: true, currentPeriodEnd: true },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { premiumTier: "plus" },
  });

  return NextResponse.json(
    {
      subscription,
      priceCents: PLUS_PRICE_CENTS,
      message: "Assinatura ativada com sucesso!",
    },
    { status: 201 },
  );
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription || subscription.status !== "active") {
    return NextResponse.json(
      { error: "Nenhuma assinatura ativa." },
      { status: 404 },
    );
  }

  // If Stripe subscription, cancel via Stripe (webhook will handle the rest)
  if (subscription.stripeSubscriptionId) {
    const stripe = getStripe();
    if (stripe) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      return NextResponse.json({
        cancelled: true,
        message: "Assinatura cancelada. Acesso Plus até o fim do período.",
      });
    }
  }

  // Fallback: immediate cancel
  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: { status: "cancelled" },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { premiumTier: "free" },
  });

  return NextResponse.json({
    cancelled: true,
    message: "Assinatura cancelada.",
  });
}
