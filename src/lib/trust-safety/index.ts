import { z } from "zod";

// ── Report reasons ──────────────────────────────
export const REPORT_REASONS = [
  "harassment",
  "non_consensual",
  "underage_suspicion",
  "spam",
  "fake_profile",
  "hate_speech",
  "doxxing",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  harassment: "Assédio ou intimidação",
  non_consensual: "Comportamento não-consensual",
  underage_suspicion: "Suspeita de menor de idade",
  spam: "Spam ou golpe",
  fake_profile: "Perfil falso",
  hate_speech: "Discurso de ódio",
  doxxing: "Exposição de dados pessoais",
  other: "Outro",
};

export const REPORT_TARGET_TYPES = [
  "user",
  "post",
  "comment",
  "event",
  "message",
] as const;

export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

// ── Schemas ─────────────────────────────────────

export const createBlockSchema = z.object({
  targetId: z.string().min(1, "targetId obrigatório"),
});

export const createReportSchema = z.object({
  targetId: z.string().min(1, "targetId obrigatório"),
  targetType: z.enum(REPORT_TARGET_TYPES),
  reason: z.enum(REPORT_REASONS),
  details: z.string().max(2000).optional(),
});

export const updateReportSchema = z.object({
  status: z.enum(["reviewed", "actioned", "dismissed"]),
  action: z.enum(["warn", "suspend", "ban"]).optional(),
  reason: z.string().min(1).optional(),
});

// ── Pure validation helpers ─────────────────────

export function validateBlock(creatorId: string, targetId: string): string | null {
  if (creatorId === targetId) return "Não é possível bloquear a si mesmo.";
  if (!creatorId || !targetId) return "IDs inválidos.";
  return null;
}

export function validateReport(
  creatorId: string,
  targetId: string,
  reason: string,
): string | null {
  if (creatorId === targetId) return "Não é possível denunciar a si mesmo.";
  if (!creatorId || !targetId) return "IDs inválidos.";
  if (!REPORT_REASONS.includes(reason as ReportReason)) {
    return "Razão de denúncia inválida.";
  }
  return null;
}
