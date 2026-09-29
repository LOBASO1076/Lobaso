CREATE TABLE `scheduledJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`jobType` enum('outbox') NOT NULL,
	`taskUid` varchar(65) NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduledJobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `scheduled_jobs_task_uid_unique` UNIQUE(`taskUid`)
);
--> statement-breakpoint
ALTER TABLE `outboxEvents` MODIFY COLUMN `status` enum('pending','processing','published','failed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `outboxEvents` ADD `lastError` varchar(500);--> statement-breakpoint
CREATE INDEX `scheduled_jobs_tenant_type_idx` ON `scheduledJobs` (`tenantId`,`jobType`);