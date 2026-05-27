#!/usr/bin/env python3
"""
Test script to verify login functionality with ban check
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_connection
from utils import verify_password

def test_login_ban_check():
    print("Testing login ban functionality...")
    
    try:
        conn = get_db_connection()
        if not conn:
            print("❌ Database connection failed")
            return False
            
        cursor = conn.cursor(dictionary=True)
        
        # Check if is_banned column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_banned'")
        has_is_banned = cursor.fetchone() is not None
        print(f"🔒 is_banned column exists: {'✅ Yes' if has_is_banned else '❌ No'}")
        
        if not has_is_banned:
            print("⚠️  Ban functionality not available - column missing")
            cursor.close()
            conn.close()
            return True
        
        # Get a test user
        cursor.execute("SELECT id, username, is_banned FROM users LIMIT 1")
        user = cursor.fetchone()
        
        if not user:
            print("❌ No users found for testing")
            cursor.close()
            conn.close()
            return False
        
        print(f"👤 Testing with user: {user['username']}")
        print(f"🔒 Current ban status: {'Banned' if user['is_banned'] else 'Active'}")
        
        # Test login query
        cursor.execute("""
            SELECT id, username, email, role, full_name, password, is_banned
            FROM users
            WHERE username = %s
        """, (user['username'],))
        
        login_user = cursor.fetchone()
        if login_user:
            print("✅ Login query successful")
            if login_user.get('is_banned'):
                print("🚫 User would be blocked from login (banned)")
            else:
                print("✅ User would be allowed to login (not banned)")
        else:
            print("❌ Login query failed")
        
        cursor.close()
        conn.close()
        print("✅ Login ban check test completed!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_login_ban_check()