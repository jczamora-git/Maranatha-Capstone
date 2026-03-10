-- Migration: create simple concerns/tickets module
-- Purpose: replace one-shot feedback with parent/student <-> admin conversation threads.

CREATE TABLE IF NOT EXISTS `concern_tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_no` VARCHAR(24) NOT NULL,
  `user_id` INT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'General',
  `subject` VARCHAR(150) NOT NULL,
  `status` ENUM('Open','In Progress','Resolved','Closed') NOT NULL DEFAULT 'Open',
  `overall_sentiment` VARCHAR(20) NULL,
  `overall_confidence` DECIMAL(6,5) NULL,
  `sentiment_updated_at` DATETIME NULL,
  `last_message_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_ticket_no` (`ticket_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_overall_sentiment` (`overall_sentiment`),
  KEY `idx_category` (`category`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_last_message_at` (`last_message_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `concern_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` INT NOT NULL,
  `sender_user_id` INT NULL,
  `message` TEXT NOT NULL,
  `sentiment` VARCHAR(20) NULL,
  `confidence` DECIMAL(6,5) NULL,
  `probabilities` TEXT NULL COMMENT 'JSON string of label probabilities',
  `analyzed_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_ticket_id` (`ticket_id`),
  KEY `idx_sentiment` (`sentiment`),
  KEY `idx_sender_user_id` (`sender_user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional legacy migration from feedback (run once if needed)
-- INSERT INTO `concern_tickets` (`ticket_no`, `user_id`, `category`, `subject`, `status`, `overall_sentiment`, `overall_confidence`, `sentiment_updated_at`, `last_message_at`, `created_at`, `updated_at`)
-- SELECT
--   CONCAT('TKT-', LPAD(`id`, 6, '0')),
--   `user_id`,
--   COALESCE(`category`, 'General'),
--   COALESCE(NULLIF(TRIM(`title`), ''), CONCAT('Feedback #', `id`)),
--   CASE
--     WHEN `response_text` IS NOT NULL AND TRIM(`response_text`) <> '' THEN 'Resolved'
--     ELSE 'Open'
--   END,
--   `sentiment`,
--   `confidence`,
--   CASE WHEN `sentiment` IS NOT NULL THEN COALESCE(`responded_at`, `created_at`) ELSE NULL END,
--   COALESCE(`responded_at`, `created_at`),
--   `created_at`,
--   `updated_at`
-- FROM `feedback`;
--
-- INSERT INTO `concern_messages` (`ticket_id`, `sender_user_id`, `message`, `sentiment`, `confidence`, `probabilities`, `analyzed_at`, `created_at`)
-- SELECT
--   t.`id`,
--   f.`user_id`,
--   f.`message`,
--   f.`sentiment`,
--   f.`confidence`,
--   f.`probabilities`,
--   CASE WHEN f.`sentiment` IS NOT NULL THEN f.`created_at` ELSE NULL END,
--   f.`created_at`
-- FROM `feedback` f
-- JOIN `concern_tickets` t ON t.`ticket_no` = CONCAT('TKT-', LPAD(f.`id`, 6, '0'));
--
-- INSERT INTO `concern_messages` (`ticket_id`, `sender_user_id`, `message`, `created_at`)
-- SELECT
--   t.`id`,
--   f.`responded_by`,
--   f.`response_text`,
--   COALESCE(f.`responded_at`, f.`updated_at`)
-- FROM `feedback` f
-- JOIN `concern_tickets` t ON t.`ticket_no` = CONCAT('TKT-', LPAD(f.`id`, 6, '0'))
-- WHERE f.`response_text` IS NOT NULL AND TRIM(f.`response_text`) <> '';
