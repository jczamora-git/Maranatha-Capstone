-- ============================================================================
-- STEP 1: ADD COLUMNS (Run this first)
-- ============================================================================
-- Copy and paste these ONE AT A TIME into phpMyAdmin SQL tab
-- If you get "Duplicate column" error, that column already exists (skip it)
-- ============================================================================

-- Add idempotency_key to payments table
ALTER TABLE payments ADD COLUMN idempotency_key VARCHAR(128) NULL AFTER reference_number;

-- Add version columns for optimistic locking
ALTER TABLE payments ADD COLUMN version INT UNSIGNED NOT NULL DEFAULT 0 AFTER updated_at;
ALTER TABLE enrollments ADD COLUMN version INT UNSIGNED NOT NULL DEFAULT 0 AFTER updated_at;
ALTER TABLE users ADD COLUMN version INT UNSIGNED NOT NULL DEFAULT 0 AFTER updated_at;
ALTER TABLE installments ADD COLUMN version INT UNSIGNED NOT NULL DEFAULT 0 AFTER updated_at;

-- Verify columns were added
SELECT 'Columns added successfully!' AS status;


-- ============================================================================
-- STEP 2: ADD INDEXES (Run this after Step 1 succeeds)
-- ============================================================================
-- Copy and paste these ONE AT A TIME
-- If you get "Duplicate key name" error, that index already exists (skip it)
-- ============================================================================

-- Payments table indexes
ALTER TABLE payments ADD INDEX idx_idempotency_key (idempotency_key);
ALTER TABLE payments ADD UNIQUE INDEX idx_unique_idempotency (idempotency_key);

-- Users table indexes
CREATE INDEX idx_users_role_status ON users (role, status);
CREATE INDEX idx_users_email_status ON users (email, status);

-- Students table indexes
CREATE UNIQUE INDEX idx_unique_user_student ON students (user_id);
CREATE INDEX idx_students_student_id ON students (student_id);
CREATE INDEX idx_students_section_year ON students (section_id, year_level);

-- Audit logs indexes
CREATE INDEX idx_audit_actor_time ON audit_logs (actor_user_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs (action, created_at DESC);
CREATE INDEX idx_audit_time ON audit_logs (created_at DESC);

-- Installments indexes
CREATE INDEX idx_installments_due ON installments (due_date, status);

-- Enrollments composite indexes
CREATE INDEX idx_enrollments_status_period ON enrollments (status, academic_period_id, submitted_date DESC);

-- Payments composite indexes
CREATE INDEX idx_payments_status_period ON payments (status, academic_period_id, payment_date DESC);
CREATE INDEX idx_payments_student_status ON payments (student_id, status, payment_date DESC);

-- Sessions indexes (skip if sessions table doesn't exist)
-- CREATE INDEX idx_sessions_expiry ON sessions (expiry_time);

-- Verify indexes were added
SELECT 'Indexes added successfully!' AS status;


-- ============================================================================
-- STEP 3: ADD CONSTRAINTS (Run this after Step 2 succeeds)
-- ============================================================================
-- IMPORTANT: This might fail if you have duplicate enrollments
-- If it fails, run the cleanup query below first
-- ============================================================================

-- Prevent duplicate enrollments per student per academic period
ALTER TABLE enrollments ADD CONSTRAINT unique_student_period UNIQUE KEY (created_student_id, academic_period_id);

-- Verify constraint was added
SELECT 'Constraint added successfully!' AS status;


-- ============================================================================
-- IF STEP 3 FAILS: Run this cleanup query FIRST
-- ============================================================================
-- This removes duplicate enrollments (keeps the oldest one)
-- ============================================================================

/*
DELETE e1 FROM enrollments e1
INNER JOIN enrollments e2 
WHERE e1.id > e2.id 
AND e1.created_student_id = e2.created_student_id 
AND e1.academic_period_id = e2.academic_period_id;

-- Then retry Step 3
*/


-- ============================================================================
-- VERIFICATION: Check if everything was added correctly
-- ============================================================================
-- Run these queries to confirm success
-- ============================================================================

-- Check if idempotency_key column exists (should return 1 row)
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'payments' 
AND COLUMN_NAME = 'idempotency_key';

-- Check if unique constraint exists (should return 1 row)
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'enrollments' 
AND CONSTRAINT_NAME = 'unique_student_period';

-- Check all new indexes (should return many rows)
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND INDEX_NAME LIKE 'idx_%'
ORDER BY TABLE_NAME, INDEX_NAME;

-- Check for duplicate enrollments (should return 0 rows)
SELECT created_student_id, academic_period_id, COUNT(*) as count
FROM enrollments
WHERE created_student_id IS NOT NULL
GROUP BY created_student_id, academic_period_id
HAVING count > 1;

-- Final confirmation
SELECT 'Migration completed successfully!' AS status, NOW() AS completed_at;
