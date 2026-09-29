CREATE TABLE `dashboardNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`kind` enum('whatsapp_message','whatsapp_sale_candidate','system') NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`entityType` varchar(80),
	`entityId` int,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dashboardNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsappMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`messageId` varchar(180) NOT NULL,
	`phoneNumberId` varchar(80),
	`fromPhone` varchar(32) NOT NULL,
	`contactName` varchar(180),
	`messageType` varchar(40) NOT NULL,
	`text` text,
	`intent` varchar(160),
	`payloadJson` text NOT NULL,
	`status` enum('received','notified','ignored','failed') NOT NULL DEFAULT 'received',
	`receivedAt` timestamp NOT NULL,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsappMessages_id` PRIMARY KEY(`id`),
	CONSTRAINT `whatsapp_messages_tenant_message_unique` UNIQUE(`tenantId`,`messageId`)
);
--> statement-breakpoint
CREATE INDEX `dashboard_notifications_tenant_unread_idx` ON `dashboardNotifications` (`tenantId`,`readAt`,`createdAt`);--> statement-breakpoint
CREATE INDEX `whatsapp_messages_tenant_received_idx` ON `whatsappMessages` (`tenantId`,`receivedAt`);--> statement-breakpoint
CREATE INDEX `whatsapp_messages_status_idx` ON `whatsappMessages` (`tenantId`,`status`);