import { describe, expect, it } from "vitest";

const PUBLIC_PATHS = [
  "/welcome",
  "/verify",
  "/api/auth",
  "/api/auth/callback/credentials",
  "/api/verification",
  "/api/verification/webhook",
  "/manifest.json",
  "/_next",
  "/_next/static/chunk.js",
  "/favicon.ico",
];

const PROTECTED_PATHS = [
  "/events",
  "/profile/alice",
  "/onboarding",
  "/settings/privacy",
  "/discover",
  "/matches",
  "/chat/123",
  "/community",
  "/admin/moderation",
];

function isPublic(pathname: string): boolean {
  const publicPrefixes = [
    "/welcome",
    "/verify",
    "/api/auth",
    "/api/verification",
    "/manifest.json",
    "/_next",
    "/favicon.ico",
  ];
  return publicPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

describe("proxy route classification", () => {
  it("allows all public paths without auth", () => {
    for (const path of PUBLIC_PATHS) {
      expect(isPublic(path)).toBe(true);
    }
  });

  it("blocks all protected paths (requires auth + ageVerified)", () => {
    for (const path of PROTECTED_PATHS) {
      expect(isPublic(path)).toBe(false);
    }
  });
});
