export interface AgeVerificationResult {
  verified: boolean;
  token: string;
}

export interface AgeVerificationProvider {
  startVerification(userId: string): Promise<{ redirectUrl: string }>;
  handleWebhook(payload: unknown): Promise<AgeVerificationResult>;
}
