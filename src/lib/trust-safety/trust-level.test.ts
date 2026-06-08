import { describe, expect, it } from "vitest";
import { computeTrustLevel } from "@/lib/trust-safety";

const base = {
  emailVerified: false,
  ageVerified: false,
  selfieVerified: false,
  endorsementCount: 0,
};

describe("computeTrustLevel", () => {
  it("returns level 0 for a brand-new profile", () => {
    expect(computeTrustLevel(base).level).toBe(0);
  });

  it("returns level 1 when only email is verified", () => {
    expect(computeTrustLevel({ ...base, emailVerified: true }).level).toBe(1);
  });

  it("does not skip to level 2 without email", () => {
    const result = computeTrustLevel({
      ...base,
      ageVerified: true,
      selfieVerified: true,
    });
    expect(result.level).toBe(0);
  });

  it("returns level 2 with email + age", () => {
    expect(
      computeTrustLevel({ ...base, emailVerified: true, ageVerified: true }).level,
    ).toBe(2);
  });

  it("returns level 2 with email + selfie", () => {
    expect(
      computeTrustLevel({ ...base, emailVerified: true, selfieVerified: true }).level,
    ).toBe(2);
  });

  it("requires both verifications + endorsements for level 3", () => {
    expect(
      computeTrustLevel({
        emailVerified: true,
        ageVerified: true,
        selfieVerified: true,
        endorsementCount: 2,
      }).level,
    ).toBe(2);

    expect(
      computeTrustLevel({
        emailVerified: true,
        ageVerified: true,
        selfieVerified: true,
        endorsementCount: 3,
      }).level,
    ).toBe(3);
  });

  it("returns a label and description for every level", () => {
    const levels = [
      computeTrustLevel(base),
      computeTrustLevel({ ...base, emailVerified: true }),
      computeTrustLevel({ ...base, emailVerified: true, ageVerified: true }),
      computeTrustLevel({
        emailVerified: true,
        ageVerified: true,
        selfieVerified: true,
        endorsementCount: 5,
      }),
    ];
    for (const r of levels) {
      expect(r.label.length).toBeGreaterThan(0);
      expect(r.description.length).toBeGreaterThan(0);
    }
  });
});
