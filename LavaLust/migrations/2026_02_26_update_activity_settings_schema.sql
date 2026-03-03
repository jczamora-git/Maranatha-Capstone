-- Migration: Update activity_settings from key-value to wide-column schema
-- Date: 2026-02-26
-- Adds proper setting columns and two new JSON text fields for quiz section directions/word boxes

ALTER TABLE `activity_settings`
  MODIFY COLUMN `setting_key` varchar(100) NULL DEFAULT NULL,
  MODIFY COLUMN `setting_value` text NULL,
  ADD COLUMN `time_limit` int NULL,
  ADD COLUMN `max_attempts` int NOT NULL DEFAULT 1,
  ADD COLUMN `shuffle_questions` tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN `shuffle_choices` tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN `show_correct_answers` tinyint(1) NOT NULL DEFAULT 1,
  ADD COLUMN `pass_threshold` decimal(5,2) NULL,
  ADD COLUMN `available_from` datetime NULL,
  ADD COLUMN `available_until` datetime NULL,
  ADD COLUMN `section_directions` text NULL COMMENT 'JSON: per-type directions keyed by question_type',
  ADD COLUMN `section_word_boxes` text NULL COMMENT 'JSON: per-type word box words keyed by question_type',
  ADD COLUMN `created_at` datetime NULL,
  ADD COLUMN `updated_at` datetime NULL;
