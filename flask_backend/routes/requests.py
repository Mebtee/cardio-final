import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

from database import get_db_connection
from config import UPLOAD_FOLDER
from utils import allowed_file
from ml_models import get_model_prediction
from routes.notifications import notify_role, create_notification

requests_bp = Blueprint('requests', __name__)


@requests_bp.route('/predict', methods=['POST'])
def predict():
    """Route for image prediction (linked to request)"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    request_id = request.form.get('request_id')
    if not request_id:
        return jsonify({'error': 'No request ID provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM xray_requests WHERE id = %s", (request_id,))
        xray_request = cursor.fetchone()
        
        if not xray_request:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Request not found'}), 404
        
        image_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, f"{image_id}_{filename}")
        file.save(file_path)
        
        prediction, confidence, error_message = get_model_prediction(file_path)
        
        if prediction == "not_xray":
            os.remove(file_path)
            cursor.close()
            conn.close()
            return jsonify({
                'error': 'The uploaded image is not a chest X-ray. Please upload a valid chest X-ray image.',
                'details': error_message
            }), 400
        
        if prediction == "error":
            os.remove(file_path)
            cursor.close()
            conn.close()
            return jsonify({
                'error': 'Failed to process image',
                'details': error_message
            }), 500
        
        timestamp = datetime.now()
        cursor.execute(
            "INSERT INTO predictions (id, request_id, filename, prediction, confidence, timestamp) VALUES (%s, %s, %s, %s, %s, %s)",
            (image_id, request_id, filename, prediction, confidence, timestamp)
        )
        
        cursor.execute(
            "UPDATE xray_requests SET status = 'completed' WHERE id = %s",
            (request_id,)
        )
        
        conn.commit()
        
        # Notify the requesting doctor that result is ready
        doctor_id = xray_request['doctor_id']
        patient_name = xray_request['patient_name']
        patient_code = xray_request.get('patient_id', 'Unknown')
        result_text = "Positive for cardiomegaly" if prediction == "positive" else "Negative"
        
        create_notification(
            doctor_id,
            'xray_result_ready',
            'X-ray Result Ready',
            f'Result for patient {patient_name} ({patient_code}): {result_text} (Confidence: {confidence:.1%})',
            request_id
        )
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'image_id': image_id,
            'request_id': request_id,
            'prediction': prediction,
            'confidence': confidence,
            'timestamp': timestamp.isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@requests_bp.route('/requests', methods=['POST'])
def create_request():
    """Create a new X-ray request"""
    try:
        data = request.get_json()
        doctor_id = data.get('doctor_id')
        patient_name = data.get('patient_name')
        patient_id = data.get('patient_id')
        request_notes = data.get('request_notes', '')
        patient_db_id = data.get('patient_db_id')  # Internal patient ID for status update
        
        if not doctor_id or not patient_name:
            return jsonify({'error': 'Doctor ID and patient name are required'}), 400
        
        request_id = f"req-{str(uuid.uuid4())}"
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO xray_requests (id, doctor_id, patient_name, patient_id, request_notes, status) VALUES (%s, %s, %s, %s, %s, %s)",
            (request_id, doctor_id, patient_name, patient_id, request_notes, 'pending')
        )
        
        # Update patient status to 'xray_requested' if patient_db_id is provided
        if patient_db_id:
            cursor.execute(
                "UPDATE patients SET status = %s WHERE id = %s",
                ('xray_requested', patient_db_id)
            )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        # Notify all X-ray technicians about new request
        notify_role(
            'xray_technician',
            'xray_request',
            'New X-ray Request',
            f'New X-ray request for patient {patient_name} ({patient_id or "N/A"}) is pending.',
            request_id
        )
        
        return jsonify({
            'request_id': request_id,
            'message': 'Request created successfully'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@requests_bp.route('/requests', methods=['GET'])
def get_all_requests():
    """Get all X-ray requests (for technicians)"""
    try:
        status = request.args.get('status')
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = conn.cursor(dictionary=True)
        
        if status:
            cursor.execute("""
                SELECT r.*, u.full_name as doctor_name 
                FROM xray_requests r
                JOIN users u ON r.doctor_id = u.id
                WHERE r.status = %s
                ORDER BY r.created_at DESC
            """, (status,))
        else:
            cursor.execute("""
                SELECT r.*, u.full_name as doctor_name 
                FROM xray_requests r
                JOIN users u ON r.doctor_id = u.id
                ORDER BY r.created_at DESC
            """)
        
        requests_list = cursor.fetchall()
        cursor.close()
        conn.close()
        
        for req in requests_list:
            if isinstance(req['created_at'], datetime):
                req['created_at'] = req['created_at'].isoformat()
        
        return jsonify(requests_list)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@requests_bp.route('/doctor/requests/<int:doctor_id>', methods=['GET'])
def get_doctor_requests(doctor_id):
    """Get doctor's requests with results"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                r.*,
                p.prediction,
                p.confidence,
                p.timestamp as result_timestamp
            FROM xray_requests r
            LEFT JOIN predictions p ON r.id = p.request_id
            WHERE r.doctor_id = %s
            ORDER BY r.created_at DESC
        """, (doctor_id,))
        
        requests_list = cursor.fetchall()
        cursor.close()
        conn.close()
        
        for req in requests_list:
            if isinstance(req['created_at'], datetime):
                req['created_at'] = req['created_at'].isoformat()
            if req.get('result_timestamp') and isinstance(req['result_timestamp'], datetime):
                req['result_timestamp'] = req['result_timestamp'].isoformat()
        
        return jsonify(requests_list)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@requests_bp.route('/uploads/<prediction_id>', methods=['GET'])
def serve_image(prediction_id):
    """Serve uploaded images by prediction ID"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT filename FROM predictions WHERE id = %s", (prediction_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not result:
            return jsonify({'error': 'Image not found'}), 404
        
        filename = result['filename']
        actual_filename = f"{prediction_id}_{filename}"
        
        file_path = os.path.join(UPLOAD_FOLDER, actual_filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found on disk'}), 404
        
        return send_from_directory(UPLOAD_FOLDER, actual_filename)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
