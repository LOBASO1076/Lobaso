import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  auditEvents,
  b2bCabralTerms,
  dashboardNotifications,
  customers,
  deliveries,
  domainEvents,
  funnelEvents,
  idempotencyKeys,
  orderItems,
  orders,
  outboxEvents,
  payments,
  products,
  sales,
} from "../drizzle/schema";
import { getDb } from "./db";
import { resolveConfiguredTenant } from "./tenant";
import { ENV } from "./_core/env";
import { calculateCabralTerms, type B2BPolicyTerms } from "./b2bPolicy";

export type CheckoutItemInput = {
  productId: number;
  quantity: string;
};

export type CreateOrderInput = {
  idempotencyKey: string;
  channel: "b2c" | "b2b";
  origin?: string;
  customer: {
    name: string;
    legalName?: string;
    responsibleName?: string;
    whatsapp?: string;
    document?: string;
    email?: string;
    address?: string;
    addressNumber?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    notes?: string;
    defaultPaymentMethod?: string;
    defaultLogistics?: string;
  };
  items: CheckoutItemInput[];
  discountCents?: number;
  paymentMethod?: string;
  logistics?: string;
  b2bPackageWeightKg?: number;
  b2bDiscountPercent?: number;
  b2bCommissionPercent?: number;
  notes?: string;
  createdBy?: number;
  tenantId?: number;
  whatsappMessageId?: number;
};

export type CheckoutOrderResponse = {
  persisted: boolean;
  mode: "demo" | "live";
  orderId?: number;
  orderNumber: string;
  status: "new";
  customerId?: number;
  productsTotalCents: number;
  discountCents: number;
  freightCents: null;
  totalCents: number;
  totalStatus: "provisional";
  freightStatus: "to_confirm";
  customer: { name: string; whatsapp?: string };
  items: Array<{
    productId: number;
    productNameSnapshot?: string;
    skuSnapshot?: string;
    name?: string;
    sku?: string;
    quantity: string;
    unit: string;
    unitPriceCents: number;
    subtotalCents: number;
  }>;
  commercialTerms?: B2BPolicyTerms;
};

