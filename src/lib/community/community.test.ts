import { describe, expect, it } from "vitest";
import {
  createGroupSchema,
  updateGroupSchema,
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  canManageGroup,
  canDeletePost,
  canDeleteComment,
  shouldAutoApprovePost,
} from "@/lib/community";

describe("createGroupSchema", () => {
  it("accepts valid group", () => {
    const r = createGroupSchema.safeParse({ name: "Grupo SP", city: "São Paulo" });
    expect(r.success).toBe(true);
  });

  it("rejects name too short", () => {
    const r = createGroupSchema.safeParse({ name: "ab" });
    expect(r.success).toBe(false);
  });

  it("defaults moderated to true", () => {
    const r = createGroupSchema.safeParse({ name: "Teste" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.moderated).toBe(true);
    }
  });
});

describe("updateGroupSchema", () => {
  it("accepts partial update", () => {
    const r = updateGroupSchema.safeParse({ name: "Novo nome" });
    expect(r.success).toBe(true);
  });

  it("accepts empty update", () => {
    const r = updateGroupSchema.safeParse({});
    expect(r.success).toBe(true);
  });
});

describe("createPostSchema", () => {
  it("accepts valid post", () => {
    const r = createPostSchema.safeParse({ title: "Meu post", content: "Conteúdo aqui" });
    expect(r.success).toBe(true);
  });

  it("rejects title too short", () => {
    const r = createPostSchema.safeParse({ title: "ab", content: "ok" });
    expect(r.success).toBe(false);
  });

  it("rejects empty content", () => {
    const r = createPostSchema.safeParse({ title: "Título ok", content: "" });
    expect(r.success).toBe(false);
  });
});

describe("updatePostSchema", () => {
  it("accepts partial update", () => {
    const r = updatePostSchema.safeParse({ title: "Novo título" });
    expect(r.success).toBe(true);
  });
});

describe("createCommentSchema", () => {
  it("accepts valid comment", () => {
    const r = createCommentSchema.safeParse({ content: "Concordo!" });
    expect(r.success).toBe(true);
  });

  it("rejects empty comment", () => {
    const r = createCommentSchema.safeParse({ content: "" });
    expect(r.success).toBe(false);
  });
});

describe("canManageGroup", () => {
  it("admin can manage", () => {
    expect(canManageGroup("admin")).toBe(true);
  });

  it("mod can manage", () => {
    expect(canManageGroup("mod")).toBe(true);
  });

  it("member cannot manage", () => {
    expect(canManageGroup("member")).toBe(false);
  });
});

describe("canDeletePost", () => {
  it("author can delete own post", () => {
    expect(canDeletePost("user1", "user1", "member")).toBe(true);
  });

  it("admin can delete any post", () => {
    expect(canDeletePost("user1", "user2", "admin")).toBe(true);
  });

  it("mod can delete any post", () => {
    expect(canDeletePost("user1", "user2", "mod")).toBe(true);
  });

  it("member cannot delete others post", () => {
    expect(canDeletePost("user1", "user2", "member")).toBe(false);
  });

  it("non-member cannot delete", () => {
    expect(canDeletePost("user1", "user2", null)).toBe(false);
  });
});

describe("canDeleteComment", () => {
  it("author can delete own comment", () => {
    expect(canDeleteComment("user1", "user1", "member")).toBe(true);
  });

  it("admin can delete any comment", () => {
    expect(canDeleteComment("user1", "user2", "admin")).toBe(true);
  });

  it("member cannot delete others comment", () => {
    expect(canDeleteComment("user1", "user2", "member")).toBe(false);
  });
});

describe("shouldAutoApprovePost", () => {
  it("unmoderated group always auto-approves", () => {
    expect(shouldAutoApprovePost(false, "member")).toBe(true);
  });

  it("moderated group: admin auto-approved", () => {
    expect(shouldAutoApprovePost(true, "admin")).toBe(true);
  });

  it("moderated group: mod auto-approved", () => {
    expect(shouldAutoApprovePost(true, "mod")).toBe(true);
  });

  it("moderated group: member goes to pending", () => {
    expect(shouldAutoApprovePost(true, "member")).toBe(false);
  });
});
