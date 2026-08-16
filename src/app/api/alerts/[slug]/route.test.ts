import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  prisma: { priceAlert: { upsert: vi.fn() }, product: { findUnique: vi.fn() } },
}));

vi.mock("@/server/auth", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));

import { PUT } from "./route";

describe("price alert API authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects alert creation without a session", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    const response = await PUT(new Request("http://localhost/api/alerts/hades-ii", { body: JSON.stringify({ targetPriceClp: 12990 }), method: "PUT" }), { params: Promise.resolve({ slug: "hades-ii" }) });
    expect(response.status).toBe(401);
    expect(mocks.prisma.priceAlert.upsert).not.toHaveBeenCalled();
  });

  it("rejects an empty rule before writing to the database", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "user@example.com" });
    mocks.prisma.product.findUnique.mockResolvedValue({ id: "product-1" });
    const response = await PUT(new Request("http://localhost/api/alerts/hades-ii", { body: JSON.stringify({}), method: "PUT" }), { params: Promise.resolve({ slug: "hades-ii" }) });
    expect(response.status).toBe(400);
    expect(mocks.prisma.priceAlert.upsert).not.toHaveBeenCalled();
  });
});