const demoCatalog = [
  { id: 1, sku: "TESTE-01", name: "Camarão Cinza 31/35 — teste", category: "camaroes" as const, unit: "kg", sellPriceCents: 19850, costPriceCents: 0, stockQty: "20", photoUrl: "/assets/seafoods-shrimp-premium.jpg", productKind: "product" as const },
  { id: 2, sku: "TESTE-02", name: "Kit Paella Frutos do Mar — teste", category: "kits" as const, unit: "kit", sellPriceCents: 21540, costPriceCents: 0, stockQty: "12", photoUrl: "/assets/seafoods-lobster-tail.jpg", productKind: "product" as const },
  { id: 3, sku: "TESTE-03", name: "Lombo de Bacalhau — teste", category: "peixes" as const, unit: "kg", sellPriceCents: 18400, costPriceCents: 0, stockQty: "8" },
  { id: 4, sku: "TESTE-04", name: "Filé de Salmão — teste", category: "peixes" as const, unit: "kg", sellPriceCents: 22760, costPriceCents: 0, stockQty: "10" },
  { id: 5, sku: "TESTE-05", name: "Polvo Premium — teste", category: "moluscos" as const, unit: "kg", sellPriceCents: 19680, costPriceCents: 0, stockQty: "7" },
  { id: 6, sku: "TESTE-06", name: "Mexilhão Limpo — teste", category: "moluscos" as const, unit: "kg", sellPriceCents: 20125, costPriceCents: 0, stockQty: "15" },
  { id: 7, sku: "TESTE-07", name: "Lula em Anéis — teste", category: "moluscos" as const, unit: "kg", sellPriceCents: 22340, costPriceCents: 0, stockQty: "12" },
  { id: 8, sku: "TESTE-08", name: "Acompanhamento de preparo — teste", category: "kits" as const, unit: "un", sellPriceCents: 17699, costPriceCents: 0, stockQty: "30" },
  { id: 9, sku: "TESTE-09", name: "Complemento especial — teste", category: "kits" as const, unit: "un", sellPriceCents: 20460, costPriceCents: 0, stockQty: "30" },
  { id: 101, sku: "BOIL-1P", name: "Saco de Frutos do Mar (Boil Seafoods) — 1 pessoa", category: "kits" as const, unit: "un", sellPriceCents: 15990, costPriceCents: 0, stockQty: "50", photoUrl: "/assets/seafoods-boil-hero.jpg", productKind: "boil" as const },
  { id: 102, sku: "BOIL-2P", name: "Saco de Frutos do Mar (Boil Seafoods) — 2 pessoas", category: "kits" as const, unit: "un", sellPriceCents: 24990, costPriceCents: 0, stockQty: "50", photoUrl: "/assets/seafoods-boil-hero.jpg", productKind: "boil" as const },
  { id: 103, sku: "BOIL-3P", name: "Saco de Frutos do Mar (Boil Seafoods) — 3 pessoas", category: "kits" as const, unit: "un", sellPriceCents: 33990, costPriceCents: 0, stockQty: "50", photoUrl: "/assets/seafoods-boil-hero.jpg", productKind: "boil" as const },
  { id: 104, sku: "BOIL-4P", name: "Saco de Frutos do Mar (Boil Seafoods) — 4 pessoas", category: "kits" as const, unit: "un", sellPriceCents: 42990, costPriceCents: 0, stockQty: "50", photoUrl: "/assets/seafoods-boil-hero.jpg", productKind: "boil" as const },
  { id: 105, sku: "BOIL-5P", name: "Saco de Frutos do Mar (Boil Seafoods) — 5 pessoas", category: "kits" as const, unit: "un", sellPriceCents: 51990, costPriceCents: 0, stockQty: "50", photoUrl: "/assets/seafoods-boil-hero.jpg", productKind: "boil" as const },
  { id: 106, sku: "BOIL-6P", name: "Saco de Frutos do Mar (Boil Seafoods) — 6 pessoas", category: "kits" as const, unit: "un", sellPriceCents: 59990, costPriceCents: 0, stockQty: "50", photoUrl: "/assets/seafoods-boil-hero.jpg", productKind: "boil" as const },
  { id: 111, sku: "BOIL-EX-MILHO", name: "Milho extra cozido na manteiga", category: "kits" as const, unit: "un", sellPriceCents: 1500, costPriceCents: 0, stockQty: "100", photoUrl: "/assets/seafoods-boil-hero.jpg", productKind: "extra" as const },
  { id: 112, sku: "BOIL-EX-BATATA", name: "Batatas temperadas extras", category: "kits" as const, unit: "un", sellPriceCents: 1800, costPriceCents: 0, stockQty: "100", photoUrl: "/assets/seafoods-boil-hero.jpg", productKind: "extra" as const },
  { id: 113, sku: "BOIL-EX-CAJUN", name: "Extra de Manteiga Cajun", category: "kits" as const, unit: "un", sellPriceCents: 2200, costPriceCents: 0, stockQty: "100", photoUrl: "/assets/seafoods-boil-hero.jpg", productKind: "extra" as const },
  { id: 114, sku: "BOIL-EX-LAG-100G", name: "Cauda de lagosta extra (100 g)", category: "kits" as const, unit: "100 g", sellPriceCents: 5000, costPriceCents: 0, stockQty: "100", photoUrl: "/assets/seafoods-boil-hero.jpg", productKind: "extra" as const },
  { id: 115, sku: "BOIL-EX-CAM-M-100G", name: "Camarão médio extra (100 g)", category: "kits" as const, unit: "100 g", sellPriceCents: 1700, costPriceCents: 0, stockQty: "100", photoUrl: "/assets/seafoods-boil-hero.jpg", productKind: "extra" as const },
  { id: 116, sku: "BOIL-EX-POLVO-100G", name: "Polvo extra (100 g)", category: "kits" as const, unit: "100 g", sellPriceCents: 2500, costPriceCents: 0, stockQty: "100", photoUrl: "/assets/v8/product/polvo.webp", productKind: "extra" as const },
  { id: 117, sku: "BOIL-EX-LULA-100G", name: "Anéis de lula extra (100 g)", category: "kits" as const, unit: "100 g", sellPriceCents: 2000, costPriceCents: 0, stockQty: "100", photoUrl: "/assets/v8/product/anel-de-lula.webp", productKind: "extra" as const },
  { id: 118, sku: "BOIL-EX-MEX-LIMPO-100G", name: "Mexilhão limpo extra (100 g)", category: "kits" as const, unit: "100 g", sellPriceCents: 1500, costPriceCents: 0, stockQty: "100", photoUrl: "/assets/v8/product/mexilhao.webp", productKind: "extra" as const },
  { id: 119, sku: "BOIL-EX-MEX-MEIA-100G", name: "Mexilhão meia concha extra (100 g)", category: "kits" as const, unit: "100 g", sellPriceCents: 1800, costPriceCents: 0, stockQty: "100", photoUrl: "/assets/v8/product/mexilhao-meia-concha.webp", productKind: "extra" as const },
];

