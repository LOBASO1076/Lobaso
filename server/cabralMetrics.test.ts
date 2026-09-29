import { describe, expect, it } from "vitest";
import { getCabralMetrics } from "./cabralMetrics";

describe("Cabral financial metrics", () => {
  it("keeps a no-tenant dashboard empty while staging simulation is enabled", async () => {
    const metrics = await getCabralMetrics();
    expect(metrics).toMatchObject({
      mode: "simulation",
      cabralSimulationEnabled: true,
      totalTerms: 0,
      representedValueCents: 99_250,
      seafoodsRecognizedRevenueCents: 0,
      commissionExpectedCents: 1_985,
      commissionReceivedCents: 0,
      commissionPendingCents: 1_985,
      projectedAdditionalMarginCents: 12_009,
      source: "fixture",
    });
  });
});
