CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetId` int NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`status` enum('ongoing','resolved') NOT NULL DEFAULT 'ongoing',
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoring_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetId` int NOT NULL,
	`statusCode` int,
	`responseTime` int,
	`isSuccess` int NOT NULL,
	`errorMessage` text,
	`checkedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monitoring_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoring_targets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(2048) NOT NULL,
	`description` text,
	`method` varchar(10) NOT NULL DEFAULT 'GET',
	`checkInterval` int NOT NULL DEFAULT 300,
	`timeout` int NOT NULL DEFAULT 10,
	`expectedStatusCode` int NOT NULL DEFAULT 200,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monitoring_targets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uptime_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetId` int NOT NULL,
	`period` varchar(20) NOT NULL,
	`timestamp` timestamp NOT NULL,
	`totalChecks` int NOT NULL DEFAULT 0,
	`successfulChecks` int NOT NULL DEFAULT 0,
	`uptimePercentage` decimal(5,2) NOT NULL DEFAULT '100.00',
	`averageResponseTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uptime_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `users`;