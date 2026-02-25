-- Migration: announcement_reads
-- Tracks which users have read which announcements

CREATE TABLE IF NOT EXISTS `announcement_reads` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `announcement_id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_announcement` (`announcement_id`, `user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_announcement_id` (`announcement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tracks per-user read status for announcements';
