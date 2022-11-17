
DROP TABLE IF EXISTS `nft`;

CREATE TABLE `nft` (
	`address` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`owner` CHAR(42) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`name` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`symbol` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`total_supply` INT(10) NULL DEFAULT NULL,
	`cost` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`balance_of_owner` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`wallet_of_owner` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`max_supply` INT(10) NULL DEFAULT NULL,
	`max_mint_amount` INT(10) NULL DEFAULT NULL,
	`not_revealed_uri` VARCHAR(256) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`paused` TINYINT(3) NULL DEFAULT NULL,
	`revealed` TINYINT(3) NULL DEFAULT NULL,
	`base_extension` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`address`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

DROP TABLE IF EXISTS `nft`;

CREATE TABLE `nft_ext` (
	`address` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`name_ext` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`multi_token` TINYINT(3) NULL DEFAULT NULL,
	`on_chain` TINYINT(3) NULL DEFAULT NULL,
	`listable` TINYINT(3) NULL DEFAULT NULL,
	`updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`address`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

DROP TABLE IF EXISTS `task`;

CREATE TABLE `task` (
	`name` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`type` INT(10) NOT NULL DEFAULT '0',
	`cron` VARCHAR(50) NOT NULL DEFAULT '* * * * *' COLLATE 'utf8mb4_0900_ai_ci',
	`scheduled` TINYINT(3) NOT NULL DEFAULT '0',
	`recover` TINYINT(3) NOT NULL DEFAULT '0',
	`running` TINYINT(3) NOT NULL DEFAULT '0',
	`runs` INT(10) NOT NULL DEFAULT '0',
	`duration` INT(10) NOT NULL DEFAULT '0',
	`duration_min` INT(10) NOT NULL DEFAULT '0',
	`duration_max` INT(10) NOT NULL DEFAULT '0',
	`duration_avg` INT(10) NOT NULL DEFAULT '0',
	`duration_ttl` INT(10) NOT NULL DEFAULT '0',
	`sort` INT(10) NOT NULL DEFAULT '0',
	`errors` JSON NULL DEFAULT NULL,
	`updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`name`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

DROP TABLE IF EXISTS `token`;

CREATE TABLE `token` (
	`id` INT(10) NOT NULL,
	`address` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`owner` CHAR(42) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`uri` VARCHAR(5048) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`, `address`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

DROP TABLE IF EXISTS `transfer`;

CREATE TABLE `transfer` (
	`collection` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`from` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`to` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`token` INT(10) NOT NULL,
	`updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`token`, `collection`, `from`, `to`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

DROP TABLE IF EXISTS `transfer_batch`;

CREATE TABLE `transfer_batch` (
	`collection` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`operator` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`from` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`to` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`id` INT(10) NOT NULL,
	`value` INT(10) NOT NULL,
	`updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`collection`, `operator`, `from`, `to`, `id`, `value`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

DROP TABLE IF EXISTS `transfer_single`;

CREATE TABLE `transfer_single` (
	`collection` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`operator` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`from` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`to` CHAR(42) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`id` INT(10) NOT NULL,
	`value` INT(10) NOT NULL,
	`updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`collection`, `operator`, `from`, `to`, `id`, `value`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;
