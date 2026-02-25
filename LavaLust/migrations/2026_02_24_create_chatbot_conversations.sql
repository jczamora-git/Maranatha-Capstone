CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  role VARCHAR(20) NULL,
  message TEXT NOT NULL,
  normalized_message VARCHAR(255) NOT NULL,
  reply TEXT NOT NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'unknown',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chatbot_conversations_user_id (user_id),
  INDEX idx_chatbot_conversations_role (role),
  INDEX idx_chatbot_conversations_normalized (normalized_message),
  INDEX idx_chatbot_conversations_created_at (created_at)
);
