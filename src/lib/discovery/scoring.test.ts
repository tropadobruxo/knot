import { describe, it, expect } from "vitest";
import { scoreCandidate } from "./scoring";

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
});
