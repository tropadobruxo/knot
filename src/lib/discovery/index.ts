import { z } from "zod";

// ── Schemas ─────────────────────────────────────

export const createLikeSchema = z.object({
  targetId: z.string().min(1, "targetId obrigatório"),
  superLike: z.boolean().optional(),
  note: z.string().max(200).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Mensagem obrigatória").max(5000),
});

// ── Pure helpers ────────────────────────────────

export function validateLike(fromId: string, toId: string): string | null {
  if (fromId === toId) return "Não é possível curtir a si mesmo.";
  if (!fromId || !toId) return "IDs inválidos.";
  return null;
}

/**
 * Check if a mutual like exists — if so, it's a match.
 */
export function isMutualLike(
  existingLikes: { fromUserId: string; toUserId: string }[],
  fromId: string,
  toId: string,
): boolean {
  return existingLikes.some(
    (l) => l.fromUserId === toId && l.toUserId === fromId,
  );
}

/**
 * Filter out blocked user IDs from a candidate list.
 */
export function filterBlocked(
  candidateIds: string[],
  blockedIds: Set<string>,
): string[] {
  return candidateIds.filter((id) => !blockedIds.has(id));
}

/**
 * Build the set of user IDs that should be excluded from discovery.
 */
export function buildExcludeSet(
  selfId: string,
  likedIds: string[],
  matchedIds: string[],
  blockedByMe: string[],
  blockedMe: string[],
): Set<string> {
  const set = new Set<string>();
  set.add(selfId);
  for (const id of likedIds) set.add(id);
  for (const id of matchedIds) set.add(id);
  for (const id of blockedByMe) set.add(id);
  for (const id of blockedMe) set.add(id);
  return set;
}
