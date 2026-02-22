-- Migration: add admin response fields to feedback

ALTER TABLE `feedback`
  ADD COLUMN `response_text` TEXT NULL AFTER `probabilities`,
  ADD COLUMN `responded_by` INT NULL AFTER `response_text`,
  ADD COLUMN `responded_at` DATETIME NULL AFTER `responded_by`,
  ADD KEY `idx_responded_at` (`responded_at`);
