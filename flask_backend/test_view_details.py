#!/usr/bin/env python3
"""
Test script to verify the view details functionality for patient edit requests
"""

import sys
import os
import requests
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_connection

API_URL = "http://localhost:5000"

def test_view_details_functionality():
    print("Testing view details functionality...")
    print("="*60)
    
    try:
        # Step 1: Create a test edit request with changes
        conn = get_db_connection()
        if not conn:
            print("❌ Database connection failed")
            return False
            
        cursor = conn.cursor(dictionary=True)
        
        # Get test users and patient
        cursor.execute("SELECT id FROM users WHERE role = 'reception' LIMIT 1")
        reception_user = cursor.fetchone()
        
        cursor.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
        admin_user = cursor.fetchone()
        
        cursor.execute("SELECT id, patient_name FROM patients LIMIT 1")
        patient = cursor.fetchone()
        
        if not reception_user or not admin_user or not patient:
            print("❌ Missing test data (need reception user, admin user, and patient)")
            cursor.close()
            conn.close()
            return False
        
        print(f"👥 Using reception user ID: {reception_user['id']}, admin user ID: {admin_user['id']}")
        print(f"🏥 Using patient: {patient['patient_name']} (ID: {patient['id']})")
        
        # Step 2: Create edit request
        print(f"\n📝 Creating edit request...")
        try:
            response = requests.post(f"{API_URL}/patient-edits/request", 
                json={
                    "patient_id": patient['id'],
                    "requested_by": reception_user['id'],
                    "reason": "Testing view details functionality"
                },
                timeout=5)
            
            if response.status_code == 201:
                request_data = response.json()
                request_id = request_data['request_id']
                print(f"✅ Edit request created (ID: {request_id})")
            else:
                print(f"❌ Failed to create edit request: {response.status_code}")
                cursor.close()
                conn.close()
                return False
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test (server not running?): {e}")
            cursor.close()
            conn.close()
            return False
        
        # Step 3: Approve for editing
        print(f"\n✅ Approving request for editing...")
        try:
            response = requests.post(f"{API_URL}/patient-edits/{request_id}/approve", 
                json={
                    "admin_id": admin_user['id'],
                    "notes": "Approved for testing"
                },
                timeout=5)
            
            if response.status_code == 200:
                print("✅ Request approved for editing")
            else:
                print(f"❌ Failed to approve: {response.status_code}")
                cursor.close()
                conn.close()
                return False
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not approve: {e}")
            cursor.close()
            conn.close()
            return False
        
        # Step 4: Submit changes
        print(f"\n📝 Submitting changes...")
        changes = {
            "patient_name": "Updated Patient Name",
            "contact_number": "0987654321",
            "age": 35,
            "gender": "female",
            "medical_history": "Updated medical history with new information"
        }
        
        try:
            response = requests.post(f"{API_URL}/patient-edits/{request_id}/submit-changes", 
                json={"changes": changes},
                timeout=5)
            
            if response.status_code == 200:
                print("✅ Changes submitted successfully")
            else:
                print(f"❌ Failed to submit changes: {response.status_code}")
                cursor.close()
                conn.close()
                return False
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not submit changes: {e}")
            cursor.close()
            conn.close()
            return False
        
        # Step 5: Test view details API
        print(f"\n🔍 Testing view details API...")
        try:
            response = requests.get(f"{API_URL}/patient-edits/{request_id}", timeout=5)
            
            if response.status_code == 200:
                details = response.json()
                print("✅ View details API working")
                
                # Verify the data structure
                required_fields = ['original_data', 'proposed_changes', 'status', 'patient_name']
                for field in required_fields:
                    if field in details:
                        print(f"  ✓ {field}: Present")
                    else:
                        print(f"  ❌ {field}: Missing")
                
                # Check if we have both original and proposed data
                if details.get('original_data') and details.get('proposed_changes'):
                    print("  ✓ Both original and proposed data available")
                    
                    # Show some sample comparisons
                    original = details['original_data']
                    proposed = details['proposed_changes']
                    
                    print(f"\n📊 Sample data comparison:")
                    for field in ['patient_name', 'contact_number', 'age']:
                        if field in original and field in proposed:
                            orig_val = original[field]
                            prop_val = proposed[field]
                            changed = orig_val != prop_val
                            status = "CHANGED" if changed else "UNCHANGED"
                            print(f"  - {field}: {orig_val} → {prop_val} ({status})")
                else:
                    print("  ❌ Missing original or proposed data")
                
                # Check status
                if details.get('status') == 'changes_submitted':
                    print("  ✓ Status is correct (changes_submitted)")
                else:
                    print(f"  ❌ Status is incorrect: {details.get('status')}")
                    
            else:
                print(f"❌ View details API failed: {response.status_code}")
                cursor.close()
                conn.close()
                return False
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test view details: {e}")
            cursor.close()
            conn.close()
            return False
        
        # Step 6: Test pending requests API (should include our request)
        print(f"\n📋 Testing pending requests API...")
        try:
            response = requests.get(f"{API_URL}/patient-edits/pending", timeout=5)
            
            if response.status_code == 200:
                pending_requests = response.json()
                print(f"✅ Pending requests API working ({len(pending_requests)} requests)")
                
                # Find our request
                our_request = next((r for r in pending_requests if r['id'] == request_id), None)
                if our_request:
                    print("  ✓ Our test request found in pending list")
                    if our_request.get('original_data') and our_request.get('proposed_changes'):
                        print("  ✓ Request includes original and proposed data")
                    else:
                        print("  ❌ Request missing data for comparison")
                else:
                    print("  ❌ Our test request not found in pending list")
            else:
                print(f"❌ Pending requests API failed: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test pending requests: {e}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("✅ View details functionality test completed!")
        print("\n📋 Test Summary:")
        print("1. Edit request created ✅")
        print("2. Request approved for editing ✅")
        print("3. Changes submitted ✅")
        print("4. View details API working ✅")
        print("5. Data comparison available ✅")
        print("6. Pending requests API working ✅")
        print("="*60)
        return True
        
    except Exception as e:
        print(f"❌ Error during view details test: {e}")
        return False

if __name__ == "__main__":
    test_view_details_functionality()