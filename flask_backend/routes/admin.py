from datetime import datetime
from flask import Blueprint, request, jsonify
import mysql.connector
import bcrypt

from database import get_db_connection

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


@admin_bp.route('/users', methods=['GET'])
def list_users():
    """List all users"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor(dictionary=True)
        
        # Check if columns exist
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_banned'")
        has_is_banned = cursor.fetchone() is not None
        
        cursor.execute("SHOW COLUMNS FROM users LIKE 'specialty'")
        has_specialty = cursor.fetchone() is not None
        
        # Build query based on available columns
        base_columns = "id, username, email, role, full_name, created_at"
        if has_specialty:
            base_columns += ", specialty"
        if has_is_banned:
            base_columns += ", is_banned"
            
        cursor.execute(f"SELECT {base_columns} FROM users ORDER BY created_at DESC")
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Add default values for missing columns
        for r in rows:
            if isinstance(r.get('created_at'), datetime):
                r['created_at'] = r['created_at'].isoformat()
            if not has_is_banned:
                r['is_banned'] = False
            if not has_specialty:
                r['specialty'] = None
                
        return jsonify(rows)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/specialists', methods=['GET'])
def list_specialists():
    """List all specialist doctors (role=doctor) with their specialties"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username, full_name, specialty FROM users WHERE role = 'doctor' ORDER BY full_name")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json() or {}
        required = ['username', 'email', 'role']
        for k in required:
            if not data.get(k):
                return jsonify({'error': f'Missing field: {k}'}), 400
        pwd = data.get('password') or 'admin123'
        hashed = bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor()
        # Check if specialty column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'specialty'")
        has_specialty = cursor.fetchone() is not None
        
        if has_specialty:
            cursor.execute(
                "INSERT INTO users (username, password, email, role, full_name, specialty) VALUES (%s, %s, %s, %s, %s, %s)",
                (data['username'], hashed, data['email'], data['role'], data.get('full_name'), data.get('specialty'))
            )
        else:
            cursor.execute(
                "INSERT INTO users (username, password, email, role, full_name) VALUES (%s, %s, %s, %s, %s)",
                (data['username'], hashed, data['email'], data['role'], data.get('full_name'))
            )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True}), 201
    except mysql.connector.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id: int):
    """Update a user"""
    try:
        data = request.get_json() or {}
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor()
        
        # Check if specialty column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'specialty'")
        has_specialty = cursor.fetchone() is not None
        
        fields = []
        values = []
        allowed_cols = ['username', 'email', 'role', 'full_name']
        if has_specialty:
            allowed_cols.append('specialty')
            
        for col in allowed_cols:
            if col in data and data[col] is not None:
                fields.append(f"{col}=%s")
                values.append(data[col])
        if 'password' in data and data['password']:
            hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            fields.append("password=%s")
            values.append(hashed)
        if not fields:
            cursor.close()
            conn.close()
            return jsonify({'error': 'No fields to update'}), 400
        values.append(user_id)
        
        cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE id=%s", tuple(values))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/reset-defaults', methods=['POST'])
def reset_defaults():
    """Reset default users"""
    try:
        defaults = [
            ('admin', 'admin@cardiomegaly.com', 'admin', 'System Administrator', 'admin123'),
            ('doctor1', 'doctor1@cardiomegaly.com', 'doctor', 'Dr. John Smith', 'admin123'),
            ('technician1', 'tech1@cardiomegaly.com', 'xray_technician', 'Jane Doe', 'admin123'),
        ]
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor()
        for username, email, role, full_name, pwd in defaults:
            hashed = bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
            row = cursor.fetchone()
            if row:
                cursor.execute(
                    "UPDATE users SET password=%s, email=%s, role=%s, full_name=%s WHERE id=%s",
                    (hashed, email, role, full_name, row[0])
                )
            else:
                cursor.execute(
                    "INSERT INTO users (username, password, email, role, full_name) VALUES (%s, %s, %s, %s, %s)",
                    (username, hashed, email, role, full_name)
                )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500





