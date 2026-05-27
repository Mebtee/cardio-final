-- Cardiomegaly Detection System Database Setup
-- Import this file into XAMPP's phpMyAdmin or via MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS cardiomegaly_detection;
USE cardiomegaly_detection;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'doctor', 'xray_technician', 'reception', 'general_doctor') NOT NULL,
    full_name VARCHAR(100),
    specialty VARCHAR(100),
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    patient_id VARCHAR(50) DEFAULT NULL,
    contact_number VARCHAR(20) DEFAULT NULL,
    age INT DEFAULT NULL,
    gender ENUM('male', 'female', 'other') DEFAULT NULL,
    medical_history TEXT DEFAULT NULL,
    registered_by INT NOT NULL,
    status ENUM('registered', 'referred', 'completed') DEFAULT 'registered',
    referred_to INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Create xray_requests table
CREATE TABLE IF NOT EXISTS xray_requests (
    id VARCHAR(36) PRIMARY KEY,
    doctor_id INT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    patient_id VARCHAR(50),
    request_notes TEXT,
    status ENUM('pending', 'completed', 'in_progress') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    prediction VARCHAR(50) NOT NULL,
    confidence FLOAT NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (request_id) REFERENCES xray_requests(id) ON DELETE CASCADE
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create patient_edit_requests table
CREATE TABLE IF NOT EXISTS patient_edit_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    requested_by INT NOT NULL,
    request_reason TEXT,
    status ENUM('pending_approval', 'approved_for_edit', 'changes_submitted', 'approved_final', 'rejected') DEFAULT 'pending_approval',
    
    -- Original data (for reference)
    original_data JSON,
    
    -- Proposed changes
    proposed_changes JSON,
    
    -- Admin who approved/rejected
    reviewed_by INT,
    review_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    submitted_at TIMESTAMP NULL,
    final_approved_at TIMESTAMP NULL,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id VARCHAR(50) DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Initial users, requests, and predictions are seeded by the backend on first run using secure bcrypt hashes.
-- This avoids invalid salts from manual SQL inserts.

-- You can manually add users later if needed.
-- Example (NOT recommended to run directly):
-- INSERT INTO users (username, password, email, role, full_name)
-- VALUES ('admin', '<bcrypt-hash>', 'admin@cardiomegaly.com', 'admin', 'System Administrator');

-- Display success message
SELECT 'Database setup completed successfully!' AS Status;
SELECT 'All tables created: users, patients, xray_requests, predictions, password_reset_tokens, patient_edit_requests, notifications' AS Info;
SELECT 'Default users will be created automatically when the backend starts with password: admin123' AS Note;
