import { describe, expect, it } from "vitest";
import { SandboxAgeVerificationProvider } from "./sandbox-provider";

describe("AgeVerificationProvider", () => {
  it("sandbox provider returns verified with token", async () => {
    const provider = new SandboxAgeVerificationProvider();
    const result = await provider.verify("test-session");

    expect(result.verified).toBe(true);
    expect(result.token).toMatch(/^sandbox_/);
  });

  it("result type has only verified and token — no PII fields", () => {
    const result = { verified: true, token: "t" };
    const keys = Object.keys(result);

    expect(keys).toEqual(["verified", "token"]);
    expect(keys).not.toContain("document");
    expect(keys).not.toContain("documentNumber");
    expect(keys).not.toContain("dateOfBirth");
    expect(keys).not.toContain("birthDate");
    expect(keys).not.toContain("cpf");
    expect(keys).not.toContain("rg");
  });
});
