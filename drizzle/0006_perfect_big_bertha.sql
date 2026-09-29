ALTER TABLE `products` DROP INDEX `products_sku_unique`;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_tenant_sku_unique` UNIQUE(`tenantId`,`sku`);