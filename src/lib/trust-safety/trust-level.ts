// ── Layered trust level ──────────────────────────
// Progressive trust: email → age/selfie → community endorsements.
// Pure function so it can be tested and reused on server and client.

export interface TrustInput {
  emailVerified: boolean;
  ageVerified: boolean;
  selfieVerified: boolean;
  endorsementCount: number;
}

export type TrustLevel = 0 | 1 | 2 | 3;

export interface TrustResult {
  level: TrustLevel;
  label: string;
  description: string;
}

const COMMUNITY_ENDORSEMENT_THRESHOLD = 3;

const TRUST_LABELS: Record<TrustLevel, { label: string; description: string }> = {
  0: { label: "Novo por aqui", description: "Perfil ainda sem verificações." },
  1: { label: "Email verificado", description: "Confirmou o endereço de email." },
  2: { label: "Identidade verificada", description: "Confirmou idade e/ou selfie." },
  3: {
    label: "Confiável pela comunidade",
    description: "Verificado e endossado por outros membros.",
  },
};

export function computeTrustLevel(input: TrustInput): TrustResult {
  let level: TrustLevel = 0;

  if (input.emailVerified) level = 1;

  if (level === 1 && (input.ageVerified || input.selfieVerified)) {
    level = 2;
  }

  if (
    level === 2 &&
    input.ageVerified &&
    input.selfieVerified &&
    input.endorsementCount >= COMMUNITY_ENDORSEMENT_THRESHOLD
  ) {
    level = 3;
  }

  return { level, ...TRUST_LABELS[level] };
}
