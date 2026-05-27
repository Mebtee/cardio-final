#!/usr/bin/env python3
"""
Simple test script to check database connection and table structure
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_connection

def test_database():
    print("Testing database connection...")
    
    try:
        conn = get_db_connection()
        if not conn:
            print("❌ Database connection failed")
            return False
            
        cursor = conn.cursor(dictionary=True)
        
        # Test basic connection
        cursor.execute("SELECT 1 as test")
        result = cursor.fetchone()
        print(f"✅ Database connection successful: {result}")
        
        # Check users table structure
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        print("\n📋 Users table structure:")
        for col in columns:
            print(f"  - {col['Field']}: {col['Type']} {'(NULL)' if col['Null'] == 'YES' else '(NOT NULL)'}")
        
        # Check if is_banned column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_banned'")
        has_is_banned = cursor.fetchone() is not None
        print(f"\n🔒 is_banned column exists: {'✅ Yes' if has_is_banned else '❌ No (migration needed)'}")
        
        # Check if specialty column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'specialty'")
        has_specialty = cursor.fetchone() is not None
        print(f"👨‍⚕️ specialty column exists: {'✅ Yes' if has_specialty else '❌ No (migration needed)'}")
        
        # Test users query
        if has_is_banned and has_specialty:
            cursor.execute("SELECT id, username, email, role, full_name, specialty, created_at, is_banned FROM users LIMIT 1")
        elif has_specialty:
            cursor.execute("SELECT id, username, email, role, full_name, specialty, created_at FROM users LIMIT 1")
        else:
            cursor.execute("SELECT id, username, email, role, full_name, created_at FROM users LIMIT 1")
            
        user = cursor.fetchone()
        if user:
            print(f"\n👤 Sample user: {user['username']} ({user['role']})")
        else:
            print("\n👤 No users found in database")
        
        cursor.close()
        conn.close()
        print("\n✅ All tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_database()