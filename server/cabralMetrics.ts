import { eq } from "drizzle-orm";
import { b2bCabralTerms } from "../drizzle/schema";
import { getDb } from "./db";
import { ENV } from "./_core/env";
import { calculateCabralTerms } from "./b2bPolicy";

export type CabralMetrics = {
  mode: "simulation" | "live" | "unavailable";
  cabralSimulationEnabled: boolean;
  totalTerms: number;
  representedValueCents: number;
  seafoodsRecognizedRevenueCents: number;
  commissionExpectedCents: number;
  commissionReceivedCents: number;
  commissionPendingCents: number;
  additionalMarginCents: number;
  projectedAdditionalMarginCents: number;
  source: "persisted" | "fixture" | "empty";
  fixtureLabel?: string;
  status: {
    referenceBlocked: number;
    approved: number;
    invoiced: number;
    commissionReceived: number;
  };
};

const emptyMetrics = (): CabralMetrics => {
  const activeSimulation = ENV.allowCabralRepresentation && ENV.releaseChannel === "staging";
  const fixture = activeSimulation ? calculateCabralTerms({ tableValueCents: 99_250, packageWeightKg: 5, discountPercent: 5, commissionPercent: 2 }) : undefined;
  return {
    mode: activeSimulation ? "simulation" : "unavailable",
    cabralSimulationEnabled: ENV.allowCabralRepresentation,
    totalTerms: 0,
    representedValueCents: fixture?.representedValueCents ?? 0,
    seafoodsRecognizedRevenueCents: 0,
    commissionExpectedCents: fixture?.commissionExpectedCents ?? 0,
    commissionReceivedCents: 0,
    commissionPendingCents: fixture?.commissionExpectedCents ?? 0,
    additionalMarginCents: 0,
    projectedAdditionalMarginCents: fixture?.additionalMarginCents ?? 0,
    source: fixture ? "fixture" : "empty",
    fixtureLabel: fixture ? "TESTE-01 · pacote de 5 kg · desconto de 5%" : undefined,
    status: { referenceBlocked: fixture ? 1 : 0, approved: 0, invoiced: 0, commissionReceived: 0 },
  };
};

export async function getCabralMetrics(tenantId?: number): Promise<CabralMetrics> {
  if (!tenantId) return emptyMetrics();
  const db = await getDb();
  if (!db) return emptyMetrics();

  const terms = await db.select().from(b2bCabralTerms).where(eq(b2bCabralTerms.tenantId, tenantId));
  const totals = terms.reduce((result, term) => {
    result.representedValueCents += term.representedValueCents;
    result.additionalMarginCents += term.additionalMarginCents;
    if (term.status === "invoiced" || term.status === "commission_received") result.seafoodsRecognizedRevenueCents += term.additionalMarginCents;
    result.commissionExpectedCents += term.commissionExpectedCents;
    result.commissionReceivedCents += term.commissionReceivedCents;
    if (term.status === "reference_blocked") result.status.referenceBlocked += 1;
    if (term.status === "approved") result.status.approved += 1;
    if (term.status === "invoiced") result.status.invoiced += 1;
    if (term.status === "commission_received") result.status.commissionReceived += 1;
    return result;
  }, {
    representedValueCents: 0,
    additionalMarginCents: 0,
    seafoodsRecognizedRevenueCents: 0,
    commissionExpectedCents: 0,
    commissionReceivedCents: 0,
    status: { referenceBlocked: 0, approved: 0, invoiced: 0, commissionReceived: 0 },
  });

  return {
    mode: ENV.allowPersistence ? "live" : "simulation",
    cabralSimulationEnabled: ENV.allowCabralRepresentation,
    totalTerms: terms.length,
    representedValueCents: totals.representedValueCents,
    seafoodsRecognizedRevenueCents: totals.seafoodsRecognizedRevenueCents,
    commissionExpectedCents: totals.commissionExpectedCents,
    commissionReceivedCents: totals.commissionReceivedCents,
    commissionPendingCents: Math.max(0, totals.commissionExpectedCents - totals.commissionReceivedCents),
    additionalMarginCents: totals.additionalMarginCents,
    projectedAdditionalMarginCents: totals.additionalMarginCents,
    source: "persisted",
    status: totals.status,
  };
}
