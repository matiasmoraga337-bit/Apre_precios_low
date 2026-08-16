import { describe, expect, it } from "vitest";
import { hashPassword, normalizeEmail, validateCredentials, verifyPassword } from "./auth";

describe("auth domain", () => {
  it("normalizes email addresses", () => {
    expect(normalizeEmail("  Usuario@Ejemplo.COM ")).toBe("usuario@ejemplo.com");
  });

  it("requires a valid email and a long enough password", () => {
    expect(() => validateCredentials("invalid", "123456789012")).toThrow();
    expect(() => validateCredentials("user@example.com", "short")).toThrow();
    expect(validateCredentials("user@example.com", "123456789012").email).toBe("user@example.com");
  });

  it("hashes passwords and verifies only the original value", async () => {
    const passwordHash = await hashPassword("correct-horse-battery");
    await expect(verifyPassword("correct-horse-battery", passwordHash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", passwordHash)).resolves.toBe(false);
  });
});
