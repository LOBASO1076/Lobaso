import {
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** Tenant configuration is separated from the reusable Sea System core. */
export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull(),
  displayName: varchar("displayName", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["active", "suspended"]).default("active").notNull(),
  settingsJson: text("settingsJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugUnique: uniqueIndex("tenants_slug_unique").on(table.slug),
  statusIndex: index("tenants_status_idx").on(table.status),
}));

export const tenantMemberships = mysqlTable("tenantMemberships", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "operator", "viewer"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  memberUnique: uniqueIndex("tenant_memberships_tenant_user_unique").on(table.tenantId, table.userId),
  userIndex: index("tenant_memberships_user_idx").on(table.userId),
}));

/** Links a managed platform task UID to a tenant-owned scheduled capability. */
export const scheduledJobs = mysqlTable("scheduledJobs", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  jobType: mysqlEnum("jobType", ["outbox"]).notNull(),
  taskUid: varchar("taskUid", { length: 65 }).notNull(),
  enabled: int("enabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  taskUidUnique: uniqueIndex("scheduled_jobs_task_uid_unique").on(table.taskUid),
  tenantTypeIndex: index("scheduled_jobs_tenant_type_idx").on(table.tenantId, table.jobType),
}));

/** Raw, deduplicated inbound messages from the official WhatsApp webhook. */
export const whatsappMessages = mysqlTable("whatsappMessages", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  messageId: varchar("messageId", { length: 180 }).notNull(),
  phoneNumberId: varchar("phoneNumberId", { length: 80 }),
  fromPhone: varchar("fromPhone", { length: 32 }).notNull(),
  contactName: varchar("contactName", { length: 180 }),
  messageType: varchar("messageType", { length: 40 }).notNull(),
  text: text("text"),
  intent: varchar("intent", { length: 160 }),
  payloadJson: text("payloadJson").notNull(),
  status: mysqlEnum("status", ["received", "notified", "ignored", "failed"]).default("received").notNull(),
  receivedAt: timestamp("receivedAt").notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantMessageUnique: uniqueIndex("whatsapp_messages_tenant_message_unique").on(table.tenantId, table.messageId),
  tenantReceivedIndex: index("whatsapp_messages_tenant_received_idx").on(table.tenantId, table.receivedAt),
  statusIndex: index("whatsapp_messages_status_idx").on(table.tenantId, table.status),
}));

/** In-app notification feed; external WhatsApp replies remain disabled until approved. */
export const dashboardNotifications = mysqlTable("dashboardNotifications", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  kind: mysqlEnum("kind", ["whatsapp_message", "whatsapp_sale_candidate", "system"]).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  entityType: varchar("entityType", { length: 80 }),
  entityId: int("entityId"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantUnreadIndex: index("dashboard_notifications_tenant_unread_idx").on(table.tenantId, table.readAt, table.createdAt),
}));

/**
 * Staging reconciliation queue. A reference price is never promoted into a
 * sellable product until SKU, cost, stock evidence and photo are approved.
 */
export const catalogReconciliationItems = mysqlTable("catalogReconciliationItems", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  sourceName: varchar("sourceName", { length: 180 }).notNull(),
  sourceCategory: varchar("sourceCategory", { length: 80 }).notNull(),
  channel: mysqlEnum("channel", ["b2c", "b2b", "unassigned"]).notNull(),
  referencePriceCents: int("referencePriceCents"),
  unit: varchar("unit", { length: 16 }).default("kg").notNull(),
  calibreOrWeight: varchar("calibreOrWeight", { length: 180 }),
  sku: varchar("sku", { length: 80 }),
  costPriceCents: int("costPriceCents"),
  stockQty: decimal("stockQty", { precision: 10, scale: 3 }),
  lot: varchar("lot", { length: 120 }),
  expiryDate: timestamp("expiryDate"),
  supplier: varchar("supplier", { length: 180 }),
  photoUrl: varchar("photoUrl", { length: 500 }),
  photoCandidate: varchar("photoCandidate", { length: 255 }),
  taxPolicy: varchar("taxPolicy", { length: 180 }),
  logisticsPolicy: varchar("logisticsPolicy", { length: 180 }),
  availability: mysqlEnum("availability", ["unknown", "available", "unavailable"]).default("unknown").notNull(),
  trafficLight: mysqlEnum("trafficLight", ["red", "yellow", "green"]).default("red").notNull(),
  evidenceRef: text("evidenceRef"),
  status: mysqlEnum("status", ["blocked", "ready_for_review", "approved", "rejected"]).default("blocked").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantStatusIndex: index("catalog_reconciliation_tenant_status_idx").on(table.tenantId, table.status),
  tenantChannelIndex: index("catalog_reconciliation_tenant_channel_idx").on(table.tenantId, table.channel),
  tenantSourceUnique: uniqueIndex("catalog_reconciliation_tenant_source_unique").on(table.tenantId, table.channel, table.sourceName),
}));