function normalizePhone(value?: string) {
  return value?.replace(/\D/g, "") || undefined;
}

function buildAddressSnapshot(customer: CreateOrderInput["customer"]) {
  return JSON.stringify({
    address: customer.address,
    number: customer.addressNumber,
    complement: customer.complement,
    neighborhood: customer.neighborhood,
    city: customer.city,
    state: customer.state,
    postalCode: customer.postalCode,
  });
}

function resolveB2BPackageWeight(items: Array<{ unit: string; quantity: string }>, declaredWeightKg: number) {
  if (!items.every((item) => item.unit === "kg")) throw new Error("Pedido B2B Cabral exige itens medidos em kg para validar o pacote fechado.");
  const actualWeightKg = items.reduce((total, item) => total + Number(item.quantity), 0);
  if (!Number.isFinite(actualWeightKg) || Math.abs(actualWeightKg - declaredWeightKg) > 0.001) {
    throw new Error("O peso declarado do pacote B2B deve corresponder à soma dos itens em kg.");
  }
  return actualWeightKg;
}

function makeOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `SF-${date}-${nanoid(6).toUpperCase()}`;
}

export function getBrasiliaBusinessDayBounds(now = new Date()) {
  const brasiliaNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const start = new Date(Date.UTC(brasiliaNow.getUTCFullYear(), brasiliaNow.getUTCMonth(), brasiliaNow.getUTCDate()) + 3 * 60 * 60 * 1000);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

export function isSeafoodBoilSku(sku: string) {
  return sku.toUpperCase().startsWith("BOIL-");
}

export async function getCheckoutCatalog() {
  const db = await getDb();
  const tenant = await resolveConfiguredTenant();
  if (!db || !tenant || !ENV.allowPersistence) return { mode: "demo" as const, products: demoCatalog };
  try {
    const rows = await db.select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      category: products.category,
      unit: products.unit,
      sellPriceCents: products.sellPriceCents,
      stockQty: products.stockQty,
    }).from(products).where(and(eq(products.status, "active"), eq(products.tenantId, tenant.id)));
    const isTestCatalog = rows.length > 0 && rows.every((product) => product.sku.startsWith("TESTE-"));
    return { mode: isTestCatalog || !rows.length ? "demo" as const : "live" as const, products: rows.length ? rows : demoCatalog };
  } catch {
    return { mode: "demo" as const, products: demoCatalog };
  }
}

export async function recordFunnelEvent(input: {
  eventName: string;
  sessionId?: string;
  source?: string;
  campaign?: string;
  entityId?: number;
  metadata?: Record<string, unknown>;
  tenantId?: number;
}) {
  const db = await getDb();
  if (!db || !input.tenantId) return { persisted: false, mode: "demo" as const };
  try {
    const result = await db.insert(funnelEvents).values({
      eventName: input.eventName,
      tenantId: input.tenantId,
      sessionId: input.sessionId,
      source: input.source,
      campaign: input.campaign,
      entityId: input.entityId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
    });
    return { persisted: true, id: Number(result[0].insertId) };
  } catch {
    return { persisted: false, mode: "demo" as const };
  }
}

