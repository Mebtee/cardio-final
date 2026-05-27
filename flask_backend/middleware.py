"""
Middleware for checking user ban status and session validation
"""

from functools import wraps
from flask import request, jsonify
from database import get_db_connection

def check_user_ban_status(user_id):
    """
    Check if a user is banned
    Returns: (is_banned: bool, error_message: str or None)
    """
    try:
        conn = get_db_connection()
        if not conn:
            return False, None  # If DB fails, don't block access
        
        cursor = conn.cursor(dictionary=True)
        
        # Check if is_banned column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_banned'")
        has_is_banned = cursor.fetchone() is not None
        
        if not has_is_banned:
            cursor.close()
            conn.close()
            return False, None  # Column doesn't exist, allow access
        
        # Check user ban status
        cursor.execute("SELECT is_banned FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not user:
            return True, "User not found"  # User doesn't exist, block access
        
        if user.get('is_banned'):
            return True, "Your account has been banned. Please contact an administrator."
        
        return False, None  # User is not banned
        
    except Exception as e:
        print(f"Error checking ban status: {e}")
        return False, None  # On error, don't block access


def require_active_user(f):
    """
    Decorator to check if user is banned before allowing access to protected routes
    Expects user_id to be passed as a parameter or in request data
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = None
        
        # Try to get user_id from URL parameters
        if 'user_id' in kwargs:
            user_id = kwargs['user_id']
        elif len(args) > 0 and isinstance(args[0], int):
            user_id = args[0]
        else:
            # Try to get user_id from request data
            if request.is_json:
                data = request.get_json() or {}
                user_id = data.get('user_id') or data.get('doctor_id') or data.get('registered_by')
        
        if user_id:
            is_banned, error_message = check_user_ban_status(user_id)
            if is_banned:
                return jsonify({'error': error_message or 'Access denied'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


def validate_user_session(user_id):
    """
    Validate if a user session is still valid (user not banned)
    Returns: (valid: bool, error_message: str or None)
    """
    is_banned, error_message = check_user_ban_status(user_id)
    return not is_banned, error_message