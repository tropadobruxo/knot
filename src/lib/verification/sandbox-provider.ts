import type { AgeVerificationProvider, AgeVerificationResult } from "./types";

export class SandboxAgeVerificationProvider implements AgeVerificationProvider {
  async verify(_sessionId: string): Promise<AgeVerificationResult> {
    return {
      verified: true,
      token: `sandbox_${Date.now()}`,
    };
  }
}
