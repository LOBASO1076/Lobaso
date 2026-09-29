CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int NOT NULL,
	`action` varchar(80) NOT NULL,
	`entity` varchar(80) NOT NULL,
	`entityId` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryMovements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`type` enum('entry','exit','adjustment') NOT NULL,
	`quantity` decimal(10,3) NOT NULL,
	`unitCostCents` int,
	`reason` varchar(180),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventoryMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sku` varchar(80) NOT NULL,
	`name` varchar(180) NOT NULL,
	`category` enum('peixes','camaroes','crustaceos','moluscos','kits') NOT NULL,
	`unit` varchar(16) NOT NULL DEFAULT 'kg',
	`sellPriceCents` int NOT NULL,
	`costPriceCents` int NOT NULL,
	`stockQty` decimal(10,3) NOT NULL DEFAULT '0',
	`minStockQty` decimal(10,3) NOT NULL DEFAULT '0',
	`status` enum('active','paused') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `saleItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`saleId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` decimal(10,3) NOT NULL,
	`unitPriceCents` int NOT NULL,
	`unitCostCents` int NOT NULL,
	CONSTRAINT `saleItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`channel` enum('whatsapp','store','instagram','other') NOT NULL DEFAULT 'whatsapp',
	`status` enum('pending','confirmed','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
	`totalCents` int NOT NULL,
	`marginCents` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