function buildDemoOrderResponse(input: CreateOrderInput, normalizedPhone: string | undefined, discountCents: number): CheckoutOrderResponse {
  const items = input.items.map((item) => {
    const product = demoCatalog.find((candidate) => candidate.id === item.productId);
    if (!product) throw new Error(`Produto ${item.productId} não localizado no catálogo demo`);
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantidade inválida");
    return {
      productId: product.id,
      productNameSnapshot: product.name,
      skuSnapshot: product.sku,
      quantity: item.quantity,
      unit: product.unit,
      unitPriceCents: product.sellPriceCents,
      subtotalCents: Math.round(quantity * product.sellPriceCents),
    };
  });
  const productsTotalCents = items.reduce((sum, item) => sum + item.subtotalCents, 0);
  if (discountCents < 0 || discountCents > productsTotalCents) throw new Error("Desconto inválido");
  const packageWeightKg = input.channel === "b2b" ? resolveB2BPackageWeight(items, input.b2bPackageWeightKg!) : undefined;
  const commercialTerms = input.channel === "b2b"
    ? calculateCabralTerms({
        tableValueCents: productsTotalCents,
        discountPercent: input.b2bDiscountPercent ?? 0,
        commissionPercent: input.b2bCommissionPercent ?? 2,
        packageWeightKg: packageWeightKg!,
      })
    : undefined;
  const appliedDiscountCents = commercialTerms?.discountCents ?? discountCents;
  return {
    persisted: false,
    mode: "demo",
    orderNumber: "SF-DEMO-0001",
    status: "new",
    productsTotalCents,
    discountCents: appliedDiscountCents,
    freightCents: null,
    totalCents: commercialTerms?.finalPriceCents ?? productsTotalCents - appliedDiscountCents,
    totalStatus: "provisional",
    freightStatus: "to_confirm",
    customer: { name: input.customer.name, whatsapp: normalizedPhone },
    items,
    commercialTerms,
  };
}

