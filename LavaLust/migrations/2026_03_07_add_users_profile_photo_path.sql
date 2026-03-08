-- Add optional profile photo path for users
ALTER TABLE users
ADD COLUMN profile_photo_path VARCHAR(255) NULL AFTER phone;
