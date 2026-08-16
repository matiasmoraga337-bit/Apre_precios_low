import { describe, expect, it } from "vitest";
import type { StoreAdapter } from "./store-adapter";

describe("StoreAdapter contract", () => {
  it("defines a common async offer interface for store connectors", async () => {
    const adapter: StoreAdapter = { getOffer: async () => ({ currency: "CLP", discountPercent: 0, externalProductId: "demo", genre: "Demo", initials: "DEM", originalPriceClp: 1000, priceClp: 1000, title: "Demo", url: "https://example.com/demo" }), store: "steam" };
    await expect(adapter.getOffer("demo")).resolves.toMatchObject({ currency: "CLP", externalProductId: "demo" });
  });
});
