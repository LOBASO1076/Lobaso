CREATE TABLE `tenantMemberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','operator','viewer') NOT NULL DEFAULT 'viewer',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenantMemberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_memberships_tenant_user_unique` UNIQUE(`tenantId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`status` enum('active','suspended') NOT NULL DEFAULT 'active',
	`settingsJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `tenant_memberships_user_idx` ON `tenantMemberships` (`userId`);--> statement-breakpoint
CREATE INDEX `tenants_status_idx` ON `tenants` (`status`);