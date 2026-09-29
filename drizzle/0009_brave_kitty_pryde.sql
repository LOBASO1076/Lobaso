ALTER TABLE `sales` ADD `orderId` int;--> statement-breakpoint
ALTER TABLE `sales` ADD CONSTRAINT `sales_tenant_order_unique` UNIQUE(`tenantId`,`orderId`);