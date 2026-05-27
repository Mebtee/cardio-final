import mysql.connector
from mysql.connector import Error
import bcrypt
from config import DB_CONFIG


def get_db_connection():
    """Get a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None


def init_db():
    """Initialize the database and create tables"""
    try:
        # First connect without specifying database to create it
        temp_config = DB_CONFIG.copy()
        db_name = temp_config.pop('database')
        
        conn = mysql.connector.connect(**temp_config)
        cursor = conn.cursor()
        
        # Create database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.close()
        conn.close()
        
        # Now connect to the database and create tables
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            
            # Create users table
            cursor.execute('''
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
            )
            ''')
            
            # Add specialty column if not exists
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN specialty VARCHAR(100)")
                conn.commit()
            except Error:
                pass
            
            # Add is_banned column if not exists
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE")
                conn.commit()
            except Error:
                pass
            
            # Alter existing users table to add new roles if they don't exist
            try:
                cursor.execute("""
                    ALTER TABLE users 
                    MODIFY COLUMN role ENUM('admin', 'doctor', 'xray_technician', 'reception', 'general_doctor') NOT NULL
                """)
                conn.commit()
            except Error:
                pass
            
            # Create patients table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS patients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_name VARCHAR(100) NOT NULL,
                patient_id VARCHAR(50) UNIQUE,
                contact_number VARCHAR(20),
                age INT,
                gender ENUM('male', 'female', 'other'),
                medical_history TEXT,
                registered_by INT NOT NULL,
                status ENUM('registered', 'referred', 'xray_requested', 'completed') DEFAULT 'registered',
                referred_to INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (referred_to) REFERENCES users(id) ON DELETE SET NULL
            )
            ''')
            
            # Add xray_requested status to existing table if not present
            try:
                cursor.execute("""
                    ALTER TABLE patients 
                    MODIFY COLUMN status ENUM('registered', 'referred', 'xray_requested', 'completed') DEFAULT 'registered'
                """)
                conn.commit()
            except Error:
                pass
            
            # Create xray_requests table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS xray_requests (
                id VARCHAR(36) PRIMARY KEY,
                doctor_id INT NOT NULL,
                patient_name VARCHAR(100) NOT NULL,
                patient_id VARCHAR(50),
                request_notes TEXT,
                status ENUM('pending', 'completed', 'in_progress') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
            )
            ''')
            
            # Create predictions table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id VARCHAR(36) PRIMARY KEY,
                request_id VARCHAR(36) NOT NULL,
                filename VARCHAR(255) NOT NULL,
                prediction VARCHAR(50) NOT NULL,
                confidence FLOAT NOT NULL,
                timestamp DATETIME NOT NULL,
                FOREIGN KEY (request_id) REFERENCES xray_requests(id) ON DELETE CASCADE
            )
            ''')
            
            # Create password_reset_tokens table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            ''')
            
            # Create notifications table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                related_id VARCHAR(50),
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            ''')
            
            # Create patient_edit_requests table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS patient_edit_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT NOT NULL,
                requested_by INT NOT NULL,
                request_reason TEXT,
                status ENUM('pending_approval', 'approved_for_edit', 'changes_submitted', 'approved_final', 'rejected') DEFAULT 'pending_approval',
                original_data JSON,
                proposed_changes JSON,
                reviewed_by INT,
                review_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                approved_at TIMESTAMP NULL,
                submitted_at TIMESTAMP NULL,
                final_approved_at TIMESTAMP NULL,
                FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
                FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
            )
            ''')
            
            # Seed default users
            _seed_default_users(cursor, conn)
            
            conn.commit()
            cursor.close()
            conn.close()
            print("Database initialized successfully")
    except Error as e:
        print(f"Error initializing database: {e}")


def _seed_default_users(cursor, conn):
    """Seed default users with bcrypt if table is empty and fix invalid hashes"""
    try:
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        
        if count == 0:
            def add_user(username, email, role, full_name, pwd):
                hashed = bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cursor.execute(
                    "INSERT INTO users (username, password, email, role, full_name) VALUES (%s, %s, %s, %s, %s)",
                    (username, hashed, email, role, full_name)
                )
            
            add_user('admin', 'admin@cardiomegaly.com', 'admin', 'System Administrator', 'admin123')
            add_user('reception1', 'reception1@cardiomegaly.com', 'reception', 'Sarah Johnson', 'admin123')
            add_user('general_doctor1', 'gendoc1@cardiomegaly.com', 'general_doctor', 'Dr. Emily Brown', 'admin123')
            add_user('doctor1', 'doctor1@cardiomegaly.com', 'doctor', 'Dr. John Smith', 'admin123')
            add_user('technician1', 'tech1@cardiomegaly.com', 'xray_technician', 'Jane Doe', 'admin123')
        else:
            # Attempt to fix previously inserted invalid bcrypt hashes
            cursor.execute("SELECT id, password FROM users")
            for uid, pwd in cursor.fetchall():
                try:
                    spwd = pwd.decode('utf-8') if isinstance(pwd, (bytes, bytearray)) else str(pwd)
                    if spwd.startswith('$2'):
                        try:
                            bcrypt.checkpw('admin123'.encode('utf-8'), spwd.encode('utf-8'))
                        except ValueError:
                            new_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                            cursor.execute("UPDATE users SET password=%s WHERE id=%s", (new_hash, uid))
                except Exception as efix:
                    print(f"Skip fixing user {uid}: {efix}")
    except Exception as se:
        print(f"Seeding users failed: {se}")