export async function createOrder(input: CreateOrderInput): Promise<CheckoutOrderResponse> {
  const normalizedPhone = normalizePhone(input.customer.whatsapp);
  const discountCents = input.discountCents ?? 0;
  if (input.channel === "b2b") {
    if (input.b2bPackageWeightKg === undefined) throw new Error("Pedido B2B exige pacote fechado de 5–6 kg.");
    if (!input.customer.document || input.customer.document.replace(/\D/g, "").length !== 14) throw new Error("Pedido B2B exige CNPJ com 14 dígitos.");
    if (input.b2bDiscountPercent !== undefined && input.b2bDiscountPercent > 5) throw new Error("O desconto B2B máximo autorizado é 5%.");
    if (input.b2bCommissionPercent !== undefined && (input.b2bCommissionPercent < 2 || input.b2bCommissionPercent > 5)) throw new Error("A comissão B2B deve estar entre 2% e 5%.");
  }
  const db = await getDb();
  const tenant = input.tenantId ? { id: input.tenantId } : await resolveConfiguredTenant();

  if (!db || !tenant || !ENV.allowPersistence) {
    return buildDemoOrderResponse(input, normalizedPhone, discountCents);
  }
  if (input.channel === "b2b" && !ENV.allowCabralRepresentation) {
    throw new Error("Operação B2B de Representações ainda não aprovada para persistência neste ambiente.");
  }

  try {
    const existingCatalog = await db.select({ sku: products.sku }).from(products).where(eq(products.tenantId, tenant.id)).limit(20);
    const onlyTestCatalog = existingCatalog.length > 0 && existingCatalog.every((product) => product.sku.startsWith("TESTE-"));
    if (!existingCatalog.length || onlyTestCatalog) return buildDemoOrderResponse(input, normalizedPhone, discountCents);
  } catch {
    return buildDemoOrderResponse(input, normalizedPhone, discountCents);
  }

  return db.transaction(async (tx) => {
    const existing = await tx.select().from(idempotencyKeys).where(and(eq(idempotencyKeys.key, input.idempotencyKey), eq(idempotencyKeys.scope, "order.create"), eq(idempotencyKeys.tenantId, tenant.id))).limit(1);
    if (existing[0]) return JSON.parse(existing[0].responseJson) as CheckoutOrderResponse;

    const customerWhere = normalizedPhone ? and(eq(customers.tenantId, tenant.id), eq(customers.whatsapp, normalizedPhone)) : input.customer.email ? and(eq(customers.tenantId, tenant.id), eq(customers.email, input.customer.email)) : undefined;
    const foundCustomer = customerWhere ? (await tx.select().from(customers).where(customerWhere).limit(1))[0] : undefined;
    const mergedCustomer = {
      name: input.customer.name || foundCustomer?.name || "Cliente",
      legalName: input.customer.legalName ?? foundCustomer?.legalName ?? undefined,
      responsibleName: input.customer.responsibleName ?? foundCustomer?.responsibleName ?? undefined,
      whatsapp: normalizedPhone ?? foundCustomer?.whatsapp ?? undefined,
      document: input.customer.document ?? foundCustomer?.document ?? undefined,
      email: input.customer.email ?? foundCustomer?.email ?? undefined,
      address: input.customer.address ?? foundCustomer?.address ?? undefined,
      addressNumber: input.customer.addressNumber ?? foundCustomer?.addressNumber ?? undefined,
      complement: input.customer.complement ?? foundCustomer?.complement ?? undefined,
      neighborhood: input.customer.neighborhood ?? foundCustomer?.neighborhood ?? undefined,
      city: input.customer.city ?? foundCustomer?.city ?? undefined,
      state: input.customer.state ?? foundCustomer?.state ?? undefined,
      postalCode: input.customer.postalCode ?? foundCustomer?.postalCode ?? undefined,
      notes: input.customer.notes ?? foundCustomer?.notes ?? undefined,
      defaultPaymentMethod: input.customer.defaultPaymentMethod ?? foundCustomer?.defaultPaymentMethod ?? undefined,
      defaultLogistics: input.customer.defaultLogistics ?? foundCustomer?.defaultLogistics ?? undefined,
    };
    const customerValues = {
      tenantId: tenant.id,
      customerType: input.channel,
      ...mergedCustomer,
      origin: input.origin,
    };
    let customerId: number;
    if (foundCustomer) {
      customerId = foundCustomer.id;
      await tx.update(customers).set({ ...customerValues, updatedAt: new Date() }).where(eq(customers.id, customerId));
    } else {
      const customerResult = await tx.insert(customers).values(customerValues);
      customerId = Number(customerResult[0].insertId);
    }

    const productIds = Array.from(new Set(input.items.map((item) => item.productId)));
    const catalogRows = await tx.select().from(products).where(and(eq(products.tenantId, tenant.id), inArray(products.id, productIds)));
    if (catalogRows.length !== productIds.length) throw new Error("Um ou mais produtos não foram localizados");
    const catalogById = new Map(catalogRows.map((product) => [product.id, product]));
    const resolvedItems = input.items.map((item) => {
      const product = catalogById.get(item.productId);
      if (!product) throw new Error(`Produto ${item.productId} não localizado`);
      const quantity = Number(item.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantidade inválida");
      return {
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        quantity: item.quantity,
        unit: product.unit,
        unitPriceCents: product.sellPriceCents,
        subtotalCents: Math.round(quantity * product.sellPriceCents),
      };
    });
    if (resolvedItems.some((item) => isSeafoodBoilSku(item.skuSnapshot))) {
      const bounds = getBrasiliaBusinessDayBounds();
      const queued = await tx.select({ count: sql<number>`count(distinct ${orders.id})` })
        .from(orders)
        .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
        .where(and(
          eq(orders.tenantId, tenant.id),
          sql`${orders.status} <> 'cancelled'`,
          sql`${orders.createdAt} >= ${bounds.start}`,
          sql`${orders.createdAt} < ${bounds.end}`,
          sql`${orderItems.skuSnapshot} like 'BOIL-%'`,
        ));
      if (Number(queued[0]?.count ?? 0) >= 10) {
        throw new Error("A fila de Seafood Boil de hoje atingiu o limite operacional de 10 pedidos. Escolha o próximo dia disponível.");
      }
    }
    const productsTotalCents = resolvedItems.reduce((sum, item) => sum + item.subtotalCents, 0);
    if (discountCents < 0 || discountCents > productsTotalCents) throw new Error("Desconto inválido");
    const packageWeightKg = input.channel === "b2b" ? resolveB2BPackageWeight(resolvedItems, input.b2bPackageWeightKg!) : undefined;
    const commercialTerms = input.channel === "b2b"
      ? calculateCabralTerms({
          tableValueCents: productsTotalCents,
          discountPercent: input.b2bDiscountPercent ?? 0,
          commissionPercent: input.b2bCommissionPercent ?? 2,
          packageWeightKg: packageWeightKg!,
        })
      : undefined;
    const appliedDiscountCents = commercialTerms?.discountCents ?? discountCents;
    const totalCents = commercialTerms?.finalPriceCents ?? productsTotalCents - discountCents;
    const orderNumber = makeOrderNumber();
    const orderResult = await tx.insert(orders).values({
      tenantId: tenant.id,
      orderNumber,
      whatsappMessageId: input.whatsappMessageId,
      customerId,
      channel: input.channel,
      origin: input.origin,
      status: "new",
      productsTotalCents,
      discountCents: appliedDiscountCents,
      freightCents: null,
      totalCents,
      totalStatus: "provisional",
      paymentMethod: input.paymentMethod ?? "to_confirm",
      logistics: input.logistics ?? "to_confirm",
      notes: input.notes,
      createdBy: input.createdBy,
    });
    const orderId = Number(orderResult[0].insertId);
    await tx.insert(orderItems).values(resolvedItems.map((item) => ({ ...item, tenantId: tenant.id, orderId })));
    if (commercialTerms) {
      await tx.insert(b2bCabralTerms).values({
        tenantId: tenant.id,
        orderId,
        tableValueCents: commercialTerms.tableValueCents,
        markupPercent: String(commercialTerms.markupPercent),
        markupCents: commercialTerms.markupCents,
        commercialReferenceCents: commercialTerms.commercialReferenceCents,
        discountPercent: String(commercialTerms.discountPercent),
        discountCents: commercialTerms.discountCents,
        finalPriceCents: commercialTerms.finalPriceCents,
        valueAboveTableCents: commercialTerms.valueAboveTableCents,
        additionalMarginCents: commercialTerms.additionalMarginCents,
        commissionPercent: String(commercialTerms.commissionPercent),
        commissionExpectedCents: commercialTerms.commissionExpectedCents,
        representedValueCents: commercialTerms.representedValueCents,
        packageWeightKg: String(commercialTerms.packageWeightKg),
        status: "reference_blocked",
        evidenceRef: "Briefing Cabral recebido em 2026-09-17; aguardando aprovação e evidência contratual.",
      });
    }
    await tx.insert(payments).values({ tenantId: tenant.id, orderId, status: "pending", method: input.paymentMethod ?? "to_confirm", amountCents: totalCents });
    await tx.insert(deliveries).values({ tenantId: tenant.id, orderId, status: "pending", logistics: input.logistics ?? mergedCustomer.defaultLogistics ?? "to_confirm", addressSnapshot: buildAddressSnapshot(mergedCustomer) });

    const payload = JSON.stringify({ orderId, orderNumber, customerId, totalCents, source: input.origin });
    await tx.insert(domainEvents).values({ tenantId: tenant.id, eventType: "ORDER_CREATED", aggregateType: "order", aggregateId: orderId, payload });
    await tx.insert(outboxEvents).values({ tenantId: tenant.id, eventType: "ORDER_CREATED", aggregateType: "order", aggregateId: orderId, payload, status: "pending", attempts: 0 });
    await tx.insert(auditEvents).values({ tenantId: tenant.id, actorId: input.createdBy, action: "order.created", entity: "order", entityId: orderId, metadata: payload });

    const response = {
      persisted: true,
      mode: "live" as const,
      orderId,
      orderNumber,
      status: "new" as const,
      customerId,
      productsTotalCents,
      discountCents: appliedDiscountCents,
      freightCents: null,
      totalCents,
      totalStatus: "provisional" as const,
      freightStatus: "to_confirm" as const,
      customer: { name: mergedCustomer.name, whatsapp: mergedCustomer.whatsapp },
      items: resolvedItems,
      commercialTerms,
    };
    await tx.insert(idempotencyKeys).values({ tenantId: tenant.id, key: input.idempotencyKey, scope: "order.create", responseJson: JSON.stringify(response) });
    return response;
  });
}

export async function getOrderByNumber(orderNumber: string, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(and(eq(orders.orderNumber, orderNumber), eq(orders.tenantId, tenantId))).limit(1);
  return result[0];
}

export async function getRecentOutboxEvents(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(outboxEvents).where(eq(outboxEvents.tenantId, tenantId)).orderBy(desc(outboxEvents.createdAt)).limit(25);
}

export async function updatePaymentStatus(input: {
  tenantId: number;
  orderId: number;
  status: "pending" | "started" | "confirmed" | "failed" | "refunded";
  method?: string;
  providerReference?: string;
  actorId?: number;
}) {
  const db = await getDb();
  if (!db) return { persisted: false, mode: "demo" as const, status: input.status };
  return db.transaction(async (tx) => {
    const payment = (await tx.select({ id: payments.id }).from(payments).where(and(eq(payments.orderId, input.orderId), eq(payments.tenantId, input.tenantId))).limit(1))[0];
    if (!payment) throw new Error("Pagamento não localizado para o pedido no tenant atual");
    await tx.update(payments).set({ status: input.status, method: input.method, providerReference: input.providerReference, updatedAt: new Date() }).where(and(eq(payments.orderId, input.orderId), eq(payments.tenantId, input.tenantId)));
    const eventType = input.status === "confirmed" ? "PAYMENT_CONFIRMED" : "PAYMENT_STATUS_UPDATED";
    const payload = JSON.stringify({ orderId: input.orderId, status: input.status, method: input.method, providerReference: input.providerReference });
    await tx.insert(domainEvents).values({ tenantId: input.tenantId, eventType, aggregateType: "payment", aggregateId: input.orderId, payload });
    await tx.insert(outboxEvents).values({ tenantId: input.tenantId, eventType, aggregateType: "payment", aggregateId: input.orderId, payload, status: "pending", attempts: 0 });
    if (input.status === "confirmed") {
      const order = (await tx.select().from(orders).where(and(eq(orders.id, input.orderId), eq(orders.tenantId, input.tenantId))).limit(1))[0];
      if (order) {
        const existingSale = (await tx.select({ id: sales.id }).from(sales).where(and(eq(sales.tenantId, input.tenantId), eq(sales.orderId, input.orderId))).limit(1))[0];
        if (!existingSale) {
          const customer = (await tx.select({ name: customers.name }).from(customers).where(and(eq(customers.id, order.customerId), eq(customers.tenantId, input.tenantId))).limit(1))[0];
          const cabralTerms = order.channel === "b2b"
            ? (await tx.select().from(b2bCabralTerms).where(and(eq(b2bCabralTerms.tenantId, input.tenantId), eq(b2bCabralTerms.orderId, input.orderId))).limit(1))[0]
            : undefined;
          const channel = order.origin?.toLowerCase().includes("whatsapp") ? "whatsapp" as const : "other" as const;
          const seafoodsRecognizedCents = cabralTerms ? cabralTerms.additionalMarginCents : order.totalCents;
          const saleResult = await tx.insert(sales).values({ tenantId: input.tenantId, orderId: input.orderId, customerName: customer?.name ?? order.orderNumber, channel, status: "confirmed", totalCents: seafoodsRecognizedCents, marginCents: cabralTerms ? cabralTerms.additionalMarginCents : 0, notes: cabralTerms ? `Representação Cabral: valor representado ${cabralTerms.representedValueCents} não reconhecido como receita Seafoods; comissão esperada ${cabralTerms.commissionExpectedCents} aguarda recebimento.` : `Pedido ${order.orderNumber} confirmado por pagamento`, createdBy: input.actorId ?? 0 });
          const saleId = Number(saleResult[0].insertId);
          const notificationValue = cabralTerms ? seafoodsRecognizedCents : order.totalCents;
          await tx.insert(dashboardNotifications).values({ tenantId: input.tenantId, kind: "system", title: cabralTerms ? "Representação Cabral confirmada" : "Nova venda confirmada", body: `${customer?.name ?? order.orderNumber} — Pedido ${order.orderNumber} confirmado; receita Seafoods reconhecida em ${(notificationValue / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`, entityType: "sale", entityId: saleId });
        }
      }
    }
    await tx.insert(auditEvents).values({ tenantId: input.tenantId, actorId: input.actorId, action: `payment.${input.status}`, entity: "payment", entityId: input.orderId, metadata: payload });
    return { persisted: true, mode: "live" as const, status: input.status };
  });
}

export async function updateDeliveryStatus(input: {
  tenantId: number;
  orderId: number;
  status: "pending" | "preparing" | "requested" | "in_route" | "delivered" | "cancelled";
  responsible?: string;
  costCents?: number;
  actorId?: number;
}) {
  const db = await getDb();
  if (!db) return { persisted: false, mode: "demo" as const, status: input.status };
  return db.transaction(async (tx) => {
    await tx.update(deliveries).set({ status: input.status, responsible: input.responsible, costCents: input.costCents, deliveredAt: input.status === "delivered" ? new Date() : undefined }).where(and(eq(deliveries.orderId, input.orderId), eq(deliveries.tenantId, input.tenantId)));
    if (input.status === "delivered") {
      await tx.update(orders).set({ status: "delivered", updatedAt: new Date() }).where(and(eq(orders.id, input.orderId), eq(orders.tenantId, input.tenantId)));
      await tx.update(sales).set({ status: "fulfilled", updatedAt: new Date() }).where(and(eq(sales.orderId, input.orderId), eq(sales.tenantId, input.tenantId)));
    }
    const eventType = input.status === "delivered" ? "ORDER_DELIVERED" : "DELIVERY_STATUS_UPDATED";
    const payload = JSON.stringify({ orderId: input.orderId, status: input.status, responsible: input.responsible, costCents: input.costCents });
    await tx.insert(domainEvents).values({ tenantId: input.tenantId, eventType, aggregateType: "delivery", aggregateId: input.orderId, payload });
    await tx.insert(outboxEvents).values({ tenantId: input.tenantId, eventType, aggregateType: "delivery", aggregateId: input.orderId, payload, status: "pending", attempts: 0 });
    await tx.insert(auditEvents).values({ tenantId: input.tenantId, actorId: input.actorId, action: `delivery.${input.status}`, entity: "delivery", entityId: input.orderId, metadata: payload });
    return { persisted: true, mode: "live" as const, status: input.status };
  });
}

export async function recordCabralCommissionReceived(input: { tenantId: number; orderId: number; amountCents: number; actorId: number }) {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 0) throw new Error("Comissão recebida deve ser informada em centavos não negativos.");
  const db = await getDb();
  if (!db) return { persisted: false, mode: "demo" as const };
  return db.transaction(async (tx) => {
    const terms = (await tx.select().from(b2bCabralTerms).where(and(eq(b2bCabralTerms.tenantId, input.tenantId), eq(b2bCabralTerms.orderId, input.orderId))).limit(1))[0];
    if (!terms) throw new Error("Termos Cabral não localizados para o pedido no tenant atual.");
    if (input.amountCents > terms.commissionExpectedCents) throw new Error("Comissão recebida não pode exceder a comissão esperada aprovada.");
    await tx.update(b2bCabralTerms).set({ commissionReceivedCents: input.amountCents, status: input.amountCents === terms.commissionExpectedCents ? "commission_received" : "invoiced", updatedAt: new Date() }).where(eq(b2bCabralTerms.id, terms.id));
    const payload = JSON.stringify({ orderId: input.orderId, commissionExpectedCents: terms.commissionExpectedCents, commissionReceivedCents: input.amountCents, representedValueCents: terms.representedValueCents });
    await tx.insert(domainEvents).values({ tenantId: input.tenantId, eventType: "CABRAL_COMMISSION_RECORDED", aggregateType: "b2bCabralTerms", aggregateId: terms.id, payload });
    await tx.insert(auditEvents).values({ tenantId: input.tenantId, actorId: input.actorId, action: "cabral.commission_recorded", entity: "b2bCabralTerms", entityId: terms.id, metadata: payload });
    return { persisted: true, commissionExpectedCents: terms.commissionExpectedCents, commissionReceivedCents: input.amountCents };
  });
}

