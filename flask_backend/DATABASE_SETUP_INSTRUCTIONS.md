# Database Setup Instructions

## Quick Fix for Missing Tables Error

If you're getting the error "Table 'cardiomegaly_detection.patient_edit_requests' doesn't exist", follow these steps:

### Option 1: Complete Setup with Sample Data (Recommended)
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Click "Import" tab
3. Choose file: `flask_backend/setup_with_sample_data.sql`
4. Click "Go" - this creates database + tables + sample data in one step

### Option 2: Automatic Setup (Empty Database)
1. Stop the Flask server if it's running
2. Start the Flask server again with `python app.py`
3. The database and all tables will be created automatically (no sample data)

### Option 3: Manual Database Setup
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Import `flask_backend/complete_database_setup.sql` (creates structure only)
3. Optionally import `flask_backend/insert_sample_data.sql` (adds sample data)

### Option 4: Step by Step
1. Open phpMyAdmin
2. Create a new database named `cardiomegaly_detection`
3. Select the database
4. Import `flask_backend/heartsight_ai_startup.sql` (creates all tables)
5. Optionally import `flask_backend/insert_sample_data.sql` (adds sample data)

## Verification
After setup, you should see these tables in `cardiomegaly_detection` database:
- users
- patients  
- xray_requests
- predictions
- password_reset_tokens
- patient_edit_requests
- notifications

## Sample Data
To load sample data with existing users, patients, and X-ray records:
1. First set up the database structure (using any option above)
2. Import `flask_backend/insert_sample_data.sql`
3. This will load realistic sample data for testing

## Default Users (if not using sample data)
The system will automatically create these default users:
- **admin** / admin123 (Administrator)
- **doctor1** / admin123 (Doctor)
- **technician1** / admin123 (X-ray Technician)
- **reception1** / admin123 (Reception)
- **general_doctor1** / admin123 (General Doctor)

## Troubleshooting
- Make sure XAMPP MySQL is running
- Check that the database name in `flask_backend/config.py` is `cardiomegaly_detection`
- Restart the Flask server after database changes