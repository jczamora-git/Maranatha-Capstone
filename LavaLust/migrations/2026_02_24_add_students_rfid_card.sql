ALTER TABLE students
  ADD COLUMN rfid_card VARCHAR(64) NULL AFTER student_id,
  ADD UNIQUE KEY uniq_students_rfid_card (rfid_card);
