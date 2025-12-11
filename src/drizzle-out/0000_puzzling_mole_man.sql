-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `province` (
	`province_id` integer PRIMARY KEY NOT NULL,
	`name_th` text,
	`name_en` text
);
--> statement-breakpoint
CREATE TABLE `district` (
	`district_id` integer PRIMARY KEY NOT NULL,
	`province_id` integer,
	`name_th` text,
	`name_en` text,
	FOREIGN KEY (`province_id`) REFERENCES `province`(`province_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subdistrict` (
	`subdistrict_id` integer PRIMARY KEY,
	`district_id` integer,
	`name_th` text,
	`name_en` text,
	`lat` real,
	`long` real,
	`postal_code` integer,
	FOREIGN KEY (`district_id`) REFERENCES `district`(`district_id`) ON UPDATE no action ON DELETE no action
);

*/