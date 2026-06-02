import { describe, expect, it } from "vitest";
import {
  createSubscriptionSchema,
  isPremium,
  hasFeature,
  isSecurityFeature,
  calculatePeriod,
  isSubscriptionActive,
  formatPrice,
  canLike,
  FREE_DAILY_LIKES,
  PLUS_PRICE_CENTS,
  SUBSCRIPTION_PERIOD_DAYS,
  ALWAYS_FREE_FEATURES,
  PREMIUM_FEATURES,
} from "@/lib/billing";

describe("isPremium", () => {
  it("plus is premium", () => {
    expect(isPremium("plus")).toBe(true);
  });

  it("free is not premium", () => {
    expect(isPremium("free")).toBe(false);
  });
});

describe("hasFeature", () => {
  it("plus has all premium features", () => {
    for (const f of PREMIUM_FEATURES) {
      expect(hasFeature("plus", f)).toBe(true);
    }
  });

  it("free has no premium features", () => {
    for (const f of PREMIUM_FEATURES) {
      expect(hasFeature("free", f)).toBe(false);
    }
  });
});

describe("security features are ALWAYS free", () => {
  it("block is always free", () => {
    expect(isSecurityFeature("block")).toBe(true);
  });

  it("report is always free", () => {
    expect(isSecurityFeature("report")).toBe(true);
  });

  it("discreet_mode is always free", () => {
    expect(isSecurityFeature("discreet_mode")).toBe(true);
  });

  it("all security features are recognized", () => {
    for (const f of ALWAYS_FREE_FEATURES) {
      expect(isSecurityFeature(f)).toBe(true);
    }
  });

  it("premium feature is not a security feature", () => {
    expect(isSecurityFeature("unlimited_likes")).toBe(false);
    expect(isSecurityFeature("see_who_liked")).toBe(false);
  });
});

describe("calculatePeriod", () => {
  it("returns 30-day period", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const { start: s, end: e } = calculatePeriod(start);
    expect(s.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(e.toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });

  it("period is configurable via constant", () => {
    expect(SUBSCRIPTION_PERIOD_DAYS).toBe(30);
  });
});

describe("isSubscriptionActive", () => {
  it("active subscription within period", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    expect(isSubscriptionActive("active", future)).toBe(true);
  });

  it("active subscription past period", () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    expect(isSubscriptionActive("active", past)).toBe(false);
  });

  it("cancelled subscription", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    expect(isSubscriptionActive("cancelled", future)).toBe(false);
  });
});

describe("formatPrice", () => {
  it("formats cents to BRL", () => {
    expect(formatPrice(2990)).toBe("R$ 29,90");
    expect(formatPrice(0)).toBe("R$ 0,00");
    expect(formatPrice(100)).toBe("R$ 1,00");
  });
});

describe("canLike", () => {
  it("premium can always like", () => {
    expect(canLike("plus", 999)).toEqual({ allowed: true });
  });

  it("free can like under limit", () => {
    expect(canLike("free", 5)).toEqual({ allowed: true });
  });

  it("free blocked at limit", () => {
    const result = canLike("free", FREE_DAILY_LIKES);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Plus");
  });

  it("free blocked over limit", () => {
    expect(canLike("free", FREE_DAILY_LIKES + 5).allowed).toBe(false);
  });
});

describe("createSubscriptionSchema", () => {
  it("accepts plus tier", () => {
    expect(createSubscriptionSchema.safeParse({ tier: "plus" }).success).toBe(true);
  });

  it("rejects free tier", () => {
    expect(createSubscriptionSchema.safeParse({ tier: "free" }).success).toBe(false);
  });

  it("rejects invalid tier", () => {
    expect(createSubscriptionSchema.safeParse({ tier: "pro" }).success).toBe(false);
  });
});

describe("price constant", () => {
  it("plus costs R$ 29,90", () => {
    expect(PLUS_PRICE_CENTS).toBe(2990);
  });
});
