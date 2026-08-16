import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  prisma: {
    product: { findUnique: vi.fn() },
    watchlistItem: { deleteMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn() },
  },
}));

vi.mock("@/server/auth", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));

import { GET, POST } from "./route";

describe("watchlist API authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns an anonymous empty state without exposing user data", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    const response = await GET(new Request("http://localhost/api/watchlist/hades-ii"), { params: Promise.resolve({ slug: "hades-ii" }) });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ alert: null, followed: false });
    expect(mocks.prisma.product.findUnique).not.toHaveBeenCalled();
  });

  it("rejects follow mutations without an authenticated session", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    const response = await POST(new Request("http://localhost/api/watchlist/hades-ii"), { params: Promise.resolve({ slug: "hades-ii" }) });
    expect(response.status).toBe(401);
    expect(mocks.prisma.watchlistItem.upsert).not.toHaveBeenCalled();
  });

  it("creates a follow only for the authenticated user", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "user@example.com" });
    mocks.prisma.product.findUnique.mockResolvedValue({ id: "product-1", slug: "hades-ii" });
    const response = await POST(new Request("http://localhost/api/watchlist/hades-ii"), { params: Promise.resolve({ slug: "hades-ii" }) });
    expect(response.status).toBe(200);
    expect(mocks.prisma.watchlistItem.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_productId: { productId: "product-1", userId: "user-1" } } }));
  });
});
