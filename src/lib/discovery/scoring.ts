interface ScoringProfile {
  city: string | null;
  roleType: string | null;
  intent: string[];
  interests: { interestId: string; level: string | null }[];
  lastActive: Date;
}

export interface CompatibilityBreakdown {
  score: number;
  sharedInterests: number;
  complementaryRole: boolean;
  sameCity: boolean;
  sharedIntents: number;
  recentlyActive: boolean;
}

const COMPLEMENTARY_ROLES: Record<string, string[]> = {
  dom: ["sub"],
  sub: ["dom"],
  switch: ["switch", "dom", "sub"],
  exploring: ["exploring", "switch"],
};

/**
 * Score a candidate relative to a viewer. Higher = better match.
 * Pure function, no side effects.
 */
export function scoreCandidate(viewer: ScoringProfile, candidate: ScoringProfile): number {
  return scoreCandidateDetailed(viewer, candidate).score;
}

/**
 * Detailed compatibility breakdown between two profiles.
 */
export function scoreCandidateDetailed(viewer: ScoringProfile, candidate: ScoringProfile): CompatibilityBreakdown {
  let score = 0;
  let sharedInterests = 0;

  // Shared interests: +3 each, +2 bonus if same level
  const viewerInterests = new Map(viewer.interests.map((i) => [i.interestId, i.level]));
  for (const ci of candidate.interests) {
    if (viewerInterests.has(ci.interestId)) {
      sharedInterests++;
      score += 3;
      if (ci.level && ci.level === viewerInterests.get(ci.interestId)) {
        score += 2;
      }
    }
  }

  // Complementary roles: +10
  let complementaryRole = false;
  if (viewer.roleType && candidate.roleType) {
    const compatible = COMPLEMENTARY_ROLES[viewer.roleType];
    if (compatible?.includes(candidate.roleType)) {
      complementaryRole = true;
      score += 10;
    }
  }

  // Same city: +8
  const sameCity = !!(viewer.city && candidate.city && viewer.city.toLowerCase() === candidate.city.toLowerCase());
  if (sameCity) score += 8;

  // Shared intent: +4 each
  let sharedIntents = 0;
  const viewerIntent = new Set(viewer.intent);
  for (const intent of candidate.intent) {
    if (viewerIntent.has(intent)) {
      sharedIntents++;
      score += 4;
    }
  }

  // Recency bonus: +2 if active in last 24h
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentlyActive = candidate.lastActive > dayAgo;
  if (recentlyActive) score += 2;

  return { score, sharedInterests, complementaryRole, sameCity, sharedIntents, recentlyActive };
}