/**
 * Commercial representation terms are separate from order totals so Cabral's
 * represented value is never mistaken for Seafoods' own revenue.
 */
export const b2bCabralTerms = mysqlTable("b2bCabralTerms", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  orderId: int("orderId").notNull(),
  tableValueCents: int("tableValueCents").notNull(),
  markupPercent: decimal("markupPercent", { precision: 5, scale: 2 }).notNull(),
  markupCents: int("markupCents").notNull(),
  commercialReferenceCents: int("commercialReferenceCents").notNull(),
  discountPercent: decimal("discountPercent", { precision: 5, scale: 2 }).notNull(),
  discountCents: int("discountCents").notNull(),
  finalPriceCents: int("finalPriceCents").notNull(),
  valueAboveTableCents: int("valueAboveTableCents").notNull(),
  additionalMarginCents: int("additionalMarginCents").notNull(),
  commissionPercent: decimal("commissionPercent", { precision: 5, scale: 2 }).notNull(),
  commissionExpectedCents: int("commissionExpectedCents").notNull(),
  commissionReceivedCents: int("commissionReceivedCents").default(0).notNull(),
  representedValueCents: int("representedValueCents").notNull(),
  packageWeightKg: decimal("packageWeightKg", { precision: 10, scale: 3 }).notNull(),
  status: mysqlEnum("status", ["reference_blocked", "approved", "invoiced", "commission_received"]).default("reference_blocked").notNull(),
  evidenceRef: text("evidenceRef"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orderUnique: uniqueIndex("b2b_cabral_terms_order_unique").on(table.tenantId, table.orderId),
  tenantStatusIndex: index("b2b_cabral_terms_tenant_status_idx").on(table.tenantId, table.status),
}));

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  sku: varchar("sku", { length: 80 }).notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  category: mysqlEnum("category", ["peixes", "camaroes", "crustaceos", "moluscos", "kits"]).notNull(),
  unit: varchar("unit", { length: 16 }).default("kg").notNull(),
  sellPriceCents: int("sellPriceCents").notNull(),
  costPriceCents: int("costPriceCents").notNull(),
  stockQty: decimal("stockQty", { precision: 10, scale: 3 }).default("0").notNull(),
  minStockQty: decimal("minStockQty", { precision: 10, scale: 3 }).default("0").notNull(),
  status: mysqlEnum("status", ["active", "paused"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIndex: index("products_status_idx").on(table.status),
  tenantStatusIndex: index("products_tenant_status_idx").on(table.tenantId, table.status),
  tenantSkuUnique: uniqueIndex("products_tenant_sku_unique").on(table.tenantId, table.sku),
}));

export const inventoryMovements = mysqlTable("inventoryMovements", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  productId: int("productId").notNull(),
  type: mysqlEnum("type", ["entry", "exit", "adjustment"]).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitCostCents: int("unitCostCents"),
  reason: varchar("reason", { length: 180 }),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  productIndex: index("inventory_movements_product_idx").on(table.productId),
  createdAtIndex: index("inventory_movements_created_at_idx").on(table.createdAt),
  tenantCreatedAtIndex: index("inventory_movements_tenant_created_at_idx").on(table.tenantId, table.createdAt),
}));

export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  /** Derived only after authoritative payment confirmation; avoids frontend-entered revenue. */
  orderId: int("orderId"),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  channel: mysqlEnum("channel", ["whatsapp", "store", "instagram", "other"]).default("whatsapp").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "fulfilled", "cancelled"]).default("pending").notNull(),
  totalCents: int("totalCents").notNull(),
  marginCents: int("marginCents").default(0).notNull(),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusCreatedAtIndex: index("sales_status_created_at_idx").on(table.status, table.createdAt),
  tenantStatusCreatedAtIndex: index("sales_tenant_status_created_at_idx").on(table.tenantId, table.status, table.createdAt),
  tenantOrderUnique: uniqueIndex("sales_tenant_order_unique").on(table.tenantId, table.orderId),
}));

