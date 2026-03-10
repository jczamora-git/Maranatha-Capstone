-- Add graduated status and metadata for student lifecycle management

ALTER TABLE `students`
  MODIFY COLUMN `status` enum('active','inactive','pending','graduated')
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active';

ALTER TABLE `students`
  ADD COLUMN `graduated_at` datetime DEFAULT NULL AFTER `status`,
  ADD COLUMN `graduation_batch` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `graduated_at`;

-- Backfill graduation timestamp for already-graduated rows (if any)
UPDATE `students`
SET `graduated_at` = COALESCE(`graduated_at`, NOW())
WHERE `status` = 'graduated';
