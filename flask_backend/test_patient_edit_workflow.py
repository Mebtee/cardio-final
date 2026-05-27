#!/usr/bin/env python3
"""
Test script to verify the patient edit workflow
"""

import sys
import os
import requests
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_connection

API_URL = "http://localhost:5000"

def test_patient_edit_workflow():
    print("Testing patient edit workflow...")
    print("="*60)
    
    try:
        # Step 1: Setup test data
        conn = get_db_connection()
        if not conn:
            print("❌ Database connection failed")
            return False
            
        cursor = conn.cursor(dictionary=True)
        
        # Check if patient_edit_requests table exists
        cursor.execute("SHOW TABLES LIKE 'patient_edit_requests'")
        table_exists = cursor.fetchone() is not None
        
        if not table_exists:
            print("❌ patient_edit_requests table doesn't exist. Run the migration first.")
            cursor.close()
            conn.close()
            return False
        
        # Get test users
        cursor.execute("SELECT id, username, role FROM users WHERE role IN ('reception', 'admin') ORDER BY role")
        users = cursor.fetchall()
        
        reception_user = next((u for u in users if u['role'] == 'reception'), None)
        admin_user = next((u for u in users if u['role'] == 'admin'), None)
        
        if not reception_user or not admin_user:
            print("❌ Need both reception and admin users for testing")
            cursor.close()
            conn.close()
            return False
        
        # Get a test patient
        cursor.execute("SELECT id, patient_name FROM patients LIMIT 1")
        patient = cursor.fetchone()
        
        if not patient:
            print("❌ No patients found for testing")
            cursor.close()
            conn.close()
            return False
        
        print(f"👤 Test users: Reception={reception_user['username']}, Admin={admin_user['username']}")
        print(f"🏥 Test patient: {patient['patient_name']} (ID: {patient['id']})")
        
        # Step 2: Test edit request creation
        print(f"\n📝 Step 1: Receptionist requests edit...")
        try:
            response = requests.post(f"{API_URL}/patient-edits/request", 
                json={
                    "patient_id": patient['id'],
                    "requested_by": reception_user['id'],
                    "reason": "Need to correct patient contact information"
                },
                timeout=5)
            
            if response.status_code == 201:
                request_data = response.json()
                request_id = request_data['request_id']
                print(f"✅ Edit request created successfully (ID: {request_id})")
            else:
                print(f"❌ Failed to create edit request: {response.status_code} - {response.text}")
                cursor.close()
                conn.close()
                return False
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test edit request creation (server not running?): {e}")
            cursor.close()
            conn.close()
            return False
        
        # Step 3: Test admin approval
        print(f"\n✅ Step 2: Admin approves edit request...")
        try:
            response = requests.post(f"{API_URL}/patient-edits/{request_id}/approve", 
                json={
                    "admin_id": admin_user['id'],
                    "notes": "Approved for data correction"
                },
                timeout=5)
            
            if response.status_code == 200:
                print("✅ Edit request approved by admin")
            else:
                print(f"❌ Failed to approve edit request: {response.status_code} - {response.text}")
                cursor.close()
                conn.close()
                return False
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test admin approval (server not running?): {e}")
            cursor.close()
            conn.close()
            return False
        
        # Step 4: Test submitting changes
        print(f"\n📝 Step 3: Receptionist submits changes...")
        try:
            changes = {
                "patient_name": patient['patient_name'],
                "contact_number": "0911223344",
                "age": 30,
                "gender": "male",
                "medical_history": "Updated medical history"
            }
            
            response = requests.post(f"{API_URL}/patient-edits/{request_id}/submit-changes", 
                json={"changes": changes},
                timeout=5)
            
            if response.status_code == 200:
                print("✅ Changes submitted successfully")
            else:
                print(f"❌ Failed to submit changes: {response.status_code} - {response.text}")
                cursor.close()
                conn.close()
                return False
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test change submission (server not running?): {e}")
            cursor.close()
            conn.close()
            return False
        
        # Step 5: Test final approval
        print(f"\n✅ Step 4: Admin gives final approval...")
        try:
            response = requests.post(f"{API_URL}/patient-edits/{request_id}/approve", 
                json={
                    "admin_id": admin_user['id'],
                    "notes": "Final approval - changes applied"
                },
                timeout=5)
            
            if response.status_code == 200:
                print("✅ Final approval completed")
            else:
                print(f"❌ Failed final approval: {response.status_code} - {response.text}")
                cursor.close()
                conn.close()
                return False
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test final approval (server not running?): {e}")
            cursor.close()
            conn.close()
            return False
        
        # Step 6: Verify changes were applied
        print(f"\n🔍 Step 5: Verifying changes were applied...")
        cursor.execute("SELECT contact_number, medical_history FROM patients WHERE id = %s", (patient['id'],))
        updated_patient = cursor.fetchone()
        
        if updated_patient and updated_patient['contact_number'] == "0911223344":
            print("✅ Patient data was updated successfully")
        else:
            print("❌ Patient data was not updated")
            cursor.close()
            conn.close()
            return False
        
        # Step 7: Verify request status
        cursor.execute("SELECT status FROM patient_edit_requests WHERE id = %s", (request_id,))
        request_status = cursor.fetchone()
        
        if request_status and request_status['status'] == 'approved_final':
            print("✅ Request status is correct (approved_final)")
        else:
            print(f"❌ Request status is incorrect: {request_status['status'] if request_status else 'Not found'}")
            cursor.close()
            conn.close()
            return False
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("✅ Patient edit workflow test completed successfully!")
        print("\n📋 Workflow Summary:")
        print("1. Receptionist requests edit ✅")
        print("2. Admin approves request ✅")
        print("3. Receptionist submits changes ✅")
        print("4. Admin gives final approval ✅")
        print("5. Changes applied to database ✅")
        print("="*60)
        return True
        
    except Exception as e:
        print(f"❌ Error during patient edit workflow test: {e}")
        return False

if __name__ == "__main__":
    test_patient_edit_workflow()