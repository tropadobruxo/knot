import { describe, expect, it } from "vitest";
import {
  createLikeSchema,
  sendMessageSchema,
  validateLike,
  isMutualLike,
  filterBlocked,
  buildExcludeSet,
} from "@/lib/discovery";

describe("validateLike", () => {
  it("rejects self-like", () => {
    expect(validateLike("u1", "u1")).toBe("Não é possível curtir a si mesmo.");
  });

  it("rejects empty ids", () => {
    expect(validateLike("", "u2")).toBe("IDs inválidos.");
    expect(validateLike("u1", "")).toBe("IDs inválidos.");
  });

  it("accepts valid like", () => {
    expect(validateLike("u1", "u2")).toBeNull();
  });
});

describe("createLikeSchema", () => {
  it("accepts valid targetId", () => {
    expect(createLikeSchema.safeParse({ targetId: "abc" }).success).toBe(true);
  });

  it("rejects empty targetId", () => {
    expect(createLikeSchema.safeParse({ targetId: "" }).success).toBe(false);
  });
});

describe("sendMessageSchema", () => {
  it("accepts valid message", () => {
    expect(sendMessageSchema.safeParse({ content: "Olá!" }).success).toBe(true);
  });

  it("rejects empty message", () => {
    expect(sendMessageSchema.safeParse({ content: "" }).success).toBe(false);
  });

  it("rejects too long message", () => {
    const content = "a".repeat(5001);
    expect(sendMessageSchema.safeParse({ content }).success).toBe(false);
  });
});

describe("isMutualLike", () => {
  const likes = [
    { fromUserId: "B", toUserId: "A" },
    { fromUserId: "C", toUserId: "D" },
  ];

  it("detects mutual like (A likes B, B already liked A)", () => {
    expect(isMutualLike(likes, "A", "B")).toBe(true);
  });

  it("no mutual when reverse does not exist", () => {
    expect(isMutualLike(likes, "A", "C")).toBe(false);
  });

  it("no mutual on empty likes", () => {
    expect(isMutualLike([], "A", "B")).toBe(false);
  });
});

describe("filterBlocked", () => {
  it("removes blocked ids", () => {
    const candidates = ["A", "B", "C", "D"];
    const blocked = new Set(["B", "D"]);
    expect(filterBlocked(candidates, blocked)).toEqual(["A", "C"]);
  });

  it("returns all when none blocked", () => {
    expect(filterBlocked(["A", "B"], new Set())).toEqual(["A", "B"]);
  });
});

describe("buildExcludeSet", () => {
  it("includes self", () => {
    const set = buildExcludeSet("me", [], [], [], []);
    expect(set.has("me")).toBe(true);
  });

  it("includes liked, matched, blocked in both directions", () => {
    const set = buildExcludeSet(
      "me",
      ["liked1"],
      ["matched1"],
      ["iBlocked"],
      ["blockedMe"],
    );
    expect(set.has("me")).toBe(true);
    expect(set.has("liked1")).toBe(true);
    expect(set.has("matched1")).toBe(true);
    expect(set.has("iBlocked")).toBe(true);
    expect(set.has("blockedMe")).toBe(true);
    expect(set.has("stranger")).toBe(false);
  });

  it("deduplicates", () => {
    const set = buildExcludeSet("me", ["A"], ["A"], ["A"], ["A"]);
    expect(set.size).toBe(2); // "me" + "A"
  });
});

describe("match + chat access rules (unit)", () => {
  it("only matched users can access conversation", () => {
    const match = { userAId: "u1", userBId: "u2" };
    const canAccess = (userId: string) =>
      match.userAId === userId || match.userBId === userId;

    expect(canAccess("u1")).toBe(true);
    expect(canAccess("u2")).toBe(true);
    expect(canAccess("u3")).toBe(false);
  });

  it("blocked user cannot like", () => {
    const blocks = [{ creatorId: "u1", targetId: "u2" }];
    const isBlocked = (from: string, to: string) =>
      blocks.some(
        (b) =>
          (b.creatorId === from && b.targetId === to) ||
          (b.creatorId === to && b.targetId === from),
      );

    expect(isBlocked("u1", "u2")).toBe(true);
    expect(isBlocked("u2", "u1")).toBe(true);
    expect(isBlocked("u1", "u3")).toBe(false);
  });
});
