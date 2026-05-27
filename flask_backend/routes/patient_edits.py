from datetime import datetime
from flask import Blueprint, request, jsonify
import json

from database import get_db_connection

patient_edits_bp = Blueprint('patient_edits', __name__, url_prefix='/patient-edits')


@patient_edits_bp.route('/request', methods=['POST'])
def request_patient_edit():
    """Request permission to edit patient data"""
    try:
        data = request.get_json() or {}
        patient_id = data.get('patient_id')
        requested_by = data.get('requested_by')
        reason = data.get('reason', '')
        
        if not patient_id or not requested_by:
            return jsonify({'error': 'Patient ID and requester ID are required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Get current patient data
        cursor.execute("""
            SELECT patient_name, contact_number, age, gender, medical_history 
            FROM patients WHERE id = %s
        """, (patient_id,))
        patient = cursor.fetchone()
        
        if not patient:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Patient not found'}), 404
        
        # Check if there's already a pending request for this patient
        cursor.execute("""
            SELECT id FROM patient_edit_requests 
            WHERE patient_id = %s AND status IN ('pending_approval', 'approved_for_edit', 'changes_submitted')
        """, (patient_id,))
        existing = cursor.fetchone()
        
        if existing:
            cursor.close()
            conn.close()
            return jsonify({'error': 'There is already a pending edit request for this patient'}), 400
        
        # Create edit request
        cursor.execute("""
            INSERT INTO patient_edit_requests (patient_id, requested_by, request_reason, original_data)
            VALUES (%s, %s, %s, %s)
        """, (patient_id, requested_by, reason, json.dumps(patient)))
        
        request_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'request_id': request_id,
            'message': 'Edit request submitted successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patient_edits_bp.route('/my-requests/<int:user_id>', methods=['GET'])
def get_my_edit_requests(user_id):
    """Get edit requests made by a specific user"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                per.id,
                per.patient_id,
                p.patient_name,
                p.patient_id as patient_code,
                per.request_reason,
                per.status,
                per.review_notes,
                per.created_at,
                per.approved_at,
                per.submitted_at,
                per.final_approved_at,
                reviewer.full_name as reviewed_by_name
            FROM patient_edit_requests per
            JOIN patients p ON per.patient_id = p.id
            LEFT JOIN users reviewer ON per.reviewed_by = reviewer.id
            WHERE per.requested_by = %s
            ORDER BY per.created_at DESC
        """, (user_id,))
        
        requests = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime objects to ISO strings
        for req in requests:
            for field in ['created_at', 'approved_at', 'submitted_at', 'final_approved_at']:
                if req.get(field) and isinstance(req[field], datetime):
                    req[field] = req[field].isoformat()
        
        return jsonify(requests)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patient_edits_bp.route('/pending', methods=['GET'])
def get_pending_requests():
    """Get all pending edit requests (for admin)"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                per.id,
                per.patient_id,
                p.patient_name,
                p.patient_id as patient_code,
                per.request_reason,
                per.status,
                per.original_data,
                per.proposed_changes,
                per.created_at,
                per.submitted_at,
                requester.full_name as requested_by_name,
                requester.username as requested_by_username
            FROM patient_edit_requests per
            JOIN patients p ON per.patient_id = p.id
            JOIN users requester ON per.requested_by = requester.id
            WHERE per.status IN ('pending_approval', 'changes_submitted')
            ORDER BY per.created_at DESC
        """, ())
        
        requests = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime objects and parse JSON
        for req in requests:
            for field in ['created_at', 'submitted_at']:
                if req.get(field) and isinstance(req[field], datetime):
                    req[field] = req[field].isoformat()
            
            # Parse JSON fields
            if req.get('original_data'):
                req['original_data'] = json.loads(req['original_data'])
            if req.get('proposed_changes'):
                req['proposed_changes'] = json.loads(req['proposed_changes'])
        
        return jsonify(requests)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patient_edits_bp.route('/completed', methods=['GET'])
def get_completed_requests():
    """Get all completed edit requests (for admin)"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                per.id,
                per.patient_id,
                p.patient_name,
                p.patient_id as patient_code,
                per.request_reason,
                per.status,
                per.original_data,
                per.proposed_changes,
                per.review_notes,
                per.created_at,
                per.approved_at,
                per.submitted_at,
                per.final_approved_at,
                requester.full_name as requested_by_name,
                requester.username as requested_by_username,
                reviewer.full_name as reviewed_by_name,
                reviewer.username as reviewed_by_username
            FROM patient_edit_requests per
            JOIN patients p ON per.patient_id = p.id
            JOIN users requester ON per.requested_by = requester.id
            LEFT JOIN users reviewer ON per.reviewed_by = reviewer.id
            WHERE per.status IN ('approved_final', 'rejected')
            ORDER BY per.final_approved_at DESC, per.created_at DESC
        """, ())
        
        requests = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime objects and parse JSON
        for req in requests:
            for field in ['created_at', 'approved_at', 'submitted_at', 'final_approved_at']:
                if req.get(field) and isinstance(req[field], datetime):
                    req[field] = req[field].isoformat()
            
            # Parse JSON fields
            if req.get('original_data'):
                req['original_data'] = json.loads(req['original_data'])
            if req.get('proposed_changes'):
                req['proposed_changes'] = json.loads(req['proposed_changes'])
        
        return jsonify(requests)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patient_edits_bp.route('/<int:request_id>/approve', methods=['POST'])
