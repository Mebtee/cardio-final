-- Patient Edit Requests Table
-- Run this script to add patient edit request functionality

USE cardiomegaly_detection;

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

-- Display success message
SELECT 'Patient edit requests table created successfully!' AS Status;