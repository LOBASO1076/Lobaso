import { and, eq } from "drizzle-orm";
import { auditEvents, catalogReconciliationItems } from "../drizzle/schema";
import { catalog151References } from "../shared/catalog151References";
import { b2bReferencePrices, b2cReferencePrices, COMMERCIAL_REFERENCE_SOURCE } from "../shared/commercialReference";
import { getDb } from "./db";

const sourceCategory = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("camarão")) return "Camarões";
  if (normalized.includes("lagosta")) return "Crustáceos";
  if (normalized.includes("salmão") || normalized.includes("atum") || normalized.includes("tilápia") || normalized.includes("panga") || normalized.includes("piramutaba") || normalized.includes("polaca")) return "Peixes & Filés";
  return "A classificar";
};

export function applyCatalogReconciliationFilters<T extends { channel: string; trafficLight: string }>(items: T[], filters?: { channel?: "all" | "b2b" | "b2c" | "unassigned"; trafficLight?: "all" | "red" }) {
  return items.filter((item) => {
    const channelMatches = !filters?.channel || filters.channel === "all" || item.channel === filters.channel;
    const trafficMatches = !filters?.trafficLight || filters.trafficLight === "all" || item.trafficLight === filters.trafficLight;
    return channelMatches && trafficMatches;
  });
}

export function buildCatalog151IntakeRows() {
  return catalog151References.map((reference) => ({
    sourceName: reference.sourceName,
    sourceCategory: sourceCategory(reference.sourceName),
    channel: reference.channel,
    referencePriceCents: reference.channel === "b2b" ? reference.cabralPlus18Cents : reference.baseReferenceCents,
    unit: reference.unitOrPackage.slice(0, 16),
    referenceCode: reference.referenceCode,
    notes: `Ref ${reference.referenceCode}; origem ${reference.sourceType}; preço de referência em quarentena; não publicar nem vender sem reconciliação e aprovação.`,
    evidenceRef: "catalog151References: V8 quarantined reference table",
  }));
}

export async function seedCatalogReconciliation(tenantId: number, actorId: number) {
  const db = await getDb();
  if (!db) return { persisted: false, reason: "database_unavailable" as const, inserted: 0 };
  const entries = [
    ...b2cReferencePrices.map(([sourceName, referencePriceCents]) => ({ sourceName, referencePriceCents, channel: "b2c" as const })),
    ...b2bReferencePrices.map(([sourceName, referencePriceCents]) => ({ sourceName, referencePriceCents, channel: "b2b" as const })),
    ...buildCatalog151IntakeRows(),
  ];
  let inserted = 0;
  let alreadyPresent = 0;
  for (const entry of entries) {
    const existing = (await db.select({ id: catalogReconciliationItems.id }).from(catalogReconciliationItems).where(and(
      eq(catalogReconciliationItems.tenantId, tenantId),
      eq(catalogReconciliationItems.channel, entry.channel),
      eq(catalogReconciliationItems.sourceName, entry.sourceName),
    )).limit(1))[0];
    if (existing) { alreadyPresent += 1; continue; }
    await db.insert(catalogReconciliationItems).values({
      tenantId,
      sourceName: entry.sourceName,
      sourceCategory: sourceCategory(entry.sourceName),
      channel: entry.channel,
      referencePriceCents: entry.referencePriceCents,
      unit: "unit" in entry ? entry.unit : "kg",
      status: "blocked",
      trafficLight: "red",
      availability: "unknown",
      notes: "notes" in entry ? entry.notes : "Aguardando SKU comercial, custo autorizado, estoque/lote, foto real e evidência antes de promover para products.",
      evidenceRef: "evidenceRef" in entry ? entry.evidenceRef : COMMERCIAL_REFERENCE_SOURCE,
    });
    inserted += 1;
  }
  await db.insert(auditEvents).values({
    tenantId,
    actorId,
    action: "catalog.reference_intake",
    entity: "catalogReconciliationItems",
    metadata: JSON.stringify({ sourceCount: entries.length, inserted, alreadyPresent, publication: "quarantine_only" }),
  });
  return { persisted: true, sourceCount: entries.length, inserted, alreadyPresent };
}

export async function getCatalogReconciliationSummary(tenantId?: number, filters?: { channel?: "all" | "b2b" | "b2c" | "unassigned"; trafficLight?: "all" | "red" }) {
  if (!tenantId) return { mode: "blocked" as const, total: 0, approved: 0, readyForReview: 0, blocked: 0, traffic: { red: 0, yellow: 0, green: 0 }, missing: { sku: 0, cost: 0, stock: 0, photo: 0, lot: 0, expiry: 0, tax: 0, logistics: 0 }, items: [] };
  const db = await getDb();
  if (!db) return { mode: "blocked" as const, total: 0, approved: 0, readyForReview: 0, blocked: 0, traffic: { red: 0, yellow: 0, green: 0 }, missing: { sku: 0, cost: 0, stock: 0, photo: 0, lot: 0, expiry: 0, tax: 0, logistics: 0 }, items: [] };
  const allItems = await db.select().from(catalogReconciliationItems).where(eq(catalogReconciliationItems.tenantId, tenantId));
  const items = applyCatalogReconciliationFilters(allItems, filters);
  const total = items.length;
  return {
    mode: "staging" as const,
    total,
    approved: items.filter((item) => item.status === "approved").length,
    readyForReview: items.filter((item) => item.status === "ready_for_review").length,
    blocked: items.filter((item) => item.status === "blocked").length,
    traffic: { red: items.filter((item) => item.trafficLight === "red").length, yellow: items.filter((item) => item.trafficLight === "yellow").length, green: items.filter((item) => item.trafficLight === "green").length },
    missing: {
      sku: items.filter((item) => !item.sku).length,
      cost: items.filter((item) => item.costPriceCents === null).length,
      stock: items.filter((item) => item.stockQty === null).length,
      photo: items.filter((item) => !item.photoUrl).length,
      lot: items.filter((item) => !item.lot).length,
      expiry: items.filter((item) => !item.expiryDate).length,
      tax: items.filter((item) => !item.taxPolicy).length,
      logistics: items.filter((item) => !item.logisticsPolicy).length,
    },
    filters: { channel: filters?.channel ?? "all", trafficLight: filters?.trafficLight ?? "all" },
    items: items.slice(0, 250).map((item) => ({ id: item.id, sourceName: item.sourceName, channel: item.channel, trafficLight: item.trafficLight, referencePriceCents: item.referencePriceCents, status: item.status, hasSku: !!item.sku, hasCost: item.costPriceCents !== null, hasStock: item.stockQty !== null, hasPhoto: !!item.photoUrl })),
  };
}
