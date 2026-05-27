from flask import Blueprint, request, jsonify

from database import get_db_connection

notifications_bp = Blueprint('notifications', __name__)


def create_notification(user_id, notification_type, title, message, related_id=None):
    """Helper function to create a notification"""
    try:
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO notifications (user_id, type, title, message, related_id) 
               VALUES (%s, %s, %s, %s, %s)""",
            (user_id, notification_type, title, message, related_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error creating notification: {e}")
        return False


def notify_role(role, notification_type, title, message, related_id=None):
    """Notify all users with a specific role"""
    try:
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE role = %s", (role,))
        users = cursor.fetchall()
        
        for user in users:
            cursor.execute(
                """INSERT INTO notifications (user_id, type, title, message, related_id) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (user['id'], notification_type, title, message, related_id)
            )
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error notifying role: {e}")
        return False


@notifications_bp.route('/notifications/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    """Get notifications for a user"""
    try:
        unread_only = request.args.get('unread', 'false').lower() == 'true'
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        if unread_only:
            cursor.execute("""
                SELECT * FROM notifications 
                WHERE user_id = %s AND is_read = FALSE 
                ORDER BY created_at DESC
                LIMIT 50
            """, (user_id,))
        else:
            cursor.execute("""
                SELECT * FROM notifications 
                WHERE user_id = %s 
                ORDER BY created_at DESC
                LIMIT 50
            """, (user_id,))
        
        notifications = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime to string
        for notif in notifications:
            if notif.get('created_at'):
                notif['created_at'] = notif['created_at'].isoformat()
        
        return jsonify(notifications), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
def mark_as_read(notification_id):
    """Mark a notification as read"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE notifications SET is_read = TRUE WHERE id = %s",
            (notification_id,)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Notification marked as read'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/notifications/user/<int:user_id>/read-all', methods=['POST'])
def mark_all_as_read(user_id):
    """Mark all notifications as read for a user"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = %s",
            (user_id,)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'All notifications marked as read'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/notifications/<int:user_id>/count', methods=['GET'])
def get_unread_count(user_id):
    """Get unread notification count for a user"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(*) FROM notifications WHERE user_id = %s AND is_read = FALSE",
            (user_id,)
        )
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        return jsonify({'count': count}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
