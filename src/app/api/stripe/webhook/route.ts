import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId, premiumTier: "plus" },
      });

      // Get subscription item period from Stripe
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const item = sub.items.data[0];
      const periodStart = item?.current_period_start ?? Math.floor(Date.now() / 1000);
      const periodEnd = item?.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 86400;
      const priceId = item?.price.id;

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          tier: "plus",
          status: "active",
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          currentPeriodStart: new Date(periodStart * 1000),
          currentPeriodEnd: new Date(periodEnd * 1000),
        },
        update: {
          status: "active",
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          currentPeriodStart: new Date(periodStart * 1000),
          currentPeriodEnd: new Date(periodEnd * 1000),
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!existing) break;

      const item = sub.items.data[0];
      const periodStart = item?.current_period_start ?? Math.floor(Date.now() / 1000);
      const periodEnd = item?.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 86400;

      await prisma.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          currentPeriodStart: new Date(periodStart * 1000),
          currentPeriodEnd: new Date(periodEnd * 1000),
          status: sub.cancel_at_period_end ? "cancelled" : "active",
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
        select: { userId: true },
      });
      if (!existing) break;

      await prisma.$transaction([
        prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "expired" },
        }),
        prisma.user.update({
          where: { id: existing.userId },
          data: { premiumTier: "free" },
        }),
      ]);
      break;
    }

    case "invoice.payment_failed": {
      // Extract subscription ID from raw event data
      const invoiceData = event.data.object as unknown as Record<string, unknown>;
      const subId = typeof invoiceData["subscription"] === "string"
        ? invoiceData["subscription"]
        : null;
      if (!subId) break;

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subId },
        data: { status: "expired" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
