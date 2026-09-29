CREATE TABLE `rateLimitEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientKey` varchar(96) NOT NULL,
	`scope` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rateLimitEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `rate_limit_scope_client_time_idx` ON `rateLimitEvents` (`scope`,`clientKey`,`createdAt`);