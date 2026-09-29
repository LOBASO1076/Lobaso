import { and, asc, eq, sql } from "drizzle-orm";
import { customers, sales } from "../drizzle/schema";
import { getDb } from "./db";

const DAY_MS = 24 * 60 * 60 * 1000;

type Purchase = {
  purchasedAt: Date;
  totalCents: number;
};

export type ReorderStatus = "new" | "upcoming" | "due" | "overdue";
export type CustomerSegment = "vip" | "at_risk" | "repeat_ready" | "new" | "active";

export type ReorderPrediction = {
  customerName: string;
  orderCount: number;
  averageTicketCents: number;
  lastPurchaseAt: string;
  daysSinceLastPurchase: number;
  intervalDays: number;
  nextPurchaseAt: string;
  windowStart: string;
  windowEnd: string;
  status: ReorderStatus;
  segment: CustomerSegment;
  probabilityPercent: number;
  score: number;
  reason: string;
  whatsappMessage: string;
};

export type CommercialIntelligence = {
  mode: "demo" | "live";
  generatedAt: string;
  rules: Array<{ key: string; label: string; value: string }>;
  metrics: {
    customers: number;
    repeatReady: number;
    overdue: number;
    averageCadenceDays: number;
    windowValueCents: number;
  };
  segments: Array<{ key: CustomerSegment; label: string; count: number; description: string }>;
  priorityQueue: ReorderPrediction[];
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(later: Date, earlier: Date) {
  return Math.max(0, Math.round((later.getTime() - earlier.getTime()) / DAY_MS));
}

function median(values: number[]) {
  if (!values.length) return 30;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function calculateReorderPrediction(
  customerName: string,
  purchases: Purchase[],
  asOf = new Date(),
): ReorderPrediction {
  const sorted = [...purchases].sort((a, b) => a.purchasedAt.getTime() - b.purchasedAt.getTime());
  const last = sorted.at(-1) ?? { purchasedAt: asOf, totalCents: 0 };
  const intervals = sorted.slice(1).map((purchase, index) => daysBetween(purchase.purchasedAt, sorted[index].purchasedAt));
  const intervalDays = clamp(Math.round(median(intervals)), 7, 90);
  const daysSinceLastPurchase = daysBetween(asOf, last.purchasedAt);
  const nextPurchase = new Date(last.purchasedAt.getTime() + intervalDays * DAY_MS);
  const windowStart = new Date(nextPurchase.getTime() - 3 * DAY_MS);
  const windowEnd = new Date(nextPurchase.getTime() + 5 * DAY_MS);
  const averageTicketCents = Math.round(average(sorted.map((purchase) => purchase.totalCents)));

  let status: ReorderStatus = "new";
  if (sorted.length >= 2) {
    if (daysSinceLastPurchase > intervalDays * 1.25) status = "overdue";
    else if (daysSinceLastPurchase >= intervalDays * 0.8) status = "due";
    else status = "upcoming";
  }

  const segment: CustomerSegment = sorted.length < 2
    ? "new"
    : averageTicketCents >= 120000 && sorted.length >= 3
      ? "vip"
      : status === "overdue"
        ? "at_risk"
        : status === "due"
          ? "repeat_ready"
          : "active";

  const cadenceConfidence = sorted.length < 2 ? 8 : Math.min(24, 8 + intervals.length * 5);
  const recencyFit = sorted.length < 2 ? 8 : clamp(24 - Math.abs(daysSinceLastPurchase - intervalDays) * 2, 0, 24);
  const valueScore = clamp(Math.round(averageTicketCents / 10000), 0, 20);
  const statusBonus = status === "overdue" ? 14 : status === "due" ? 12 : status === "upcoming" ? 6 : 0;
  const score = clamp(cadenceConfidence + recencyFit + valueScore + statusBonus, 0, 100);
  const probabilityPercent = clamp(Math.round(35 + cadenceConfidence + recencyFit + valueScore + (status === "due" ? 8 : status === "upcoming" ? 4 : 0)), 15, 92);

  const reason = sorted.length < 2
    ? "Primeira recompra: ainda sem cadência histórica confiável."
    : status === "overdue"
      ? `Atraso de ${Math.max(0, daysSinceLastPurchase - intervalDays)} dias frente à cadência mediana.`
      : status === "due"
        ? `Cliente entrou na janela de recompra de ${intervalDays} dias.`
        : `Próxima janela estimada em ${Math.max(0, intervalDays - daysSinceLastPurchase)} dias.`;

  const firstName = customerName.split(" ")[0];
  const whatsappMessage = status === "overdue"
    ? `Oi, ${firstName}! Sentimos sua falta. Posso separar uma seleção fresca de frutos do mar para você esta semana?`
    : `Oi, ${firstName}! Sua próxima janela de compra está chegando. Quer que eu monte uma sugestão com seus favoritos?`;

  return {
    customerName,
    orderCount: sorted.length,
    averageTicketCents,
    lastPurchaseAt: isoDate(last.purchasedAt),
    daysSinceLastPurchase,
    intervalDays,
    nextPurchaseAt: isoDate(nextPurchase),
    windowStart: isoDate(windowStart),
    windowEnd: isoDate(windowEnd),
    status,
    segment,
    probabilityPercent,
    score,
    reason,
    whatsappMessage,
  };
}

function buildCommercialIntelligence(customerPurchases: Map<string, Purchase[]>, mode: "demo" | "live", asOf = new Date()): CommercialIntelligence {
  const priorityQueue = Array.from(customerPurchases.entries())
    .map(([customerName, purchases]) => calculateReorderPrediction(customerName, purchases, asOf))
    .sort((a, b) => b.score - a.score || b.averageTicketCents - a.averageTicketCents);
  const repeatReady = priorityQueue.filter((item) => item.status === "due" || item.status === "overdue");
  const averageCadenceDays = Math.round(average(priorityQueue.filter((item) => item.orderCount > 1).map((item) => item.intervalDays)) || 30);
  const windowValueCents = repeatReady.reduce((sum, item) => sum + item.averageTicketCents, 0);
  const segmentDefinitions: Array<{ key: CustomerSegment; label: string; description: string }> = [
    { key: "vip", label: "VIP", description: "Alto valor e relacionamento recorrente." },
    { key: "repeat_ready", label: "Prontos para recompra", description: "Entraram na janela de contato." },
    { key: "at_risk", label: "Em risco", description: "Passaram da cadência esperada." },
    { key: "new", label: "Novos", description: "Ainda sem histórico suficiente." },
    { key: "active", label: "Ativos", description: "Cadência saudável, fora da janela." },
  ];

  return {
    mode,
    generatedAt: asOf.toISOString(),
    rules: [
      { key: "cadence", label: "Cadência", value: "Mediana dos intervalos entre compras; mínimo de 7 e máximo de 90 dias." },
      { key: "window", label: "Janela", value: "3 dias antes até 5 dias depois da próxima compra estimada." },
      { key: "overdue", label: "Atraso", value: "Mais de 125% da cadência mediana desde a última compra." },
      { key: "score", label: "Prioridade", value: "Cadência + aderência de recência + valor do ticket + urgência." },
    ],
    metrics: {
      customers: priorityQueue.length,
      repeatReady: repeatReady.length,
      overdue: priorityQueue.filter((item) => item.status === "overdue").length,
      averageCadenceDays,
      windowValueCents,
    },
    segments: segmentDefinitions.map((definition) => ({ ...definition, count: priorityQueue.filter((item) => item.segment === definition.key).length })),
    priorityQueue,
  };
}

function demoPurchases(asOf: Date) {
  const ago = (days: number) => new Date(asOf.getTime() - days * DAY_MS);
  return new Map<string, Purchase[]>([
    ["Casa do Mar", [{ purchasedAt: ago(84), totalCents: 98200 }, { purchasedAt: ago(56), totalCents: 128400 }, { purchasedAt: ago(28), totalCents: 116500 }]],
    ["Rafael Nunes", [{ purchasedAt: ago(61), totalCents: 28600 }, { purchasedAt: ago(39), totalCents: 34200 }, { purchasedAt: ago(18), totalCents: 31800 }]],
    ["Marina Costa", [{ purchasedAt: ago(65), totalCents: 63800 }, { purchasedAt: ago(31), totalCents: 63800 }]],
    ["Pescador Urbano", [{ purchasedAt: ago(101), totalCents: 176500 }, { purchasedAt: ago(75), totalCents: 164500 }, { purchasedAt: ago(49), totalCents: 188500 }, { purchasedAt: ago(22), totalCents: 176500 }]],
    ["Bistrô Atlântico", [{ purchasedAt: ago(135), totalCents: 94200 }, { purchasedAt: ago(90), totalCents: 105600 }, { purchasedAt: ago(45), totalCents: 117800 }]],
    ["Ana Ribeiro", [{ purchasedAt: ago(12), totalCents: 45900 }]],
  ]);
}

export async function getCommercialIntelligence(tenantId?: number, asOf = new Date()): Promise<CommercialIntelligence> {
  const db = await getDb();
  if (!db || !tenantId) return buildCommercialIntelligence(demoPurchases(asOf), "demo", asOf);

  try {
    const rows = await db
      .select({ customerName: sales.customerName, totalCents: sales.totalCents, createdAt: sales.createdAt })
      .from(sales)
      .where(and(eq(sales.tenantId, tenantId), sql`${sales.status} <> 'cancelled'`))
      .orderBy(asc(sales.createdAt));
    if (!rows.length) return buildCommercialIntelligence(demoPurchases(asOf), "demo", asOf);
    const grouped = new Map<string, Purchase[]>();
    for (const row of rows) {
      const current = grouped.get(row.customerName) ?? [];
      current.push({ purchasedAt: row.createdAt, totalCents: Number(row.totalCents) });
      grouped.set(row.customerName, current);
    }
    return buildCommercialIntelligence(grouped, "live", asOf);
  } catch (error) {
    console.warn("[Commercial Intelligence] Returning demo data until migrations are applied:", error);
    return buildCommercialIntelligence(demoPurchases(asOf), "demo", asOf);
  }
}

export const commercialIntelligenceRules = {
  cadence: "Mediana dos intervalos entre compras; 7–90 dias",
  window: "-3/+5 dias em torno da próxima compra estimada",
  overdue: ">125% da cadência desde a última compra",
  firstPurchase: "Sem previsão forte até existir uma segunda compra",
  score: "Cadência, recência, ticket médio e urgência",
} as const;

// Import is intentionally kept available for future customer-level enrichment without changing the public contract.
export { customers };
