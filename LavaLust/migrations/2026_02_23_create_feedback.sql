-- Migration: create feedback
-- Stores student feedback with optional sentiment analysis results.

CREATE TABLE IF NOT EXISTS `feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'student',
  `category` VARCHAR(50) NOT NULL,
  `title` VARCHAR(120) NULL,
  `message` TEXT NOT NULL,
  `sentiment` VARCHAR(20) NULL,
  `confidence` DECIMAL(6,5) NULL,
  `probabilities` TEXT NULL COMMENT 'JSON string of label probabilities',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`),
  KEY `idx_sentiment` (`sentiment`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
