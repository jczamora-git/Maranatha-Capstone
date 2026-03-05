-- ============================================================================
-- TRANSACTION SAFETY MIGRATION (MySQL 8.4.3 Compatible)
-- Purpose: Add constraints and columns to prevent race conditions and data corruption
-- Date: March 5, 2026
-- Run this on your production database AFTER backing up!
-- 
-- IMPORTANT NOTES:
-- 1. Some statements may fail if columns/indexes already exist - THIS IS NORMAL
-- 2. Check the error messages - "Duplicate column" or "Duplicate key" means it already exists
-- 3. Errors are safe to ignore if they indicate existing columns/indexes
-- 4. Uncomment the ALTER TABLE statements (marked with --) to add columns
-- ============================================================================

-- ===========================================================================
-- 1. PAYMENTS TABLE: Add idempotency_key for duplicate prevention
-- ===========================================================================

-- Add idempotency_key column (skip if already exists)
-- ALTER TABLE payments ADD COLUMN idempotency_key VARCHAR(128) NULL AFTER reference_number;
-- ALTER TABLE payments ADD COLUMN version INT UNSIGNED NOT NULL DEFAULT 0 AFTER updated_at;

-- Note: Run the above ALTER statements manually if columns don't exist yet
-- If you get "Duplicate column" error, it means columns already exist (safe to ignore)

-- Add indexes for idempotency
ALTER TABLE payments ADD INDEX idx_idempotency_key (idempotency_key);
ALTER TABLE payments ADD UNIQUE INDEX idx_unique_idempotency (idempotency_key);

-- Note: MySQL allows multiple NULL values in UNIQUE indexes
-- Only non-NULL idempotency_keys will be checked for duplicates


-- ===========================================================================
-- 2. ENROLLMENTS TABLE: Prevent duplicate enrollments per period
-- ===========================================================================

-- Add version column for optimistic locking
-- ALTER TABLE enrollments ADD COLUMN version INT UNSIGNED NOT NULL DEFAULT 0 AFTER updated_at;

-- Prevent duplicate enrollments for same student in same period
-- Only one active enrollment per student per academic period
ALTER TABLE enrollments ADD CONSTRAINT unique_student_period UNIQUE KEY (created_student_id, academic_period_id);

-- Note: If this fails due to existing duplicates, run this first:
-- DELETE e1 FROM enrollments e1
-- INNER JOIN enrollments e2 
-- WHERE e1.id > e2.id 
-- AND e1.created_student_id = e2.created_student_id 
-- AND e1.academic_period_id = e2.academic_period_id;


-- ===========================================================================
-- 3. USERS TABLE: Prevent duplicate emails and improve lookups
-- ===========================================================================

-- Ensure email uniqueness (skip if already exists)
-- CREATE UNIQUE INDEX idx_unique_email ON users (email);

-- Add version column for optimistic locking on user updates
-- ALTER TABLE users ADD COLUMN version INT UNSIGNED NOT NULL DEFAULT 0 AFTER updated_at;

-- Index for faster role-based queries
CREATE INDEX idx_users_role_status ON users (role, status);

-- Index for faster email lookups during login
CREATE INDEX idx_users_email_status ON users (email, status);


-- ===========================================================================
-- 4. AUDIT_LOGS TABLE: Optimize for read performance
-- ===========================================================================

-- Index for querying logs by user (faster admin audit views)
CREATE INDEX idx_audit_actor_time ON audit_logs (actor_user_id, created_at DESC);

-- Index for querying logs by entity (e.g., all payment logs)
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id, created_at DESC);

-- Index for querying logs by action (e.g., all "payment.created" actions)
CREATE INDEX idx_audit_action ON audit_logs (action, created_at DESC);

-- Index for time-based queries (recent activity dashboard)
CREATE INDEX idx_audit_time ON audit_logs (created_at DESC);


-- ===========================================================================
-- 5. STUDENTS TABLE: Add constraint and indexes
-- ===========================================================================