export async function getControlTowerSummary(tenantId?: number) {
  const db = await getDb();
  const demo = {
    mode: "demo" as const,
    actions: [
      { key: "unpaid", label: "Pedidos sem pagamento", count: 2, tone: "warning" },
      { key: "delivery", label: "Entregas em risco", count: 1, tone: "danger" },
      { key: "repeat", label: "Clientes prontos para recompra", count: 4, tone: "good" },
      { key: "stock", label: "Estoque crítico", count: 7, tone: "warning" },
    ],
  };
  if (!db || !tenantId) return demo;
  try {
    const [unpaid, pendingDelivery, criticalStock] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(payments).where(and(eq(payments.tenantId, tenantId), sql`${payments.status} <> 'confirmed'`)),
      db.select({ count: sql<number>`count(*)` }).from(deliveries).where(and(eq(deliveries.tenantId, tenantId), sql`${deliveries.status} in ('requested', 'in_route')`)),
      db.select({ count: sql<number>`count(*)` }).from(products).where(and(eq(products.tenantId, tenantId), sql`${products.stockQty} <= ${products.minStockQty}`)),
    ]);
    return {
      mode: "live" as const,
      actions: [
        { key: "unpaid", label: "Pedidos sem pagamento", count: Number(unpaid[0]?.count ?? 0), tone: "warning" },
        { key: "delivery", label: "Entregas em risco", count: Number(pendingDelivery[0]?.count ?? 0), tone: "danger" },
        { key: "repeat", label: "Clientes prontos para recompra", count: 0, tone: "good" },
        { key: "stock", label: "Estoque crítico", count: Number(criticalStock[0]?.count ?? 0), tone: "warning" },
      ],
    };
  } catch {
    return demo;
  }
}
