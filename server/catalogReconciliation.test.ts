import { describe, expect, it } from "vitest";
import { applyCatalogReconciliationFilters, buildCatalog151IntakeRows, getCatalogReconciliationSummary } from "./catalogReconciliation";

describe("catalog reconciliation", () => {
  it("does not expose queued catalog references without an operational tenant", async () => {
    await expect(getCatalogReconciliationSummary()).resolves.toEqual({
      mode: "blocked",
      total: 0,
      approved: 0,
      readyForReview: 0,
      blocked: 0,
      traffic: { red: 0, yellow: 0, green: 0 },
      missing: { sku: 0, cost: 0, stock: 0, photo: 0, lot: 0, expiry: 0, tax: 0, logistics: 0 },
      items: [],
    });
  });

  it("filters only blocked B2B RED references in the catalog review", () => {
    const result = applyCatalogReconciliationFilters([
      { channel: "b2b", trafficLight: "red", id: 1 },
      { channel: "b2b", trafficLight: "yellow", id: 2 },
      { channel: "b2c", trafficLight: "red", id: 3 },
    ], { channel: "b2b", trafficLight: "red" });
    expect(result).toEqual([{ channel: "b2b", trafficLight: "red", id: 1 }]);
  });

  it("maps all 151 references into separate quarantined review rows without inventing SKUs", () => {
    const rows = buildCatalog151IntakeRows();
    expect(rows).toHaveLength(151);
    expect(rows.filter((row) => row.channel === "b2b")).toHaveLength(13);
    expect(rows.filter((row) => row.channel === "b2c")).toHaveLength(17);
    expect(rows.filter((row) => row.channel === "unassigned")).toHaveLength(121);
    expect(new Set(rows.map((row) => `${row.channel}:${row.sourceName}`)).size).toBe(151);
    expect(rows.every((row) => !("sku" in row))).toBe(true);
    expect(rows.find((row) => row.referenceCode === "SFP-REF-001")).toMatchObject({ channel: "b2c", referencePriceCents: 11186 });
    expect(rows.find((row) => row.referenceCode === "SFP-REF-018")).toMatchObject({ channel: "b2b", referencePriceCents: 23588 });
  });
});
