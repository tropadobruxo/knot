import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return stripeClient;
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  stripeCustomerId?: string | null,
): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return null;

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: stripeCustomerId ?? undefined,
    customer_email: stripeCustomerId ? undefined : email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/subscription?success=true`,
    cancel_url: `${baseUrl}/premium`,
    metadata: { userId },
  });

  return session.url;
}

export async function createBillingPortalSession(
  customerId: string,
): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/subscription`,
  });

  return session.url;
}
