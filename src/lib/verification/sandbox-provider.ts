import type { AgeVerificationProvider, AgeVerificationResult } from "./types";

export class SandboxAgeVerificationProvider implements AgeVerificationProvider {
  async startVerification(
    _userId: string,
  ): Promise<{ redirectUrl: string }> {
    return {
      redirectUrl: "/verify?sandbox=true",
    };
  }

  async handleWebhook(payload: unknown): Promise<AgeVerificationResult> {
    const data = payload as Record<string, unknown> | null;

    const FORBIDDEN_FIELDS = [
      "document",
      "documentNumber",
      "cpf",
      "rg",
      "dateOfBirth",
      "birthDate",
      "identityDoc",
    ];

    if (data && typeof data === "object") {
      for (const key of Object.keys(data)) {
        if (FORBIDDEN_FIELDS.includes(key)) {
          throw new Error(
            `PII field "${key}" must not be sent to our server.`,
          );
        }
      }
    }

    return {
      verified: true,
      token: `sandbox_${Date.now()}`,
    };
  }
}
