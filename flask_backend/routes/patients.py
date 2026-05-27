from flask import Blueprint, request, jsonify

from database import get_db_connection
from routes.notifications import notify_role, create_notification

patients_bp = Blueprint('patients', __name__)


def generate_patient_id():
    """Generate auto-incrementing patient ID"""
    conn = get_db_connection()
    if not conn:
        return "PAT0001"
    
    cursor = conn.cursor()
    cursor.execute("SELECT patient_id FROM patients WHERE patient_id LIKE 'PAT%' ORDER BY patient_id DESC LIMIT 1")
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if result and result[0]:
        last_num = int(result[0].replace('PAT', ''))
        new_num = last_num + 1
    else:
        new_num = 1
    
    return f"PAT{new_num:04d}"


@patients_bp.route('/patients', methods=['POST'])
def register_patient():
    """Register a new patient (reception)"""
    try:
        data = request.get_json()
        patient_name = data.get('patient_name')
        contact_number = data.get('contact_number')
        age = data.get('age')
        gender = data.get('gender')
        medical_history = data.get('medical_history', '')
        registered_by = data.get('registered_by')
        
        if not patient_name or not registered_by:
            return jsonify({'error': 'Patient name and registered_by are required'}), 400
        
        patient_id = generate_patient_id()
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO patients (patient_name, patient_id, contact_number, age, gender, 
               medical_history, registered_by, status) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, 'registered')""",
            (patient_name, patient_id, contact_number, age, gender, medical_history, registered_by)
        )
        
        new_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        
        # Notify all general doctors about new patient registration
        notify_role(
            'general_doctor',
            'patient_registered',
            'New Patient Registered',
            f'Patient {patient_name} ({patient_id}) has been registered and is awaiting triage.',
            str(new_id)
        )
        
        return jsonify({
            'message': 'Patient registered successfully',
            'patient_id': new_id,
            'patient_code': patient_id
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patients_bp.route('/patients/search', methods=['GET'])
def search_patients():
    """Search patients"""
    try:
        query = request.args.get('q', '')
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        search_term = f"%{query}%"
        cursor.execute("""
            SELECT p.*, u.full_name as registered_by_name,
                   rd.full_name as referred_to_name
            FROM patients p
            LEFT JOIN users u ON p.registered_by = u.id
            LEFT JOIN users rd ON p.referred_to = rd.id
            WHERE p.patient_name LIKE %s 
               OR p.patient_id LIKE %s 
               OR p.contact_number LIKE %s
            ORDER BY p.created_at DESC
        """, (search_term, search_term, search_term))
        
        patients = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(patients), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patients_bp.route('/patients', methods=['GET'])
def get_patients():
    """Get all patients (general doctor)"""
    try:
        status = request.args.get('status')
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        if status:
            cursor.execute("""
                SELECT p.*, u.full_name as registered_by_name, 
                       rd.full_name as referred_to_name
                FROM patients p
                LEFT JOIN users u ON p.registered_by = u.id
                LEFT JOIN users rd ON p.referred_to = rd.id
                WHERE p.status = %s
                ORDER BY p.created_at DESC
            """, (status,))
        else:
            cursor.execute("""
                SELECT p.*, u.full_name as registered_by_name,
                       rd.full_name as referred_to_name
                FROM patients p
                LEFT JOIN users u ON p.registered_by = u.id
                LEFT JOIN users rd ON p.referred_to = rd.id
                ORDER BY p.created_at DESC
            """)
        
        patients = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(patients), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patients_bp.route('/patients/<int:patient_id>/refer', methods=['POST'])
def refer_patient(patient_id):
    """Refer patient to specialist doctor (general doctor)"""
    try:
        data = request.get_json()
        referred_to = data.get('referred_to')
        
        if not referred_to:
            return jsonify({'error': 'Specialist doctor ID is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Get patient info for notification
        cursor.execute("SELECT patient_name, patient_id as code FROM patients WHERE id = %s", (patient_id,))
        patient = cursor.fetchone()
        
        cursor.execute(
            "UPDATE patients SET status = 'referred', referred_to = %s WHERE id = %s",
            (referred_to, patient_id)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        # Notify the specialist doctor about the referral
        if patient:
            create_notification(
                referred_to,
                'patient_referred',
                'New Patient Referral',
                f'Patient {patient["patient_name"]} ({patient["code"]}) has been referred to you for specialist consultation.',
                str(patient_id)
            )
        
        return jsonify({'message': 'Patient referred successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patients_bp.route('/doctor/<int:doctor_id>/referred-patients', methods=['GET'])
def get_referred_patients(doctor_id):
    """Get referred patients for specialist doctor"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT p.*, u.full_name as registered_by_name
            FROM patients p
            LEFT JOIN users u ON p.registered_by = u.id
            WHERE p.referred_to = %s AND p.status = 'referred'
            ORDER BY p.created_at DESC
        """, (doctor_id,))
        
        patients = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(patients), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
