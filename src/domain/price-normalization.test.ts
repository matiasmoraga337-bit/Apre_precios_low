import { describe, expect, it } from "vitest";
import { normalizePrice } from "./price-normalization";

describe("price normalization", () => {
  it("keeps CLP as an integer amount", () => {
    const normalized = normalizePrice({ amount: 14990, currency: "clp" }, { CLP: 1 });
    expect(normalized.amountClp).toBe(14990);
    expect(normalized.sourceCurrency).toBe("CLP");
  });

  it("converts a supported foreign currency using an explicit rate", () => {
    const normalized = normalizePrice({ amount: 10, currency: "USD", originalAmount: 20 }, { USD: 950 });
    expect(normalized.amountClp).toBe(9500);
    expect(normalized.originalAmountClp).toBe(19000);
  });

  it("rejects invalid prices and unsupported currencies", () => {
    expect(() => normalizePrice({ amount: -1, currency: "CLP" }, { CLP: 1 })).toThrow();
    expect(() => normalizePrice({ amount: 10, currency: "EUR" }, { CLP: 1 })).toThrow("Unsupported currency");
  });
});
