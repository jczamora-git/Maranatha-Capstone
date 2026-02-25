-- Migration: Add school_year to learning_materials
-- Date: 2026-02-26
-- Purpose: Scope learning materials to a specific school year

ALTER TABLE `learning_materials`
  ADD COLUMN `school_year` VARCHAR(20) NULL DEFAULT NULL
    COMMENT 'School year this material belongs to, e.g. 2025-2026'
    AFTER `section_id`;

-- Backfill existing rows with NULL (they will appear for all SYs until re-saved by teacher)
-- Optional: to hide old materials from filtered views, set them to a known year:
-- UPDATE `learning_materials` SET `school_year` = '2024-2025' WHERE `school_year` IS NULL;