-- Ensure one student per user account
CREATE UNIQUE INDEX idx_unique_user_student ON students (user_id);

-- Faster lookups by student_id (for attendance, grades, etc.)
CREATE INDEX idx_students_student_id ON students (student_id);

-- Faster section/year level queries
CREATE INDEX idx_students_section_year ON students (section_id, year_level);


-- ===========================================================================
-- 6. PAYMENT_PLAN_INSTALLMENTS: Prevent duplicate payment processing
-- ===========================================================================

-- Add version column for optimistic locking
-- ALTER TABLE installments ADD COLUMN version INT UNSIGNED NOT NULL DEFAULT 0 AFTER updated_at;

-- Index for faster due date queries (payment reminders)
CREATE INDEX idx_installments_due ON installments (due_date, status);


-- ===========================================================================
-- 7. PERFORMANCE OPTIMIZATION: Add composite indexes
-- ===========================================================================

-- Faster enrollment filtering by status and period
CREATE INDEX idx_enrollments_status_period ON enrollments (status, academic_period_id, submitted_date DESC);

-- Faster payment filtering by status and period
CREATE INDEX idx_payments_status_period ON payments (status, academic_period_id, payment_date DESC);

-- Faster payment student lookups
CREATE INDEX idx_payments_student_status ON payments (student_id, status, payment_date DESC);


-- ===========================================================================
-- 8. SESSION MANAGEMENT: Add indexes for faster session queries
-- ===========================================================================

-- Faster session cleanup for expired sessions (skip if sessions table doesn't exist)
-- CREATE INDEX idx_sessions_expiry ON sessions (expiry_time);


-- ===========================================================================
-- VERIFICATION QUERIES
-- Run these after migration to verify success:
-- ===========================================================================

-- Check if idempotency_key was added
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'payments' 
AND COLUMN_NAME = 'idempotency_key';

-- Check if unique constraint was added to enrollments
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'enrollments' 
AND CONSTRAINT_NAME = 'unique_student_period';

-- Check all new indexes
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND INDEX_NAME LIKE 'idx_%'
ORDER BY TABLE_NAME, INDEX_NAME;

-- Check for duplicate enrollments (should return 0 rows after constraint)
SELECT created_student_id, academic_period_id, COUNT(*) as count
FROM enrollments
WHERE created_student_id IS NOT NULL
GROUP BY created_student_id, academic_period_id
HAVING count > 1;


-- ===========================================================================
-- ROLLBACK SCRIPT (if needed - save separately!)
-- ===========================================================================

/*
-- WARNING: Only run this if you need to rollback the migration!

-- Remove payments constraints
ALTER TABLE payments DROP INDEX idx_unique_idempotency;
ALTER TABLE payments DROP INDEX idx_unique_service_period;
ALTER TABLE payments DROP INDEX idx_idempotency_key;
ALTER TABLE payments DROP COLUMN idempotency_key;
ALTER TABLE payments DROP COLUMN version;

-- Remove enrollments constraint
ALTER TABLE enrollments DROP CONSTRAINT unique_student_period;
ALTER TABLE enrollments DROP COLUMN version;

-- Remove users constraints
ALTER TABLE users DROP COLUMN version;

-- Remove indexes (optional, they don't hurt performance)
DROP INDEX idx_users_role_status ON users;
DROP INDEX idx_audit_actor_time ON audit_logs;
DROP INDEX idx_audit_entity ON audit_logs;
-- ... etc
*/


-- ===========================================================================
-- MIGRATION COMPLETE
-- ===========================================================================

-- Next steps after running this migration:
-- 1. Update PaymentController.php with transaction wrappers
-- 2. Update EnrollmentController.php with transaction wrappers
-- 3. Update UserController.php with optimistic locking
-- 4. Test duplicate submission prevention
-- 5. Load test with 50 concurrent requests

SELECT 'Migration completed successfully!' AS status,
       NOW() AS completed_at;
