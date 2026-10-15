CREATE TABLE `room_games` (
	`room` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `voice_signals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room` text NOT NULL,
	`sender` text NOT NULL,
	`receiver` text NOT NULL,
	`payload` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `voice_receiver_id` ON `voice_signals` (`receiver`,`id`);--> statement-breakpoint
ALTER TABLE `chat_members` ADD `voice` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `chat_members` ADD `voice_epoch` text DEFAULT '' NOT NULL;