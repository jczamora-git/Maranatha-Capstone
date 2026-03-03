-- Migration: Create quiz_sessions table
-- Date: 2026-03-03
-- Stores per-student quiz attempt sessions so timer and answers survive page refreshes

CREATE TABLE IF NOT EXISTS `quiz_sessions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `activity_id` bigint UNSIGNED NOT NULL COMMENT 'References activities.id',
  `student_id` int UNSIGNED NOT NULL COMMENT 'References students.id',
  `started_at` datetime NOT NULL COMMENT 'When the student clicked Start Quiz',
  `expires_at` datetime DEFAULT NULL COMMENT 'started_at + time_limit; NULL = no time limit',
  `question_order` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'JSON array of question IDs in shuffled order',
  `matching_order` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'JSON: { questionId: [shuffledRightItemOriginalIndices] }',
  `submitted_at` datetime DEFAULT NULL COMMENT 'NULL = still in progress',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_sessions_activity_student` (`activity_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tracks in-progress quiz sessions per student; survives page refresh';

-- The activity_student_answers table already stores per-question answers.
-- We only need to add an updated_at column so we can detect when answers were last changed.
ALTER TABLE `activity_student_answers`
  ADD COLUMN IF NOT EXISTS `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;
