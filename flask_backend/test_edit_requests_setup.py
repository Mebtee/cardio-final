#!/usr/bin/env python3
"""
Test script to verify patient edit requests setup
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_connection

def test_edit_requests_setup():
    print("Testing patient edit requests setup...")
    print("="*50)
    
    try:
        conn = get_db_connection()
        if not conn:
            print("❌ Database connection failed")
            return False
            
        cursor = conn.cursor(dictionary=True)
        
        # Check if patient_edit_requests table exists
        cursor.execute("SHOW TABLES LIKE 'patient_edit_requests'")
        table_exists = cursor.fetchone() is not None
        
        if table_exists:
            print("✅ patient_edit_requests table exists")
            
            # Check table structure
            cursor.execute("DESCRIBE patient_edit_requests")
            columns = cursor.fetchall()
            print("\n📋 Table structure:")
            for col in columns:
                print(f"  - {col['Field']}: {col['Type']}")
            
            # Check if there are any existing requests
            cursor.execute("SELECT COUNT(*) as count FROM patient_edit_requests")
            count = cursor.fetchone()['count']
            print(f"\n📊 Existing edit requests: {count}")
            
            if count > 0:
                cursor.execute("SELECT status, COUNT(*) as count FROM patient_edit_requests GROUP BY status")
                status_counts = cursor.fetchall()
                print("📈 Status breakdown:")
                for status in status_counts:
                    print(f"  - {status['status']}: {status['count']}")
        else:
            print("❌ patient_edit_requests table doesn't exist")
            print("💡 Run the migration: flask_backend/patient_edit_requests.sql")
            cursor.close()
            conn.close()
            return False
        
        # Check if we have test users
        cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        user_counts = cursor.fetchall()
        print(f"\n👥 User roles available:")
        for role in user_counts:
            print(f"  - {role['role']}: {role['count']}")
        
        # Check if we have test patients
        cursor.execute("SELECT COUNT(*) as count FROM patients")
        patient_count = cursor.fetchone()['count']
        print(f"\n🏥 Patients available: {patient_count}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*50)
        print("✅ Patient edit requests setup verification completed!")
        return True
        
    except Exception as e:
        print(f"❌ Error during setup verification: {e}")
        return False

if __name__ == "__main__":
    test_edit_requests_setup()