import { z } from "zod";

// ── Group schemas ───────────────────────────────

export const createGroupSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  description: z.string().max(2000).optional(),
  city: z.string().max(100).optional(),
  moderated: z.boolean().default(true),
});

export const updateGroupSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(2000).optional(),
  city: z.string().max(100).optional(),
  moderated: z.boolean().optional(),
});

// ── Post schemas ────────────────────────────────

export const createPostSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(200),
  content: z.string().min(1, "Conteúdo obrigatório").max(10000),
});

export const updatePostSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
});

// ── Comment schemas ─────────────────────────────

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comentário obrigatório").max(5000),
});

// ── Member roles ────────────────────────────────

export const GROUP_ROLES = ["admin", "mod", "member"] as const;
export type GroupRole = (typeof GROUP_ROLES)[number];

export function canManageGroup(role: string): boolean {
  return role === "admin" || role === "mod";
}

export function canDeletePost(
  postAuthorId: string,
  currentUserId: string,
  memberRole: string | null,
): boolean {
  if (postAuthorId === currentUserId) return true;
  return memberRole !== null && canManageGroup(memberRole);
}

export function canDeleteComment(
  commentAuthorId: string,
  currentUserId: string,
  memberRole: string | null,
): boolean {
  if (commentAuthorId === currentUserId) return true;
  return memberRole !== null && canManageGroup(memberRole);
}

export function shouldAutoApprovePost(
  groupModerated: boolean,
  memberRole: string,
): boolean {
  if (!groupModerated) return true;
  return canManageGroup(memberRole);
}