export const saleItems = mysqlTable("saleItems", {
  id: int("id").autoincrement().primaryKey(),
  saleId: int("saleId").notNull(),
  productId: int("productId").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPriceCents: int("unitPriceCents").notNull(),
  unitCostCents: int("unitCostCents").notNull(),
}, (table) => ({
  saleIndex: index("sale_items_sale_idx").on(table.saleId),
  productIndex: index("sale_items_product_idx").on(table.productId),
}));

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId").notNull(),
  action: varchar("action", { length: 80 }).notNull(),
  entity: varchar("entity", { length: 80 }).notNull(),
  entityId: int("entityId"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  entityIndex: index("audit_logs_entity_idx").on(table.entity, table.entityId),
  createdAtIndex: index("audit_logs_created_at_idx").on(table.createdAt),
}));

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  customerType: mysqlEnum("customerType", ["b2c", "b2b"]).default("b2c").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  legalName: varchar("legalName", { length: 220 }),
  responsibleName: varchar("responsibleName", { length: 180 }),
  whatsapp: varchar("whatsapp", { length: 32 }),
  document: varchar("document", { length: 32 }),
  email: varchar("email", { length: 320 }),
  address: varchar("address", { length: 220 }),
  addressNumber: varchar("addressNumber", { length: 32 }),
  complement: varchar("complement", { length: 120 }),
  neighborhood: varchar("neighborhood", { length: 120 }),
  city: varchar("city", { length: 120 }),
  state: varchar("state", { length: 2 }),
  postalCode: varchar("postalCode", { length: 16 }),
  notes: text("notes"),
  defaultPaymentMethod: varchar("defaultPaymentMethod", { length: 64 }),
  defaultLogistics: varchar("defaultLogistics", { length: 120 }),
  origin: varchar("origin", { length: 80 }),
  lastPurchaseAt: timestamp("lastPurchaseAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  whatsappIndex: index("customers_whatsapp_idx").on(table.whatsapp),
  emailIndex: index("customers_email_idx").on(table.email),
  typeIndex: index("customers_type_idx").on(table.customerType),
  tenantWhatsappIndex: index("customers_tenant_whatsapp_idx").on(table.tenantId, table.whatsapp),
  tenantEmailIndex: index("customers_tenant_email_idx").on(table.tenantId, table.email),
}));

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  orderNumber: varchar("orderNumber", { length: 40 }).notNull(),
  whatsappMessageId: int("whatsappMessageId"),
  customerId: int("customerId").notNull(),
  channel: mysqlEnum("channel", ["b2c", "b2b"]).default("b2c").notNull(),
  origin: varchar("origin", { length: 80 }),
  status: mysqlEnum("status", ["new", "received", "confirming", "confirmed", "preparing", "shipped", "delivered", "cancelled"]).default("new").notNull(),
  productsTotalCents: int("productsTotalCents").notNull(),
  discountCents: int("discountCents").default(0).notNull(),
  freightCents: int("freightCents"),
  totalCents: int("totalCents").notNull(),
  totalStatus: mysqlEnum("totalStatus", ["provisional", "confirmed"]).default("provisional").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }).default("to_confirm").notNull(),
  logistics: varchar("logistics", { length: 120 }).default("to_confirm").notNull(),
  notes: text("notes"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orderNumberUnique: uniqueIndex("orders_order_number_unique").on(table.orderNumber),
  whatsappMessageIndex: index("orders_whatsapp_message_idx").on(table.tenantId, table.whatsappMessageId),
  customerIndex: index("orders_customer_idx").on(table.customerId),
  statusIndex: index("orders_status_idx").on(table.status),
  createdAtIndex: index("orders_created_at_idx").on(table.createdAt),
  tenantCreatedAtIndex: index("orders_tenant_created_at_idx").on(table.tenantId, table.createdAt),
}));

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productNameSnapshot: varchar("productNameSnapshot", { length: 180 }).notNull(),
  skuSnapshot: varchar("skuSnapshot", { length: 80 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 16 }).notNull(),
  unitPriceCents: int("unitPriceCents").notNull(),
  subtotalCents: int("subtotalCents").notNull(),
}, (table) => ({
  orderIndex: index("order_items_order_idx").on(table.orderId),
  productIndex: index("order_items_product_idx").on(table.productId),
  tenantOrderIndex: index("order_items_tenant_order_idx").on(table.tenantId, table.orderId),
}));

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  orderId: int("orderId").notNull(),
  status: mysqlEnum("status", ["pending", "started", "confirmed", "failed", "refunded"]).default("pending").notNull(),
  method: varchar("method", { length: 64 }).default("to_confirm").notNull(),
  amountCents: int("amountCents").notNull(),
  providerReference: varchar("providerReference", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orderIndex: index("payments_order_idx").on(table.orderId),
  statusIndex: index("payments_status_idx").on(table.status),
  tenantStatusIndex: index("payments_tenant_status_idx").on(table.tenantId, table.status),
}));

