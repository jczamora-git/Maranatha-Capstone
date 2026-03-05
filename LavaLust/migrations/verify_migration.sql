-- ============================================================================
-- MIGRATION VERIFICATION QUERIES
-- ============================================================================
-- Run these queries in phpMyAdmin to check if migration completed successfully
-- Copy and paste ALL queries below, then click "Go"
-- ============================================================================

-- Test 1: Check if idempotency_key column exists in payments table
-- Expected: 1 row with COLUMN_NAME = 'idempotency_key'
SELECT 'Test 1: Checking idempotency_key column...' AS test;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'payments' 
AND COLUMN_NAME = 'idempotency_key';

-- Test 2: Check if version columns exist
-- Expected: 4 rows (payments, enrollments, users, installments)
SELECT 'Test 2: Checking version columns...' AS test;
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('payments', 'enrollments', 'users', 'installments')
AND COLUMN_NAME = 'version'
ORDER BY TABLE_NAME;

-- Test 3: Check if unique constraint exists on enrollments
-- Expected: 1 row with CONSTRAINT_NAME = 'unique_student_period'
SELECT 'Test 3: Checking unique_student_period constraint...' AS test;
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'enrollments' 
AND CONSTRAINT_NAME = 'unique_student_period';

-- Test 4: Check if all new indexes exist
-- Expected: Multiple rows showing all idx_* indexes
SELECT 'Test 4: Checking indexes...' AS test;
SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as columns
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND INDEX_NAME IN (
    'idx_idempotency_key',
    'idx_unique_idempotency',
    'idx_users_role_status',
    'idx_users_email_status',
    'idx_unique_user_student',
    'idx_students_student_id',
    'idx_students_section_year',
    'idx_audit_actor_time',
    'idx_audit_entity',
    'idx_audit_action',
    'idx_audit_time',
    'idx_installments_due',
    'idx_enrollments_status_period',
    'idx_payments_status_period',
    'idx_payments_student_status'
)
GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;

-- Test 5: Check for duplicate enrollments (should return 0 rows)
-- Expected: 0 rows (no duplicates)
SELECT 'Test 5: Checking for duplicate enrollments...' AS test;
SELECT created_student_id, academic_period_id, COUNT(*) as count
FROM enrollments
WHERE created_student_id IS NOT NULL
GROUP BY created_student_id, academic_period_id
HAVING count > 1;

-- Test 6: Check payments table structure
-- Expected: Shows idempotency_key and version columns
SELECT 'Test 6: Checking payments table structure...' AS test;
DESCRIBE payments;

-- ============================================================================
-- RESULTS INTERPRETATION:
-- ============================================================================
-- ✅ Test 1: Should return 1 row showing idempotency_key column
-- ✅ Test 2: Should return 4 rows (one for each table)
-- ✅ Test 3: Should return 1 row showing unique constraint
-- ✅ Test 4: Should return ~15 rows showing all indexes
-- ✅ Test 5: Should return 0 rows (no duplicates)
-- ✅ Test 6: Should show full payments table structure with new columns
--
-- If ANY test returns 0 rows (except Test 5), that part of migration didn't run.
-- ============================================================================

SELECT '=== MIGRATION VERIFICATION COMPLETE ===' AS status;
