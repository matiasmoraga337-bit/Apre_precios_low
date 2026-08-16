import { describe, expect, it } from "vitest";
import { formatClp, isHistoricalLow, percentageAboveHistoricalLow } from "./pricing";

describe("pricing domain", () => {
  it("formats prices as Chilean pesos without decimal values", () => {
    expect(formatClp(14990)).toBe("$14.990");
  });

  it("calculates how far the current price is above the historical low", () => {
    expect(percentageAboveHistoricalLow(15000, 10000)).toBe(50);
    expect(percentageAboveHistoricalLow(9000, 10000)).toBe(0);
  });

  it("recognizes a current historical low", () => {
    expect(isHistoricalLow({ currentPrice: 9990, historicalLow: 9990 })).toBe(true);
    expect(isHistoricalLow({ currentPrice: 10990, historicalLow: 9990 })).toBe(false);
  });
});
