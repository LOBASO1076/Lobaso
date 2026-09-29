ALTER TABLE `orders` ADD `whatsappMessageId` int;--> statement-breakpoint
CREATE INDEX `orders_whatsapp_message_idx` ON `orders` (`tenantId`,`whatsappMessageId`);