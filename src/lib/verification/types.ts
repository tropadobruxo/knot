export interface AgeVerificationResult {
  verified: boolean;
  token: string;
}

export interface AgeVerificationProvider {
  verify(sessionId: string): Promise<AgeVerificationResult>;
}
