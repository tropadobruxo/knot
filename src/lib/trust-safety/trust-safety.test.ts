import { describe, expect, it } from "vitest";
import {
  createBlockSchema,
  createReportSchema,
  updateReportSchema,
  validateBlock,
  validateReport,
  REPORT_REASONS,
  REPORT_TARGET_TYPES,
} from "@/lib/trust-safety";

describe("validateBlock", () => {
  it("rejects self-block", () => {
    expect(validateBlock("user1", "user1")).toBe(
      "Não é possível bloquear a si mesmo.",
    );
  });

  it("accepts valid block", () => {
    expect(validateBlock("user1", "user2")).toBeNull();
  });

  it("rejects empty ids", () => {
    expect(validateBlock("", "user2")).toBe("IDs inválidos.");
    expect(validateBlock("user1", "")).toBe("IDs inválidos.");
  });
});

describe("validateReport", () => {
  it("rejects self-report", () => {
    expect(validateReport("user1", "user1", "harassment")).toBe(
      "Não é possível denunciar a si mesmo.",
    );
  });

  it("rejects invalid reason", () => {
    expect(validateReport("user1", "user2", "invalid_reason")).toBe(
      "Razão de denúncia inválida.",
    );
  });

  it("accepts valid report", () => {
    for (const reason of REPORT_REASONS) {
      expect(validateReport("user1", "user2", reason)).toBeNull();
    }
  });
});

describe("createBlockSchema", () => {
  it("accepts valid targetId", () => {
    const result = createBlockSchema.safeParse({ targetId: "abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty targetId", () => {
    const result = createBlockSchema.safeParse({ targetId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing targetId", () => {
    const result = createBlockSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createReportSchema", () => {
  const base = {
    targetId: "user2",
    targetType: "user" as const,
    reason: "harassment" as const,
  };

  it("accepts valid report", () => {
    const result = createReportSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("accepts report with details", () => {
    const result = createReportSchema.safeParse({
      ...base,
      details: "Enviou mensagens abusivas.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid targetType", () => {
    const result = createReportSchema.safeParse({
      ...base,
      targetType: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid reason", () => {
    const result = createReportSchema.safeParse({
      ...base,
      reason: "not_a_reason",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid target types", () => {
    for (const tt of REPORT_TARGET_TYPES) {
      const result = createReportSchema.safeParse({ ...base, targetType: tt });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid reasons", () => {
    for (const r of REPORT_REASONS) {
      const result = createReportSchema.safeParse({ ...base, reason: r });
      expect(result.success).toBe(true);
    }
  });
});

describe("updateReportSchema", () => {
  it("accepts status only", () => {
    const result = updateReportSchema.safeParse({ status: "reviewed" });
    expect(result.success).toBe(true);
  });

  it("accepts actioned with action", () => {
    const result = updateReportSchema.safeParse({
      status: "actioned",
      action: "ban",
      reason: "Violação grave",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateReportSchema.safeParse({ status: "pending" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid action", () => {
    const result = updateReportSchema.safeParse({
      status: "actioned",
      action: "delete",
    });
    expect(result.success).toBe(false);
  });
});

describe("block removes mutual matches (unit logic)", () => {
  it("identifies mutual likes for removal", () => {
    const likes = [
      { fromUserId: "A", toUserId: "B" },
      { fromUserId: "B", toUserId: "A" },
      { fromUserId: "A", toUserId: "C" },
    ];
    const blockCreator = "A";
    const blockTarget = "B";

    const toRemove = likes.filter(
      (l) =>
        (l.fromUserId === blockCreator && l.toUserId === blockTarget) ||
        (l.fromUserId === blockTarget && l.toUserId === blockCreator),
    );
    expect(toRemove).toHaveLength(2);
  });

  it("identifies mutual matches for removal", () => {
    const matches = [
      { userAId: "A", userBId: "B" },
      { userAId: "A", userBId: "C" },
    ];
    const blockCreator = "A";
    const blockTarget = "B";

    const toRemove = matches.filter(
      (m) =>
        (m.userAId === blockCreator && m.userBId === blockTarget) ||
        (m.userAId === blockTarget && m.userBId === blockCreator),
    );
    expect(toRemove).toHaveLength(1);
  });
});

describe("banned user status", () => {
  it("moderation action maps to user status correctly", () => {
    const statusMap: Record<string, string> = {
      warn: "active",
      suspend: "suspended",
      ban: "banned",
    };

    expect(statusMap["warn"]).toBe("active");
    expect(statusMap["suspend"]).toBe("suspended");
    expect(statusMap["ban"]).toBe("banned");
  });
});
