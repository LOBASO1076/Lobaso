CREATE TABLE `b2bCabralTerms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`orderId` int NOT NULL,
	`tableValueCents` int NOT NULL,
	`markupPercent` decimal(5,2) NOT NULL,
	`markupCents` int NOT NULL,
	`commercialReferenceCents` int NOT NULL,
	`discountPercent` decimal(5,2) NOT NULL,
	`discountCents` int NOT NULL,
	`finalPriceCents` int NOT NULL,
	`valueAboveTableCents` int NOT NULL,
	`additionalMarginCents` int NOT NULL,
	`commissionPercent` decimal(5,2) NOT NULL,
	`commissionExpectedCents` int NOT NULL,
	`commissionReceivedCents` int NOT NULL DEFAULT 0,
	`representedValueCents` int NOT NULL,
	`packageWeightKg` decimal(10,3) NOT NULL,
	`status` enum('reference_blocked','approved','invoiced','commission_received') NOT NULL DEFAULT 'reference_blocked',
	`evidenceRef` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `b2bCabralTerms_id` PRIMARY KEY(`id`),
	CONSTRAINT `b2b_cabral_terms_order_unique` UNIQUE(`tenantId`,`orderId`)
);
--> statement-breakpoint
CREATE INDEX `b2b_cabral_terms_tenant_status_idx` ON `b2bCabralTerms` (`tenantId`,`status`);