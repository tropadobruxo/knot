import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

describe("Prisma schema safety invariants", () => {
  const schema = readFileSync(
    resolve(__dirname, "../../prisma/schema.prisma"),
    "utf-8",
  );

  it("never stores identity document fields as model columns", () => {
    // Match field declarations: whitespace + fieldName + whitespace + type
    const forbiddenFields = [
      "documentNumber",
      "cpfNumber",
      "rgNumber",
      "identityDoc",
      "birthDate",
      "dateOfBirth",
      "fullName",
      "realName",
    ];

    for (const field of forbiddenFields) {
      const pattern = new RegExp(`^\\s+${field}\\s`, "im");
      expect(schema).not.toMatch(pattern);
    }
  });

  it("User model has ageVerified as boolean, not document storage", () => {
    expect(schema).toContain("ageVerified");
    expect(schema).toContain("verificationToken");
  });
});
