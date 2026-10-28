-- CANH BAO: XOA TOAN BO DU LIEU TRONG CAC BANG DUOI DAY.
-- Chi chay khi muon khoi tao lai database metro tu dau.
CREATE DATABASE IF NOT EXISTS metro
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE metro;

DROP EVENT IF EXISTS metro_automatic_trips;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS
    wallet_transactions,
    station_gate_journeys,
    ticket_journeys,
    trip_journeys,
    journeys,
    priority_registrations,
    tickets,
    trips,
    stations,
    ticket_types,
    `lines`,
    users;
SET FOREIGN_KEY_CHECKS = 1;

-- MariaDB 10.2.1+. Database moi, trong. Khong dung de nang cap database cu.
SET NAMES utf8mb4;
SET time_zone = '+07:00';

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `fullname` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `wallet_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_phone` (`phone`),
  CONSTRAINT `chk_users_balance` CHECK (`wallet_balance` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lines` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `line_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `order_index` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stations_order` (`line_id`,`order_index`),
  CONSTRAINT `fk_stations_line` FOREIGN KEY (`line_id`) REFERENCES `lines` (`id`),
  CONSTRAINT `chk_stations_order` CHECK (`order_index` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ticket_types` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('SINGLE','DAILY','MONTHLY') NOT NULL,
  -- Gia co dinh theo loai ve cho moi lan mua moi.
  `price` decimal(12,2) NOT NULL,
  `valid_days` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_ticket_types_price` CHECK (`price` > 0),
  CONSTRAINT `chk_ticket_types_days` CHECK (`valid_days` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `ticket_type_id` int(10) unsigned NOT NULL,
  `line_id` int(10) unsigned NOT NULL,
  `qr_code` varchar(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `origin_station_id` int(10) unsigned DEFAULT NULL,
  `destination_station_id` int(10) unsigned DEFAULT NULL,
  `purchase_price` decimal(12,2) NOT NULL,
  `status` enum('ACTIVE','USED','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `purchased_at` datetime NOT NULL DEFAULT current_timestamp(),
  `valid_from` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tickets_qr` (`qr_code`),
  UNIQUE KEY `uq_tickets_id_user` (`id`,`user_id`),
  KEY `fk_tickets_type` (`ticket_type_id`),
  KEY `fk_tickets_line` (`line_id`),
  KEY `idx_tickets_user_time` (`user_id`,`purchased_at`),
  CONSTRAINT `fk_tickets_line` FOREIGN KEY (`line_id`) REFERENCES `lines` (`id`),
  CONSTRAINT `fk_tickets_type` FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_types` (`id`),
  CONSTRAINT `fk_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_ticket_origin` FOREIGN KEY (`origin_station_id`) REFERENCES `stations` (`id`),
  CONSTRAINT `fk_ticket_destination` FOREIGN KEY (`destination_station_id`) REFERENCES `stations` (`id`),
  CONSTRAINT `chk_ticket_route` CHECK ((origin_station_id IS NULL AND destination_station_id IS NULL) OR (origin_station_id IS NOT NULL AND destination_station_id IS NOT NULL AND origin_station_id <> destination_station_id)),
  CONSTRAINT `chk_tickets_price` CHECK (`purchase_price` > 0),
  KEY `idx_tickets_purchased` (`purchased_at`),
  CONSTRAINT `chk_tickets_used` CHECK ((status='USED' AND used_at IS NOT NULL) OR (status<>'USED' AND used_at IS NULL)),
  CONSTRAINT `chk_tickets_used_time` CHECK (used_at IS NULL OR used_at>=valid_from),
  CONSTRAINT `chk_tickets_dates` CHECK (`expires_at` > `valid_from`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `trips` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `line_id` int(10) unsigned NOT NULL,
  `trip_code` varchar(50) NOT NULL,
  `direction` enum('OUTBOUND','INBOUND') NOT NULL,
  `departure_time` datetime NOT NULL,
  `capacity` int(10) unsigned NOT NULL DEFAULT 100,
  `status` enum('SCHEDULED','RUNNING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `trip_code` (`trip_code`),
  KEY `line_id` (`line_id`),
  KEY `idx_trips_departure` (`departure_time`,`line_id`),
  CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`line_id`) REFERENCES `lines` (`id`),
  CONSTRAINT `chk_trips_capacity` CHECK (`capacity` between 1 and 10000)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `journeys` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ticket_id` int(10) unsigned NOT NULL,
  `origin_station_id` int(10) unsigned NOT NULL,
  `destination_station_id` int(10) unsigned DEFAULT NULL,
  `checked_in_at` datetime NOT NULL DEFAULT current_timestamp(),
  `checked_out_at` datetime DEFAULT NULL,
  `checked_in_by` int(10) unsigned NOT NULL,
  `checked_out_by` int(10) unsigned DEFAULT NULL,
  `active_ticket_id` int(10) unsigned GENERATED ALWAYS AS (case when `checked_out_at` is null then `ticket_id` else NULL end) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_open_journey` (`active_ticket_id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `origin_station_id` (`origin_station_id`),
  KEY `destination_station_id` (`destination_station_id`),
  KEY `checked_in_by` (`checked_in_by`),
  KEY `checked_out_by` (`checked_out_by`),
  KEY `idx_journeys_ticket_time` (`ticket_id`,`checked_in_at`),
  CONSTRAINT `journeys_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`),
  CONSTRAINT `journeys_ibfk_3` FOREIGN KEY (`origin_station_id`) REFERENCES `stations` (`id`),
  CONSTRAINT `journeys_ibfk_4` FOREIGN KEY (`destination_station_id`) REFERENCES `stations` (`id`),
  CONSTRAINT `journeys_ibfk_5` FOREIGN KEY (`checked_in_by`) REFERENCES `users` (`id`),
  CONSTRAINT `journeys_ibfk_6` FOREIGN KEY (`checked_out_by`) REFERENCES `users` (`id`),
  CONSTRAINT `chk_journeys_stations` CHECK (`destination_station_id` is null or `destination_station_id` <> `origin_station_id`),
  CONSTRAINT `chk_journeys_checkout_complete` CHECK ((destination_station_id IS NULL AND checked_out_at IS NULL AND checked_out_by IS NULL) OR (destination_station_id IS NOT NULL AND checked_out_at IS NOT NULL AND checked_out_by IS NOT NULL)),
  CONSTRAINT `chk_journeys_time` CHECK (`checked_out_at` is null or `checked_out_at` >= `checked_in_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `ticket_id` int(10) unsigned DEFAULT NULL,
  `type` enum('TOPUP','BUY_TICKET','REFUND') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  `idempotency_key` varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  UNIQUE KEY `uq_wallet_user_request` (`user_id`,`idempotency_key`),
  CONSTRAINT `chk_wallet_request_key` CHECK (CHAR_LENGTH(TRIM(idempotency_key)) > 0),
  KEY `fk_transactions_ticket_owner` (`ticket_id`,`user_id`),
  KEY `idx_transactions_user_time` (`user_id`,`created_at`),
  CONSTRAINT `fk_transactions_ticket_owner` FOREIGN KEY (`ticket_id`, `user_id`) REFERENCES `tickets` (`id`, `user_id`),
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chk_transactions_amount` CHECK (`amount` > 0),
  CONSTRAINT `chk_transactions_ticket` CHECK (`type` = 'TOPUP' and `ticket_id` is null or `type` in ('BUY_TICKET','REFUND') and `ticket_id` is not null)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
