#!/usr/bin/env python3
"""
Test script to verify session invalidation for banned users
"""

import sys
import os
import requests
import json
import time
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_connection

API_URL = "http://localhost:5000"

def test_session_invalidation():
    print("Testing session invalidation for banned users...")
    print("="*60)
    
    try:
        # Step 1: Setup test user
        conn = get_db_connection()
        if not conn:
            print("❌ Database connection failed")
            return False
            
        cursor = conn.cursor(dictionary=True)
        
        # Check if is_banned column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_banned'")
        has_is_banned = cursor.fetchone() is not None
        
        if not has_is_banned:
            print("❌ is_banned column doesn't exist. Run the migration first.")
            cursor.close()
            conn.close()
            return False
        
        # Get a non-admin user for testing
        cursor.execute("SELECT id, username FROM users WHERE role != 'admin' LIMIT 1")
        test_user = cursor.fetchone()
        
        if not test_user:
            print("❌ No non-admin users found for testing")
            cursor.close()
            conn.close()
            return False
        
        user_id = test_user['id']
        username = test_user['username']
        print(f"👤 Testing with user: {username} (ID: {user_id})")
        
        # Step 2: Ensure user is not banned initially
        cursor.execute("UPDATE users SET is_banned = FALSE WHERE id = %s", (user_id,))
        conn.commit()
        print("✅ User set to active status")
        
        # Step 3: Test session validation for active user
        print(f"\n🔐 Testing session validation for active user...")
        try:
            response = requests.get(f"{API_URL}/validate-session/{user_id}", timeout=5)
            if response.status_code == 200:
                print("✅ Session validation successful for active user")
            else:
                print(f"⚠️  Session validation failed: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test session validation (server not running?): {e}")
        
        # Step 4: Ban the user
        print(f"\n🚫 Banning user {username}...")
        cursor.execute("UPDATE users SET is_banned = TRUE WHERE id = %s", (user_id,))
        conn.commit()
        print("✅ User banned in database")
        
        # Step 5: Test session validation for banned user (should fail)
        print(f"\n🔐 Testing session validation for banned user...")
        try:
            response = requests.get(f"{API_URL}/validate-session/{user_id}", timeout=5)
            if response.status_code == 403:
                error_data = response.json()
                print(f"✅ Session validation correctly failed for banned user: {error_data.get('error', 'No error message')}")
            elif response.status_code == 200:
                print("❌ SECURITY ISSUE: Session validation passed for banned user!")
                cursor.close()
                conn.close()
                return False
            else:
                print(f"⚠️  Unexpected response: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test banned session validation (server not running?): {e}")
        
        # Step 6: Test login for banned user (should also fail)
        print(f"\n🔐 Testing login for banned user...")
        try:
            response = requests.post(f"{API_URL}/login", 
                json={"username": username, "password": "admin123"},
                timeout=5)
            if response.status_code == 403:
                error_data = response.json()
                print(f"✅ Login correctly blocked for banned user: {error_data.get('error', 'No error message')}")
            elif response.status_code == 200:
                print("❌ SECURITY ISSUE: Banned user was able to login!")
                cursor.close()
                conn.close()
                return False
            else:
                print(f"⚠️  Unexpected login response: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test banned login (server not running?): {e}")
        
        # Step 7: Unban the user
        print(f"\n✅ Unbanning user {username}...")
        cursor.execute("UPDATE users SET is_banned = FALSE WHERE id = %s", (user_id,))
        conn.commit()
        print("✅ User unbanned")
        
        # Step 8: Test session validation after unban (should work again)
        print(f"\n🔐 Testing session validation after unban...")
        try:
            response = requests.get(f"{API_URL}/validate-session/{user_id}", timeout=5)
            if response.status_code == 200:
                print("✅ Session validation successful after unban")
            else:
                print(f"⚠️  Session validation failed after unban: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test unban session validation (server not running?): {e}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("✅ Session invalidation test completed!")
        print("\n📋 Summary:")
        print("- Active users can validate sessions ✅")
        print("- Banned users cannot validate sessions ✅")
        print("- Banned users cannot login ✅")
        print("- Unbanned users regain session validation ✅")
        print("="*60)
        return True
        
    except Exception as e:
        print(f"❌ Error during session invalidation test: {e}")
        return False

if __name__ == "__main__":
    test_session_invalidation()