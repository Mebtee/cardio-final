-- Migration script to add is_banned column to users table
-- Run this script to add the ban functionality

USE cardiomegaly_detection;

-- Add is_banned column to users table
ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;

-- Update existing users to not be banned by default
UPDATE users SET is_banned = FALSE WHERE is_banned IS NULL;

-- Display success message
SELECT 'is_banned column added successfully to users table!' AS Status;