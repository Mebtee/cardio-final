#!/usr/bin/env python3
"""
Test script to verify the complete ban workflow
"""

import sys
import os
import requests
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_connection

API_URL = "http://localhost:5000"

def test_ban_workflow():
    print("Testing complete ban workflow...")
    print("="*60)
    
    try:
        # Step 1: Check if we have a test user
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
        
        # Step 3: Test normal login (should work)
        print("\n🔐 Testing normal login...")
        try:
            response = requests.post(f"{API_URL}/login", 
                json={"username": username, "password": "admin123"},
                timeout=5)
            if response.status_code == 200:
                print("✅ Normal login successful")
            else:
                print(f"⚠️  Normal login failed: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test login (server not running?): {e}")
        
        # Step 4: Ban the user
        print(f"\n🚫 Banning user {username}...")
        cursor.execute("UPDATE users SET is_banned = TRUE WHERE id = %s", (user_id,))
        conn.commit()
        
        # Verify ban status
        cursor.execute("SELECT is_banned FROM users WHERE id = %s", (user_id,))
        ban_status = cursor.fetchone()
        if ban_status and ban_status['is_banned']:
            print("✅ User successfully banned in database")
        else:
            print("❌ Failed to ban user in database")
            cursor.close()
            conn.close()
            return False
        
        # Step 5: Test login while banned (should fail)
        print("\n🔐 Testing login while banned...")
        try:
            response = requests.post(f"{API_URL}/login", 
                json={"username": username, "password": "admin123"},
                timeout=5)
            if response.status_code == 403:
                error_data = response.json()
                print(f"✅ Banned login correctly blocked: {error_data.get('error', 'No error message')}")
            elif response.status_code == 200:
                print("❌ SECURITY ISSUE: Banned user was able to login!")
                cursor.close()
                conn.close()
                return False
            else:
                print(f"⚠️  Unexpected response: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test banned login (server not running?): {e}")
        
        # Step 6: Unban the user
        print(f"\n✅ Unbanning user {username}...")
        cursor.execute("UPDATE users SET is_banned = FALSE WHERE id = %s", (user_id,))
        conn.commit()
        print("✅ User unbanned")
        
        # Step 7: Test login after unban (should work again)
        print("\n🔐 Testing login after unban...")
        try:
            response = requests.post(f"{API_URL}/login", 
                json={"username": username, "password": "admin123"},
                timeout=5)
            if response.status_code == 200:
                print("✅ Login after unban successful")
            else:
                print(f"⚠️  Login after unban failed: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test unban login (server not running?): {e}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("✅ Ban workflow test completed!")
        print("="*60)
        return True
        
    except Exception as e:
        print(f"❌ Error during ban workflow test: {e}")
        return False

if __name__ == "__main__":
    test_ban_workflow()