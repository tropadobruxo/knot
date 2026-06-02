import { z } from "zod";

// ── Constants ───────────────────────────────────

export const PLUS_PRICE_CENTS = 2990; // R$ 29,90/mês
export const SUBSCRIPTION_PERIOD_DAYS = 30;

// ── Premium features ────────────────────────────

export const PREMIUM_FEATURES = [
  "unlimited_likes",
  "see_who_liked",
  "advanced_filters",
  "profile_boost",
] as const;

export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];

// Features that are ALWAYS free — security never behind paywall
export const ALWAYS_FREE_FEATURES = [
  "block",
  "report",
  "discreet_mode",
  "age_verification",
  "code_of_conduct",
  "safety_info",
] as const;

export const FEATURE_LABELS: Record<PremiumFeature, string> = {
  unlimited_likes: "Likes ilimitados",
  see_who_liked: "Ver quem curtiu você",
  advanced_filters: "Filtros avançados de descoberta",
  profile_boost: "Destaque no feed",
};

// ── Schemas ─────────────────────────────────────

export const createSubscriptionSchema = z.object({
  tier: z.literal("plus"),
});

// ── Pure helpers ────────────────────────────────

export function isPremium(tier: string): boolean {
  return tier === "plus";
}

export function hasFeature(tier: string, feature: PremiumFeature): boolean {
  if (!isPremium(tier)) return false;
  return PREMIUM_FEATURES.includes(feature);
}

export function isSecurityFeature(feature: string): boolean {
  return (ALWAYS_FREE_FEATURES as readonly string[]).includes(feature);
}

export function calculatePeriod(startDate: Date): { start: Date; end: Date } {
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setDate(end.getDate() + SUBSCRIPTION_PERIOD_DAYS);
  return { start, end };
}

export function isSubscriptionActive(
  status: string,
  periodEnd: Date,
): boolean {
  if (status !== "active") return false;
  return new Date() < periodEnd;
}

export function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

// Free tier daily like limit
export const FREE_DAILY_LIKES = 10;

export function canLike(
  tier: string,
  likesToday: number,
): { allowed: boolean; reason?: string } {
  if (isPremium(tier)) return { allowed: true };
  if (likesToday >= FREE_DAILY_LIKES) {
    return {
      allowed: false,
      reason: `Limite de ${FREE_DAILY_LIKES} likes por dia. Assine Plus para likes ilimitados.`,
    };
  }
  return { allowed: true };
}
