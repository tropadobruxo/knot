interface ScoringProfile {
  city: string | null;
  roleType: string | null;
  intent: string[];
  interests: { interestId: string; level: string | null }[];
  lastActive: Date;
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
  let score = 0;

  // Shared interests: +3 each, +2 bonus if same level
  const viewerInterests = new Map(viewer.interests.map((i) => [i.interestId, i.level]));
  for (const ci of candidate.interests) {
    if (viewerInterests.has(ci.interestId)) {
      score += 3;
      if (ci.level && ci.level === viewerInterests.get(ci.interestId)) {
        score += 2;
      }
    }
  }

  // Complementary roles: +10
  if (viewer.roleType && candidate.roleType) {
    const compatible = COMPLEMENTARY_ROLES[viewer.roleType];
    if (compatible?.includes(candidate.roleType)) {
      score += 10;
    }
  }

  // Same city: +8
  if (viewer.city && candidate.city && viewer.city.toLowerCase() === candidate.city.toLowerCase()) {
    score += 8;
  }

  // Shared intent: +4 each
  const viewerIntent = new Set(viewer.intent);
  for (const intent of candidate.intent) {
    if (viewerIntent.has(intent)) {
      score += 4;
    }
  }

  // Recency bonus: +2 if active in last 24h
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (candidate.lastActive > dayAgo) {
    score += 2;
  }

  return score;
}
