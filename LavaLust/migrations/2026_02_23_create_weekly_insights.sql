-- Create weekly_insights table
CREATE TABLE `weekly_insights` (
  `id` int NOT NULL AUTO_INCREMENT,
  `window_start` date NOT NULL,
  `window_end` date NOT NULL,
  `insights_json` text NOT NULL,
  `total_feedback` int NOT NULL DEFAULT 0,
  `model` varchar(120) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_weekly_insights_window` (`window_start`, `window_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
