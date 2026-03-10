-- Migration: add foreign keys for concern tickets module (minimal)

ALTER TABLE `concern_messages`
  ADD CONSTRAINT `fk_concern_messages_ticket`
  FOREIGN KEY (`ticket_id`) REFERENCES `concern_tickets`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
