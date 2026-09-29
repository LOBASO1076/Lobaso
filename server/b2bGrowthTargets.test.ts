import { describe, expect, it } from "vitest";
import { getB2bGrowthTargets } from "./b2bGrowthTargets";

describe("B2B growth targets", () => {
  it("derives four daily orders from the stated revenue and ticket", () => {
    const result = getB2bGrowthTargets();
    expect(result.targets).toMatchObject({ dailyRevenueCents: 500000, estimatedTicketCents: 125000, ordersPerDay: 4, ordersPerMonth: 120 });
  });

  it("uses the stated conversion rates and blocks media scale without contribution margin", () => {
    const result = getB2bGrowthTargets();
    expect(result.funnel.plannedLeadsPerDay).toBe(54);
    expect(result.acquisition).toMatchObject({ targetCplCents: 3500, plannedDailyMediaCents: 189000, plannedCacCents: 47250 });
    expect(result.acquisition.cacShareOfTicketPercent).toBeCloseTo(37.8, 1);
    expect(result.gate.status).toBe("blocked_pending_contribution_margin");
  });
});
