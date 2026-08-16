import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  validatePassword: vi.fn(),
  verifyPassword: vi.fn(),
  prisma: { user: { delete: vi.fn(), findUnique: vi.fn() } },
}));

vi.mock("@/server/auth", () => ({ getCurrentUser: mocks.getCurrentUser, SESSION_COOKIE: "apre_session", validatePassword: mocks.validatePassword, verifyPassword: mocks.verifyPassword }));
vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));

import { DELETE } from "./route";

describe("account deletion authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects deletion without a session", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    const response = await DELETE(new Request("http://localhost/api/account", { body: JSON.stringify({ password: "password" }), method: "DELETE" }));
    expect(response.status).toBe(401);
    expect(mocks.prisma.user.delete).not.toHaveBeenCalled();
  });

  it("requires the current password before deleting the account", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "user@example.com" });
    mocks.prisma.user.findUnique.mockResolvedValue({ passwordHash: "hash" });
    mocks.verifyPassword.mockResolvedValue(false);
    const response = await DELETE(new Request("http://localhost/api/account", { body: JSON.stringify({ password: "wrong-password" }), method: "DELETE" }));
    expect(response.status).toBe(403);
    expect(mocks.prisma.user.delete).not.toHaveBeenCalled();
  });
});
