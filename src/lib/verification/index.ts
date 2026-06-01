export type { AgeVerificationProvider, AgeVerificationResult } from "./types";
export { SandboxAgeVerificationProvider } from "./sandbox-provider";

import { SandboxAgeVerificationProvider } from "./sandbox-provider";
import type { AgeVerificationProvider } from "./types";

let provider: AgeVerificationProvider | null = null;

export function getVerificationProvider(): AgeVerificationProvider {
  if (!provider) {
    provider = new SandboxAgeVerificationProvider();
  }
  return provider;
}
