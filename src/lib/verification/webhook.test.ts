import { describe, expect, it } from "vitest";
import { z } from "zod";

const FORBIDDEN_PII_FIELDS = [
  "document",
  "documentNumber",
  "cpf",
  "rg",
  "dateOfBirth",
  "birthDate",
  "identityDoc",
  "fullName",
  "realName",
];

const webhookSchema = z
  .object({
    userId: z.string().min(1),
  })
  .passthrough()
  .refine(
    (data) => !Object.keys(data).some((k) => FORBIDDEN_PII_FIELDS.includes(k)),
    { message: "Payload contém campos de PII proibidos." },
  );

describe("webhook payload validation", () => {
  it("accepts valid payload with only userId", () => {
    const result = webhookSchema.safeParse({ userId: "user-123" });
    expect(result.success).toBe(true);
  });

  it("rejects payload without userId", () => {
    const result = webhookSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects payload with any PII field", () => {
    const piiPayloads = [
      { userId: "u", document: "img.jpg" },
      { userId: "u", documentNumber: "123456" },
      { userId: "u", cpf: "000.000.000-00" },
      { userId: "u", rg: "12345678" },
      { userId: "u", dateOfBirth: "1990-01-01" },
      { userId: "u", birthDate: "1990-01-01" },
      { userId: "u", identityDoc: "doc.pdf" },
      { userId: "u", fullName: "João Silva" },
      { userId: "u", realName: "João Silva" },
    ];

    for (const payload of piiPayloads) {
      const result = webhookSchema.safeParse(payload);
      expect(result.success).toBe(false);
    }
  });

  it("accepts extra non-PII fields (provider metadata)", () => {
    const result = webhookSchema.safeParse({
      userId: "user-123",
      verificationId: "v-abc",
      timestamp: "2024-01-01",
    });
    expect(result.success).toBe(true);
  });
});
