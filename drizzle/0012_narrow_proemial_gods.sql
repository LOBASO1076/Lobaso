ALTER TABLE `catalogReconciliationItems` MODIFY COLUMN `channel` enum('b2c','b2b','unassigned') NOT NULL;--> statement-breakpoint
ALTER TABLE `catalogReconciliationItems` ADD `calibreOrWeight` varchar(180);--> statement-breakpoint
ALTER TABLE `catalogReconciliationItems` ADD `lot` varchar(120);--> statement-breakpoint
ALTER TABLE `catalogReconciliationItems` ADD `expiryDate` timestamp;--> statement-breakpoint
ALTER TABLE `catalogReconciliationItems` ADD `photoCandidate` varchar(255);--> statement-breakpoint
ALTER TABLE `catalogReconciliationItems` ADD `taxPolicy` varchar(180);--> statement-breakpoint
ALTER TABLE `catalogReconciliationItems` ADD `logisticsPolicy` varchar(180);--> statement-breakpoint
ALTER TABLE `catalogReconciliationItems` ADD `availability` enum('unknown','available','unavailable') DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE `catalogReconciliationItems` ADD `trafficLight` enum('red','yellow','green') DEFAULT 'red' NOT NULL;