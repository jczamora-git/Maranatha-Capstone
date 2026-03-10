-- Normalize DB-managed timestamps to app-managed timestamps
-- Target: maranatha_db
-- This removes CURRENT_TIMESTAMP/NOW() defaults and ON UPDATE CURRENT_TIMESTAMP
-- for DATETIME/TIMESTAMP columns while preserving type, nullability, and comments.

SET @target_db = 'maranatha_db';
SET @apply_changes = 0; -- 0 = preview only, 1 = execute
SET SESSION group_concat_max_len = 1024 * 1024 * 20;

DROP TEMPORARY TABLE IF EXISTS tmp_timestamp_alters;
CREATE TEMPORARY TABLE tmp_timestamp_alters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stmt LONGTEXT NOT NULL
);

INSERT INTO tmp_timestamp_alters (stmt)
SELECT CONCAT(
  'ALTER TABLE `', c.TABLE_SCHEMA, '`.`', c.TABLE_NAME, '` MODIFY COLUMN `', c.COLUMN_NAME, '` ', c.COLUMN_TYPE,
  CASE WHEN c.IS_NULLABLE = 'NO' THEN ' NOT NULL' ELSE ' NULL' END,
  CASE
    WHEN c.COLUMN_DEFAULT IS NULL THEN ''
    WHEN LOWER(c.COLUMN_DEFAULT) REGEXP 'current_timestamp|now\\(' THEN ''
    ELSE CONCAT(' DEFAULT ', QUOTE(c.COLUMN_DEFAULT))
  END,
  CASE
    WHEN c.COLUMN_COMMENT IS NULL OR c.COLUMN_COMMENT = '' THEN ''
    ELSE CONCAT(' COMMENT ', QUOTE(c.COLUMN_COMMENT))
  END
)
FROM information_schema.COLUMNS c
WHERE c.TABLE_SCHEMA = @target_db
  AND c.DATA_TYPE IN ('timestamp', 'datetime')
  AND (
    (c.COLUMN_DEFAULT IS NOT NULL AND LOWER(c.COLUMN_DEFAULT) REGEXP 'current_timestamp|now\\(')
    OR LOWER(c.EXTRA) LIKE '%on update%'
  )
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;

-- Preview statements
SELECT stmt FROM tmp_timestamp_alters ORDER BY id;
SELECT COUNT(*) AS total_alter_statements FROM tmp_timestamp_alters;

-- Execute statements only when @apply_changes = 1
DROP PROCEDURE IF EXISTS run_timestamp_alters;
DELIMITER $$
CREATE PROCEDURE run_timestamp_alters(IN do_apply TINYINT)
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_stmt LONGTEXT;
  DECLARE cur CURSOR FOR SELECT stmt FROM tmp_timestamp_alters ORDER BY id;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  IF do_apply = 0 THEN
    SELECT 'Preview mode only: set @apply_changes = 1 to run ALTER statements.' AS info;
  ELSE
    OPEN cur;
    read_loop: LOOP
      FETCH cur INTO v_stmt;
      IF done = 1 THEN
        LEAVE read_loop;
      END IF;

      SET @s = v_stmt;
      PREPARE p FROM @s;
      EXECUTE p;
      DEALLOCATE PREPARE p;
    END LOOP;
    CLOSE cur;
  END IF;
END$$
DELIMITER ;

CALL run_timestamp_alters(@apply_changes);
DROP PROCEDURE IF EXISTS run_timestamp_alters;

DROP TEMPORARY TABLE IF EXISTS tmp_timestamp_alters;
