import { describe, expect, it } from "vitest";
import { calculateReorderPrediction, commercialIntelligenceRules } from "./commercialIntelligence";

const base = new Date("2026-09-25T12:00:00.000Z");
const daysAgo = (days: number) => new Date(base.getTime() - days * 24 * 60 * 60 * 1000);

describe("commercial intelligence reorder rules", () => {
  it("uses the median purchase cadence and marks a customer due", () => {
    const result = calculateReorderPrediction("Casa do Mar", [
      { purchasedAt: daysAgo(84), totalCents: 90000 },
      { purchasedAt: daysAgo(56), totalCents: 110000 },
      { purchasedAt: daysAgo(28), totalCents: 100000 },
    ], base);

    expect(result.intervalDays).toBe(28);
    expect(result.status).toBe("due");
    expect(result.segment).toBe("repeat_ready");
    expect(result.averageTicketCents).toBe(100000);
    expect(result.windowStart).toBe("2026-09-22");
    expect(result.windowEnd).toBe("2026-09-30");
  });

  it("marks a customer overdue only after the 125 percent threshold", () => {
    const result = calculateReorderPrediction("Cliente em risco", [
      { purchasedAt: daysAgo(85), totalCents: 80000 },
      { purchasedAt: daysAgo(50), totalCents: 80000 },
    ], base);

    expect(result.intervalDays).toBe(35);
    expect(result.status).toBe("overdue");
    expect(result.segment).toBe("at_risk");
    expect(result.reason).toContain("15 dias");
  });

  it("does not overclaim a forecast for a first-time buyer", () => {
    const result = calculateReorderPrediction("Ana Ribeiro", [{ purchasedAt: daysAgo(12), totalCents: 45900 }], base);

    expect(result.status).toBe("new");
    expect(result.segment).toBe("new");
    expect(result.probabilityPercent).toBeLessThan(60);
    expect(result.reason).toContain("sem cadência");
  });

  it("exposes the rules used by the UI and investor explanation", () => {
    expect(commercialIntelligenceRules).toMatchObject({
      cadence: expect.stringContaining("Mediana"),
      window: expect.stringContaining("-3/+5"),
      overdue: expect.stringContaining("125%"),
    });
  });
});
