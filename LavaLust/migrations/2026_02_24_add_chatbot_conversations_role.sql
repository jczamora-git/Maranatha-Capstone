ALTER TABLE chatbot_conversations
  ADD COLUMN role VARCHAR(20) NULL AFTER user_id,
  ADD INDEX idx_chatbot_conversations_role (role);
