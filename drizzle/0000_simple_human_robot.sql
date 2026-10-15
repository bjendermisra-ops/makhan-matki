CREATE TABLE `chat_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`hits` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_members` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`name` text NOT NULL,
	`joined` integer NOT NULL,
	FOREIGN KEY (`room`) REFERENCES `chat_rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chat_members_token_hash_unique` ON `chat_members` (`token_hash`);--> statement-breakpoint
CREATE INDEX `members_room` ON `chat_members` (`room`);--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room` text NOT NULL,
	`member` text NOT NULL,
	`name` text NOT NULL,
	`body` text NOT NULL,
	`sent` integer NOT NULL,
	`client_id` text NOT NULL,
	FOREIGN KEY (`room`) REFERENCES `chat_rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messages_room_id` ON `chat_messages` (`room`,`id`);--> statement-breakpoint
CREATE INDEX `messages_member_sent` ON `chat_messages` (`member`,`sent`);--> statement-breakpoint
CREATE UNIQUE INDEX `message_dedup` ON `chat_messages` (`room`,`member`,`client_id`);--> statement-breakpoint
CREATE TABLE `chat_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`owner` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL,
	`closed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chat_rooms_code_unique` ON `chat_rooms` (`code`);