@admin_bp.route('/users/<int:user_id>/ban', methods=['POST'])
def ban_user(user_id: int):
    """Ban a user"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor()
        
        # Check if is_banned column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_banned'")
        has_is_banned = cursor.fetchone() is not None
        
        if not has_is_banned:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Ban functionality requires database migration. Please run add_is_banned_column.sql'}), 400
        
        # Check if user exists
        cursor.execute("SELECT username FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()
        if not user:
            cursor.close()
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Ban the user
        cursor.execute("UPDATE users SET is_banned=1 WHERE id=%s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'message': f'User {user[0]} banned successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>/unban', methods=['POST'])
def unban_user(user_id: int):
    """Unban a user"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor()
        
        # Check if is_banned column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_banned'")
        has_is_banned = cursor.fetchone() is not None
        
        if not has_is_banned:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Ban functionality requires database migration. Please run add_is_banned_column.sql'}), 400
        
        # Check if user exists
        cursor.execute("SELECT username FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()
        if not user:
            cursor.close()
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Unban the user
        cursor.execute("UPDATE users SET is_banned=0 WHERE id=%s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'message': f'User {user[0]} unbanned successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/diagnosis', methods=['GET'])
def diagnosis():
    """Get all diagnosis records"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT 
              p.id as prediction_id,
              r.id as request_id,
              r.patient_name,
              r.patient_id,
              r.status,
              r.created_at,
              p.filename,
              p.prediction,
              p.confidence,
              p.timestamp,
              u.full_name as doctor_name,
              u.id as doctor_id
            FROM predictions p
            JOIN xray_requests r ON p.request_id = r.id
            JOIN users u ON r.doctor_id = u.id
            ORDER BY p.timestamp DESC
            """
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        for r in rows:
            if isinstance(r.get('created_at'), datetime):
                r['created_at'] = r['created_at'].isoformat()
            if isinstance(r.get('timestamp'), datetime):
                r['timestamp'] = r['timestamp'].isoformat()
        return jsonify(rows)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/system-overview', methods=['GET'])
def system_overview():
    """Get comprehensive system overview data for admin dashboard"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor(dictionary=True)
        
        # Get total counts
        cursor.execute("SELECT COUNT(*) as total_users FROM users")
        total_users = cursor.fetchone()['total_users']
        
        cursor.execute("SELECT COUNT(*) as total_requests FROM xray_requests")
        total_requests = cursor.fetchone()['total_requests']
        
        cursor.execute("SELECT COUNT(*) as total_diagnoses FROM predictions")
        total_diagnoses = cursor.fetchone()['total_diagnoses']
        
        # Get request status counts
        cursor.execute("SELECT COUNT(*) as pending_requests FROM xray_requests WHERE status = 'pending'")
        pending_requests = cursor.fetchone()['pending_requests']
        
        cursor.execute("SELECT COUNT(*) as completed_requests FROM xray_requests WHERE status = 'completed'")
        completed_requests = cursor.fetchone()['completed_requests']
        
        # Get diagnosis counts
        cursor.execute("SELECT COUNT(*) as positive_diagnoses FROM predictions WHERE prediction = 'positive'")
        positive_diagnoses = cursor.fetchone()['positive_diagnoses']
        
        cursor.execute("SELECT COUNT(*) as negative_diagnoses FROM predictions WHERE prediction = 'negative'")
        negative_diagnoses = cursor.fetchone()['negative_diagnoses']
        
        # Get users by role
        cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        users_by_role = cursor.fetchall()
        
        # Get requests by date (last 30 days)
        cursor.execute("""
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM xray_requests 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at) 
            ORDER BY date
        """)
        requests_by_date = cursor.fetchall()
        
        # Get diagnoses by date (last 30 days)
        cursor.execute("""
            SELECT 
                DATE(p.timestamp) as date,
                SUM(CASE WHEN p.prediction = 'positive' THEN 1 ELSE 0 END) as positive,
                SUM(CASE WHEN p.prediction = 'negative' THEN 1 ELSE 0 END) as negative
            FROM predictions p
            WHERE p.timestamp >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(p.timestamp)
            ORDER BY date
        """)
        diagnoses_by_date = cursor.fetchall()
        
        # Calculate system performance metrics
        cursor.execute("""
            SELECT 
                AVG(TIMESTAMPDIFF(MINUTE, r.created_at, p.timestamp)) as avg_processing_time_minutes,
                COUNT(*) as total_processed
            FROM predictions p
            JOIN xray_requests r ON p.request_id = r.id
            WHERE p.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        """)
        performance_data = cursor.fetchone()
        
        avg_processing_time = performance_data['avg_processing_time_minutes'] or 0
        success_rate = (completed_requests / max(total_requests, 1)) * 100
        uptime_percentage = 99.5  # Mock uptime data
        
        cursor.close()
        conn.close()
        
        # Format dates for frontend
        for item in requests_by_date:
            if isinstance(item['date'], datetime):
                item['date'] = item['date'].strftime('%Y-%m-%d')
        
        for item in diagnoses_by_date:
            if isinstance(item['date'], datetime):
                item['date'] = item['date'].strftime('%Y-%m-%d')
        
        return jsonify({
            'total_users': total_users,
            'total_requests': total_requests,
            'total_diagnoses': total_diagnoses,
            'pending_requests': pending_requests,
            'completed_requests': completed_requests,
            'positive_diagnoses': positive_diagnoses,
            'negative_diagnoses': negative_diagnoses,
            'users_by_role': users_by_role,
            'requests_by_date': requests_by_date,
            'diagnoses_by_date': diagnoses_by_date,
            'system_performance': {
                'avg_processing_time': round(avg_processing_time, 2),
                'success_rate': round(success_rate, 2),
                'uptime_percentage': uptime_percentage
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
