CREATE TABLE IF NOT EXISTS rfid_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  session_type VARCHAR(10) NOT NULL,
  scheduled_start DATETIME NOT NULL,
  scheduled_end DATETIME NOT NULL,
  actual_start DATETIME NULL,
  actual_end DATETIME NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  INDEX idx_rfid_sessions_type (session_type),
  INDEX idx_rfid_sessions_status (status),
  INDEX idx_rfid_sessions_schedule (scheduled_start, scheduled_end)
);
