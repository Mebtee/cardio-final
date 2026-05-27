-- Migration script from heartsight_ai to cardiomegaly_detection
-- This script helps migrate data from the old database to the new one

-- Step 1: Create the new database with all tables
SOURCE complete_database_setup.sql;

-- Step 2: Migrate data from old database (if it exists)
-- Uncomment and run these commands if you have data in heartsight_ai database

/*
-- Migrate users
INSERT IGNORE INTO cardiomegaly_detection.users 
SELECT * FROM heartsight_ai.users;

-- Migrate patients (if table exists)
INSERT IGNORE INTO cardiomegaly_detection.patients 
SELECT * FROM heartsight_ai.patients;

-- Migrate xray_requests
INSERT IGNORE INTO cardiomegaly_detection.xray_requests 
SELECT * FROM heartsight_ai.xray_requests;

-- Migrate predictions
INSERT IGNORE INTO cardiomegaly_detection.predictions 
SELECT * FROM heartsight_ai.predictions;

-- Migrate password_reset_tokens (if table exists)
INSERT IGNORE INTO cardiomegaly_detection.password_reset_tokens 
SELECT * FROM heartsight_ai.password_reset_tokens;

-- Migrate patient_edit_requests (if table exists)
INSERT IGNORE INTO cardiomegaly_detection.patient_edit_requests 
SELECT * FROM heartsight_ai.patient_edit_requests;
*/

SELECT 'Migration completed! Please verify your data and update your application configuration.' AS Status;