-- Migration: create late_payment_explanations
-- Run this SQL in your DB to create the table used by the late payment explanation API
-- NOTE: This is NOT a waiver system - penalties are ALWAYS charged.
-- This table stores mandatory explanations from students about why they paid late.

CREATE TABLE IF NOT EXISTS `late_payment_explanations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `installment_id` INT NOT NULL,
  `penalty_id` INT UNSIGNED NULL COMMENT 'References payment_installment_penalties.id if penalty was recorded',
  `penalty_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Penalty amount at time of explanation',
  `days_overdue` INT NOT NULL DEFAULT 0 COMMENT 'Days overdue when explanation submitted',
  `explanation` TEXT NOT NULL COMMENT 'Student explanation for late payment',
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When explanation was submitted',
  `viewed_by_admin` TINYINT(1) DEFAULT 0 COMMENT 'Whether admin has viewed this',
  `admin_notes` TEXT NULL COMMENT 'Optional admin notes for internal use',
  KEY `idx_student` (`student_id`),
  KEY `idx_installment` (`installment_id`),
  KEY `idx_penalty` (`penalty_id`),
  KEY `idx_submitted_at` (`submitted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mandatory explanations for late payments - penalties are still charged';

-- Migration: Remove waive functionality from payment_installment_penalties
-- Penalties are ALWAYS charged per school policy - no exceptions

-- Drop waive-related columns if they exist
ALTER TABLE `payment_installment_penalties` 
  DROP COLUMN IF EXISTS `waived`,
  DROP COLUMN IF EXISTS `waived_by`,
  DROP COLUMN IF EXISTS `waived_at`,
  DROP COLUMN IF EXISTS `notes`;

-- Add explanation reference (optional - links to student's explanation if submitted)
ALTER TABLE `payment_installment_penalties`
  ADD COLUMN `explanation_id` INT NULL COMMENT 'References late_payment_explanations.id if student submitted explanation' AFTER `days_overdue`,
  ADD KEY `idx_explanation` (`explanation_id`);