export const deliveries = mysqlTable("deliveries", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  orderId: int("orderId").notNull(),
  status: mysqlEnum("status", ["pending", "preparing", "requested", "in_route", "delivered", "cancelled"]).default("pending").notNull(),
  logistics: varchar("logistics", { length: 120 }).default("to_confirm").notNull(),
  costCents: int("costCents"),
  responsible: varchar("responsible", { length: 160 }),
  addressSnapshot: text("addressSnapshot"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  deliveredAt: timestamp("deliveredAt"),
}, (table) => ({
  orderIndex: index("deliveries_order_idx").on(table.orderId),
  statusIndex: index("deliveries_status_idx").on(table.status),
  tenantStatusIndex: index("deliveries_tenant_status_idx").on(table.tenantId, table.status),
}));

export const domainEvents = mysqlTable("domainEvents", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  eventType: varchar("eventType", { length: 80 }).notNull(),
  aggregateType: varchar("aggregateType", { length: 80 }).notNull(),
  aggregateId: int("aggregateId"),
  payload: text("payload").notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
}, (table) => ({
  aggregateIndex: index("domain_events_aggregate_idx").on(table.aggregateType, table.aggregateId),
  typeIndex: index("domain_events_type_idx").on(table.eventType),
  tenantOccurredAtIndex: index("domain_events_tenant_occurred_at_idx").on(table.tenantId, table.occurredAt),
}));

export const outboxEvents = mysqlTable("outboxEvents", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  eventType: varchar("eventType", { length: 80 }).notNull(),
  aggregateType: varchar("aggregateType", { length: 80 }).notNull(),
  aggregateId: int("aggregateId"),
  payload: text("payload").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "published", "failed"]).default("pending").notNull(),
  attempts: int("attempts").default(0).notNull(),
  lastError: varchar("lastError", { length: 500 }),
  availableAt: timestamp("availableAt").defaultNow().notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  pendingIndex: index("outbox_events_pending_idx").on(table.status, table.availableAt),
  tenantPendingIndex: index("outbox_events_tenant_pending_idx").on(table.tenantId, table.status, table.availableAt),
}));

export const auditEvents = mysqlTable("auditEvents", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  actorId: int("actorId"),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 80 }).notNull(),
  entityId: int("entityId"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  entityIndex: index("audit_events_entity_idx").on(table.entity, table.entityId),
  createdAtIndex: index("audit_events_created_at_idx").on(table.createdAt),
  tenantCreatedAtIndex: index("audit_events_tenant_created_at_idx").on(table.tenantId, table.createdAt),
}));

export const idempotencyKeys = mysqlTable("idempotencyKeys", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  key: varchar("key", { length: 160 }).notNull(),
  scope: varchar("scope", { length: 80 }).notNull(),
  responseJson: text("responseJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantScopeKeyUnique: uniqueIndex("idempotency_keys_tenant_scope_key_unique").on(table.tenantId, table.scope, table.key),
  scopeIndex: index("idempotency_keys_scope_idx").on(table.scope),
  tenantScopeIndex: index("idempotency_keys_tenant_scope_idx").on(table.tenantId, table.scope),
}));

export const funnelEvents = mysqlTable("funnelEvents", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  eventName: varchar("eventName", { length: 64 }).notNull(),
  sessionId: varchar("sessionId", { length: 120 }),
  source: varchar("source", { length: 80 }),
  campaign: varchar("campaign", { length: 160 }),
  entityId: int("entityId"),
  metadata: text("metadata"),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
}, (table) => ({
  eventIndex: index("funnel_events_event_idx").on(table.eventName, table.occurredAt),
  sessionIndex: index("funnel_events_session_idx").on(table.sessionId),
  tenantEventIndex: index("funnel_events_tenant_event_idx").on(table.tenantId, table.eventName, table.occurredAt),
}));

/** Durable serverless rate-limit window; never use process memory as authority. */
export const rateLimitEvents = mysqlTable("rateLimitEvents", {
  id: int("id").autoincrement().primaryKey(),
  clientKey: varchar("clientKey", { length: 96 }).notNull(),
  scope: varchar("scope", { length: 80 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  scopeClientTimeIndex: index("rate_limit_scope_client_time_idx").on(table.scope, table.clientKey, table.createdAt),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Delivery = typeof deliveries.$inferSelect;
export type DomainEvent = typeof domainEvents.$inferSelect;
export type OutboxEvent = typeof outboxEvents.$inferSelect;
export type FunnelEvent = typeof funnelEvents.$inferSelect;
export type Tenant = typeof tenants.$inferSelect;
export type TenantMembership = typeof tenantMemberships.$inferSelect;
export type RateLimitEvent = typeof rateLimitEvents.$inferSelect;
export type ScheduledJob = typeof scheduledJobs.$inferSelect;
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type DashboardNotification = typeof dashboardNotifications.$inferSelect;
export type CatalogReconciliationItem = typeof catalogReconciliationItems.$inferSelect;
export type B2bCabralTerms = typeof b2bCabralTerms.$inferSelect;
