import { describe, it, expect } from "vitest";
import { scoreCandidate, scoreCandidateDetailed, haversineKm } from "./scoring";

function makeProfile(overrides: Partial<Parameters<typeof scoreCandidate>[0]> = {}) {
  return {
    city: null,
    roleType: null,
    intent: [],
    interests: [],
    lastActive: new Date(),
    ...overrides,
  };
}

describe("scoreCandidate", () => {
  it("returns 0 for profiles with nothing in common", () => {
    const viewer = makeProfile({ city: "São Paulo", roleType: "dom" });
    const candidate = makeProfile({ city: "Curitiba", roleType: "dom" });
    // Only recency bonus (active now)
    expect(scoreCandidate(viewer, candidate)).toBe(2);
  });

  it("adds +10 for complementary roles (dom + sub)", () => {
    const viewer = makeProfile({ roleType: "dom" });
    const candidate = makeProfile({ roleType: "sub" });
    expect(scoreCandidate(viewer, candidate)).toBeGreaterThanOrEqual(10);
  });

  it("adds +8 for same city", () => {
    const viewer = makeProfile({ city: "São Paulo" });
    const candidate = makeProfile({ city: "são paulo" });
    const score = scoreCandidate(viewer, candidate);
    expect(score).toBeGreaterThanOrEqual(8);
  });

  it("adds +3 per shared interest, +2 bonus for same level", () => {
    const viewer = makeProfile({
      interests: [
        { interestId: "a", level: "experienced" },
        { interestId: "b", level: "curious" },
      ],
    });
    const candidate = makeProfile({
      interests: [
        { interestId: "a", level: "experienced" }, // +3 + 2
        { interestId: "b", level: "beginner" }, // +3
        { interestId: "c", level: null }, // no match
      ],
    });
    // Shared: a (+5) + b (+3) + recency (+2) = 10
    expect(scoreCandidate(viewer, candidate)).toBe(10);
  });

  it("adds +4 per shared intent", () => {
    const viewer = makeProfile({ intent: ["relacionamento", "amizade"] });
    const candidate = makeProfile({ intent: ["relacionamento", "casual"] });
    // 1 shared intent (+4) + recency (+2) = 6
    expect(scoreCandidate(viewer, candidate)).toBe(6);
  });

  it("adds +2 recency bonus for recently active", () => {
    const viewer = makeProfile();
    const recent = makeProfile({ lastActive: new Date() });
    const stale = makeProfile({ lastActive: new Date("2020-01-01") });

    expect(scoreCandidate(viewer, recent)).toBe(2);
    expect(scoreCandidate(viewer, stale)).toBe(0);
  });

  it("scores a highly compatible profile higher", () => {
    const viewer = makeProfile({
      city: "São Paulo",
      roleType: "dom",
      intent: ["relacionamento"],
      interests: [{ interestId: "shibari", level: "experienced" }],
    });

    const greatMatch = makeProfile({
      city: "São Paulo",
      roleType: "sub",
      intent: ["relacionamento"],
      interests: [{ interestId: "shibari", level: "experienced" }],
    });

    const poorMatch = makeProfile({
      city: "Manaus",
      roleType: "dom",
      intent: ["casual"],
      interests: [],
    });

    expect(scoreCandidate(viewer, greatMatch)).toBeGreaterThan(
      scoreCandidate(viewer, poorMatch),
    );
  });

  it("adds +5 for a selfie-verified candidate", () => {
    const viewer = makeProfile();
    const verified = makeProfile({ selfieVerified: true });
    // +5 selfie + recency (+2) = 7
    expect(scoreCandidate(viewer, verified)).toBe(7);
    expect(scoreCandidateDetailed(viewer, verified).selfieVerified).toBe(true);
  });

  it("does not score proximity when coordinates are missing", () => {
    const viewer = makeProfile({ approxLat: -23.55, approxLng: -46.63 });
    const candidate = makeProfile();
    const result = scoreCandidateDetailed(viewer, candidate);
    expect(result.distanceKm).toBeNull();
    expect(result.nearby).toBe(false);
  });

  it("flags nearby and boosts score for close coordinates", () => {
    // São Paulo center vs ~5km away
    const viewer = makeProfile({ approxLat: -23.55, approxLng: -46.63 });
    const candidate = makeProfile({ approxLat: -23.55, approxLng: -46.58 });
    const result = scoreCandidateDetailed(viewer, candidate);
    expect(result.nearby).toBe(true);
    expect(result.distanceKm).not.toBeNull();
    expect(result.distanceKm!).toBeLessThanOrEqual(25);
    // +8 proximity + recency (+2) = 10
    expect(result.score).toBe(10);
  });

  it("does not flag nearby for distant coordinates", () => {
    // São Paulo vs Rio de Janeiro (~360km)
    const viewer = makeProfile({ approxLat: -23.55, approxLng: -46.63 });
    const candidate = makeProfile({ approxLat: -22.91, approxLng: -43.17 });
    const result = scoreCandidateDetailed(viewer, candidate);
    expect(result.nearby).toBe(false);
    expect(result.distanceKm!).toBeGreaterThan(150);
    // No proximity bonus, only recency
    expect(result.score).toBe(2);
  });

  it("haversineKm computes a known distance (SP↔RJ ≈ 360km)", () => {
    const km = haversineKm(-23.55, -46.63, -22.91, -43.17);
    expect(km).toBeGreaterThan(330);
    expect(km).toBeLessThan(380);
  });
});
