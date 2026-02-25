-- Add route column to chatbot_knowledge
ALTER TABLE `chatbot_knowledge`
  ADD COLUMN `route` varchar(255) DEFAULT NULL AFTER `tags`;
