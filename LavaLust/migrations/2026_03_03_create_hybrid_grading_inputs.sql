-- Hybrid grading inputs for flexible class records (LMS + manual + merged)

CREATE TABLE IF NOT EXISTS `grading_input_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `subject_id` BIGINT UNSIGNED NOT NULL,
  `section_id` BIGINT UNSIGNED NOT NULL,
  `academic_period_id` BIGINT UNSIGNED NOT NULL,
  `quarter` VARCHAR(40) NULL,
  `title` VARCHAR(255) NOT NULL,
  `component` ENUM('written','performance','quarterly') NOT NULL,
  `max_score` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `source_type` ENUM('activity','manual','merged') NOT NULL DEFAULT 'manual',
  `source_activity_id` BIGINT UNSIGNED NULL,
  `merge_strategy` ENUM('sum','average') NULL DEFAULT 'sum',
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gii_scope` (`subject_id`, `section_id`, `academic_period_id`, `quarter`, `is_active`),
  KEY `idx_gii_source_activity` (`source_activity_id`),
  UNIQUE KEY `uq_gii_activity_scope` (`source_activity_id`, `section_id`, `academic_period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `grading_input_item_sources` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `grading_input_item_id` BIGINT UNSIGNED NOT NULL,
  `source_type` ENUM('activity','manual') NOT NULL,
  `source_activity_id` BIGINT UNSIGNED NULL,
  `source_item_id` BIGINT UNSIGNED NULL,
  `weight` DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_giis_item` (`grading_input_item_id`),
  KEY `idx_giis_source_activity` (`source_activity_id`),
  KEY `idx_giis_source_item` (`source_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `grading_input_scores` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `grading_input_item_id` BIGINT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `score` DECIMAL(8,2) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_gis_item_student` (`grading_input_item_id`, `student_id`),
  KEY `idx_gis_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
