-- Migration: Add 'Others' category to uniform_items for items without size options
-- Date: 2026-03-07
-- Purpose: Allow uniform items like School Patch, ID Lace, etc. that don't need sizes

-- Add 'Others' to the item_group enum
ALTER TABLE `uniform_items` 
MODIFY COLUMN `item_group` enum('Dress','Blouse','Skirt','Polo','PE','Others') 
COLLATE utf8mb4_unicode_ci NOT NULL;
