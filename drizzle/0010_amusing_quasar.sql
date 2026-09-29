CREATE TABLE `catalogReconciliationItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`sourceName` varchar(180) NOT NULL,
	`sourceCategory` varchar(80) NOT NULL,
	`channel` enum('b2c','b2b') NOT NULL,
	`referencePriceCents` int,
	`unit` varchar(16) NOT NULL DEFAULT 'kg',
	`sku` varchar(80),
	`costPriceCents` int,
	`stockQty` decimal(10,3),
	`supplier` varchar(180),
	`photoUrl` varchar(500),
	`evidenceRef` text,
	`status` enum('blocked','ready_for_review','approved','rejected') NOT NULL DEFAULT 'blocked',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalogReconciliationItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalog_reconciliation_tenant_source_unique` UNIQUE(`tenantId`,`channel`,`sourceName`)
);
--> statement-breakpoint
CREATE INDEX `catalog_reconciliation_tenant_status_idx` ON `catalogReconciliationItems` (`tenantId`,`status`);--> statement-breakpoint
CREATE INDEX `catalog_reconciliation_tenant_channel_idx` ON `catalogReconciliationItems` (`tenantId`,`channel`);