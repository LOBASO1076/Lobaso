import { describe, expect, it } from "vitest";
import { calculateCabralTerms, getB2BPolicyReference } from "./b2bPolicy";

describe("Cabral B2B commercial policy", () => {
  it("calculates +18%, 5% discount and separates represented value from Seafoods revenue", () => {
    const result = calculateCabralTerms({ tableValueCents: 10_000, discountPercent: 5, commissionPercent: 5, packageWeightKg: 5 });
    expect(result).toMatchObject({
      markupCents: 1_800,
      commercialReferenceCents: 11_800,
      discountCents: 590,
      finalPriceCents: 11_210,
      representedValueCents: 10_000,
      valueAboveTableCents: 1_210,
      additionalMarginCents: 1_210,
      commissionExpectedCents: 500,
      seafoodsRecognizedRevenueCents: 1_210,
      potentialSeafoodsEarningsCents: 1_710,
      status: "reference_blocked",
    });
  });

  it("rejects discount above 5%, commission outside 2–5% and package outside 5–6 kg", () => {
    expect(() => calculateCabralTerms({ tableValueCents: 10_000, discountPercent: 5.01, packageWeightKg: 5 })).toThrow(/desconto máximo/);
    expect(() => calculateCabralTerms({ tableValueCents: 10_000, commissionPercent: 1.99, packageWeightKg: 5 })).toThrow(/comissão/);
    expect(() => calculateCabralTerms({ tableValueCents: 10_000, packageWeightKg: 4.99 })).toThrow(/pacote fechado/);
  });

  it("exposes operational ownership without claiming a live provider", () => {
    expect(getB2BPolicyReference()).toMatchObject({ supplier: "Representações", markupPercent: 18, maxDiscountPercent: 5, status: "reference_blocked" });
  });
});
