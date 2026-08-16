import { describe, expect, it } from "vitest";
import { validateAlertInput } from "./alerts";

describe("alert rules", () => {
  it("accepts a price or discount target", () => {
    expect(validateAlertInput({ targetPriceClp: "14990" })).toEqual({ targetPriceClp: 14990, targetDiscountPercent: undefined });
    expect(validateAlertInput({ targetDiscountPercent: 50 })).toEqual({ targetPriceClp: undefined, targetDiscountPercent: 50 });
  });

  it("rejects empty and out-of-range rules", () => {
    expect(() => validateAlertInput({})).toThrow();
    expect(() => validateAlertInput({ targetDiscountPercent: 101 })).toThrow();
    expect(() => validateAlertInput({ targetPriceClp: -1 })).toThrow();
  });
});