def approve_edit_request(request_id):
    """Approve edit request (admin only)"""
    try:
        data = request.get_json() or {}
        admin_id = data.get('admin_id')
        notes = data.get('notes', '')
        
        if not admin_id:
            return jsonify({'error': 'Admin ID is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Get the request
        cursor.execute("SELECT * FROM patient_edit_requests WHERE id = %s", (request_id,))
        edit_request = cursor.fetchone()
        
        if not edit_request:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Edit request not found'}), 404
        
        if edit_request['status'] == 'pending_approval':
            # First approval - allow editing
            cursor.execute("""
                UPDATE patient_edit_requests 
                SET status = 'approved_for_edit', reviewed_by = %s, review_notes = %s, approved_at = NOW()
                WHERE id = %s
            """, (admin_id, notes, request_id))
            message = 'Edit request approved. User can now make changes.'
            
        elif edit_request['status'] == 'changes_submitted':
            # Final approval - apply changes
            proposed_changes = json.loads(edit_request['proposed_changes'])
            
            # Update patient data
            cursor.execute("""
                UPDATE patients 
                SET patient_name = %s, contact_number = %s, age = %s, gender = %s, medical_history = %s
                WHERE id = %s
            """, (
                proposed_changes.get('patient_name'),
                proposed_changes.get('contact_number'),
                proposed_changes.get('age'),
                proposed_changes.get('gender'),
                proposed_changes.get('medical_history'),
                edit_request['patient_id']
            ))
            
            # Update request status
            cursor.execute("""
                UPDATE patient_edit_requests 
                SET status = 'approved_final', reviewed_by = %s, review_notes = %s, final_approved_at = NOW()
                WHERE id = %s
            """, (admin_id, notes, request_id))
            message = 'Changes approved and applied successfully.'
            
        else:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Invalid request status for approval'}), 400
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'success': True, 'message': message})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patient_edits_bp.route('/<int:request_id>/reject', methods=['POST'])
def reject_edit_request(request_id):
    """Reject edit request (admin only)"""
    try:
        data = request.get_json() or {}
        admin_id = data.get('admin_id')
        notes = data.get('notes', '')
        
        if not admin_id:
            return jsonify({'error': 'Admin ID is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE patient_edit_requests 
            SET status = 'rejected', reviewed_by = %s, review_notes = %s
            WHERE id = %s
        """, (admin_id, notes, request_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Edit request rejected'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patient_edits_bp.route('/<int:request_id>/submit-changes', methods=['POST'])
def submit_changes(request_id):
    """Submit proposed changes (receptionist)"""
    try:
        data = request.get_json() or {}
        changes = data.get('changes')
        
        if not changes:
            return jsonify({'error': 'Changes data is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Verify request exists and is in correct status
        cursor.execute("SELECT * FROM patient_edit_requests WHERE id = %s", (request_id,))
        edit_request = cursor.fetchone()
        
        if not edit_request:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Edit request not found'}), 404
        
        if edit_request['status'] != 'approved_for_edit':
            cursor.close()
            conn.close()
            return jsonify({'error': 'Request is not approved for editing'}), 400
        
        # Update request with proposed changes
        cursor.execute("""
            UPDATE patient_edit_requests 
            SET proposed_changes = %s, status = 'changes_submitted', submitted_at = NOW()
            WHERE id = %s
        """, (json.dumps(changes), request_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Changes submitted for final approval'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patient_edits_bp.route('/<int:request_id>', methods=['GET'])
def get_edit_request(request_id):
    """Get specific edit request details"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                per.*,
                p.patient_name,
                p.patient_id as patient_code,
                requester.full_name as requested_by_name,
                reviewer.full_name as reviewed_by_name
            FROM patient_edit_requests per
            JOIN patients p ON per.patient_id = p.id
            JOIN users requester ON per.requested_by = requester.id
            LEFT JOIN users reviewer ON per.reviewed_by = reviewer.id
            WHERE per.id = %s
        """, (request_id,))
        
        edit_request = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not edit_request:
            return jsonify({'error': 'Edit request not found'}), 404
        
        # Convert datetime objects and parse JSON
        for field in ['created_at', 'approved_at', 'submitted_at', 'final_approved_at']:
            if edit_request.get(field) and isinstance(edit_request[field], datetime):
                edit_request[field] = edit_request[field].isoformat()
        
        # Parse JSON fields
        if edit_request.get('original_data'):
            edit_request['original_data'] = json.loads(edit_request['original_data'])
        if edit_request.get('proposed_changes'):
            edit_request['proposed_changes'] = json.loads(edit_request['proposed_changes'])
        
        return jsonify(edit_request)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500