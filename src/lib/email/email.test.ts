import { describe, it, expect } from "vitest";
import {
  verificationEmail,
  passwordResetEmail,
  matchNotificationEmail,
  welcomeEmail,
} from "./templates";

describe("email templates", () => {
  const base = "https://knot.app";

  it("verification email contains token URL", () => {
    const html = verificationEmail("luna", "abc123", base);
    expect(html).toContain("abc123");
    expect(html).toContain(`${base}/api/auth/verify-email?token=abc123`);
    expect(html).toContain("luna");
    expect(html).toContain("Confirme seu email");
  });

  it("password reset email contains token URL", () => {
    const html = passwordResetEmail("kai", "token456", base);
    expect(html).toContain(`${base}/reset-password?token=token456`);
    expect(html).toContain("kai");
    expect(html).toContain("Redefinir senha");
  });

  it("match notification contains both usernames", () => {
    const html = matchNotificationEmail("luna", "kai", base);
    expect(html).toContain("luna");
    expect(html).toContain("kai");
    expect(html).toContain("match");
    expect(html).toContain(`${base}/matches`);
  });

  it("welcome email contains username and onboarding link", () => {
    const html = welcomeEmail("storm", base);
    expect(html).toContain("storm");
    expect(html).toContain(`${base}/onboarding`);
    expect(html).toContain("Bem-vindo");
  });

  it("all templates produce valid HTML", () => {
    const templates = [
      verificationEmail("u", "t", base),
      passwordResetEmail("u", "t", base),
      matchNotificationEmail("u", "m", base),
      welcomeEmail("u", base),
    ];
    for (const html of templates) {
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
      expect(html).toContain("Knot");
    }
  });
});
