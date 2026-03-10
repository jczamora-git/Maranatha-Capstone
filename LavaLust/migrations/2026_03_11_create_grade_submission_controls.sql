CREATE TABLE IF NOT EXISTS `grade_submission_controls` (
  `id` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `is_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_by` INT UNSIGNED DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_grade_submission_controls_single_row` CHECK (`id` = 1),
  CONSTRAINT `fk_grade_submission_controls_updated_by`
    FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `grade_submission_controls` (`id`, `is_enabled`)
VALUES (1, 1)
ON DUPLICATE KEY UPDATE `is_enabled` = VALUES(`is_enabled`);
