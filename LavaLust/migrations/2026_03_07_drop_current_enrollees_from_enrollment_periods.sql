-- Migration: Remove denormalized current_enrollees from enrollment_periods
-- Reason: Enrollee count is now computed from enrollments table

ALTER TABLE `enrollment_periods`
DROP COLUMN `current_enrollees`;
