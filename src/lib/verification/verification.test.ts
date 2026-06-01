import { describe, expect, it } from "vitest";
import { SandboxAgeVerificationProvider } from "./sandbox-provider";

describe("SandboxAgeVerificationProvider", () => {
  const provider = new SandboxAgeVerificationProvider();

  it("startVerification returns a redirect URL", async () => {
    const result = await provider.startVerification("user-123");
    expect(result.redirectUrl).toBeTruthy();
  });

  it("handleWebhook returns verified with sandbox token", async () => {
    const result = await provider.handleWebhook({ userId: "user-123" });
    expect(result.verified).toBe(true);
    expect(result.token).toMatch(/^sandbox_/);
  });

  it("handleWebhook rejects PII fields", async () => {
    const piiPayloads = [
      { userId: "u", document: "img.jpg" },
      { userId: "u", documentNumber: "123" },
      { userId: "u", cpf: "000.000.000-00" },
      { userId: "u", dateOfBirth: "1990-01-01" },
      { userId: "u", birthDate: "1990-01-01" },
    ];

    for (const payload of piiPayloads) {
      await expect(provider.handleWebhook(payload)).rejects.toThrow("PII");
    }
  });

  it("result only contains verified and token — no PII", async () => {
    const result = await provider.handleWebhook({ userId: "user-123" });
    const keys = Object.keys(result);
    expect(keys).toEqual(["verified", "token"]);
  });
});
