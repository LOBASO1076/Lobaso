CREATE TABLE `auditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`action` varchar(100) NOT NULL,
	`entity` varchar(80) NOT NULL,
	`entityId` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerType` enum('b2c','b2b') NOT NULL DEFAULT 'b2c',
	`name` varchar(180) NOT NULL,
	`legalName` varchar(220),
	`responsibleName` varchar(180),
	`whatsapp` varchar(32),
	`document` varchar(32),
	`email` varchar(320),
	`address` varchar(220),
	`addressNumber` varchar(32),
	`complement` varchar(120),
	`neighborhood` varchar(120),
	`city` varchar(120),
	`state` varchar(2),
	`postalCode` varchar(16),
	`notes` text,
	`defaultPaymentMethod` varchar(64),
	`defaultLogistics` varchar(120),
	`origin` varchar(80),
	`lastPurchaseAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`status` enum('pending','preparing','requested','in_route','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`logistics` varchar(120) NOT NULL DEFAULT 'to_confirm',
	`costCents` int,
	`responsible` varchar(160),
	`addressSnapshot` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`deliveredAt` timestamp,
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `domainEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(80) NOT NULL,
	`aggregateType` varchar(80) NOT NULL,
	`aggregateId` int,
	`payload` text NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `domainEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnelEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventName` varchar(64) NOT NULL,
	`sessionId` varchar(120),
	`source` varchar(80),
	`campaign` varchar(160),
	`entityId` int,
	`metadata` text,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funnelEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `idempotencyKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(160) NOT NULL,
	`scope` varchar(80) NOT NULL,
	`responseJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `idempotencyKeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `idempotency_keys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productNameSnapshot` varchar(180) NOT NULL,
	`skuSnapshot` varchar(80) NOT NULL,
	`quantity` decimal(10,3) NOT NULL,
	`unit` varchar(16) NOT NULL,
	`unitPriceCents` int NOT NULL,
	`subtotalCents` int NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(40) NOT NULL,
	`customerId` int NOT NULL,
	`channel` enum('b2c','b2b') NOT NULL DEFAULT 'b2c',
	`origin` varchar(80),
	`status` enum('new','received','confirming','confirmed','preparing','shipped','delivered','cancelled') NOT NULL DEFAULT 'new',
	`productsTotalCents` int NOT NULL,
	`discountCents` int NOT NULL DEFAULT 0,
	`freightCents` int,
	`totalCents` int NOT NULL,
	`totalStatus` enum('provisional','confirmed') NOT NULL DEFAULT 'provisional',
	`paymentMethod` varchar(64) NOT NULL DEFAULT 'to_confirm',
	`logistics` varchar(120) NOT NULL DEFAULT 'to_confirm',
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `outboxEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(80) NOT NULL,
	`aggregateType` varchar(80) NOT NULL,
	`aggregateId` int,
	`payload` text NOT NULL,
	`status` enum('pending','published','failed') NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`availableAt` timestamp NOT NULL DEFAULT (now()),
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outboxEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`status` enum('pending','started','confirmed','failed','refunded') NOT NULL DEFAULT 'pending',
	`method` varchar(64) NOT NULL DEFAULT 'to_confirm',
	`amountCents` int NOT NULL,
	`providerReference` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `audit_events_entity_idx` ON `auditEvents` (`entity`,`entityId`);--> statement-breakpoint
CREATE INDEX `audit_events_created_at_idx` ON `auditEvents` (`createdAt`);--> statement-breakpoint
CREATE INDEX `customers_whatsapp_idx` ON `customers` (`whatsapp`);--> statement-breakpoint
CREATE INDEX `customers_email_idx` ON `customers` (`email`);--> statement-breakpoint
CREATE INDEX `customers_type_idx` ON `customers` (`customerType`);--> statement-breakpoint
CREATE INDEX `deliveries_order_idx` ON `deliveries` (`orderId`);--> statement-breakpoint
CREATE INDEX `deliveries_status_idx` ON `deliveries` (`status`);--> statement-breakpoint
CREATE INDEX `domain_events_aggregate_idx` ON `domainEvents` (`aggregateType`,`aggregateId`);--> statement-breakpoint
CREATE INDEX `domain_events_type_idx` ON `domainEvents` (`eventType`);--> statement-breakpoint
CREATE INDEX `funnel_events_event_idx` ON `funnelEvents` (`eventName`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `funnel_events_session_idx` ON `funnelEvents` (`sessionId`);--> statement-breakpoint
CREATE INDEX `idempotency_keys_scope_idx` ON `idempotencyKeys` (`scope`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `orderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `order_items_product_idx` ON `orderItems` (`productId`);--> statement-breakpoint
CREATE INDEX `orders_customer_idx` ON `orders` (`customerId`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orders_created_at_idx` ON `orders` (`createdAt`);--> statement-breakpoint
CREATE INDEX `outbox_events_pending_idx` ON `outboxEvents` (`status`,`availableAt`);--> statement-breakpoint
CREATE INDEX `payments_order_idx` ON `payments` (`orderId`);--> statement-breakpoint
CREATE INDEX `payments_status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `auditLogs` (`entity`,`entityId`);--> statement-breakpoint
CREATE INDEX `audit_logs_created_at_idx` ON `auditLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `inventory_movements_product_idx` ON `inventoryMovements` (`productId`);--> statement-breakpoint
CREATE INDEX `inventory_movements_created_at_idx` ON `inventoryMovements` (`createdAt`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `sale_items_sale_idx` ON `saleItems` (`saleId`);--> statement-breakpoint
CREATE INDEX `sale_items_product_idx` ON `saleItems` (`productId`);--> statement-breakpoint
CREATE INDEX `sales_status_created_at_idx` ON `sales` (`status`,`createdAt`);