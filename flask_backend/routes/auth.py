import secrets
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Blueprint, request, jsonify
import bcrypt

from database import get_db_connection
from config import SMTP_CONFIG, FRONTEND_URL
from utils import verify_password

auth_bp = Blueprint('auth', __name__)


def send_reset_email(to_email, reset_token, user_name):
    """Send password reset email via SMTP with detailed debugging"""
    print("\n" + "="*60)
    print("EMAIL DEBUG INFORMATION")
    print("="*60)
    print(f"SMTP_HOST: {SMTP_CONFIG['host']}")
    print(f"SMTP_PORT: {SMTP_CONFIG['port']}")
    print(f"SMTP_EMAIL: {SMTP_CONFIG['email'] if SMTP_CONFIG['email'] else 'NOT SET'}")
    print(f"SMTP_PASSWORD: {'*' * len(SMTP_CONFIG['password']) if SMTP_CONFIG['password'] else 'NOT SET'}")
    print(f"USE_TLS: {SMTP_CONFIG['use_tls']}")
    print(f"FRONTEND_URL: {FRONTEND_URL}")
    print(f"RECIPIENT EMAIL: {to_email}")
    print(f"RECIPIENT NAME: {user_name}")
    print("="*60)
    
    try:
        if not SMTP_CONFIG['email']:
            print("[ERROR] SMTP_EMAIL is not set!")
            return False
        if not SMTP_CONFIG['password']:
            print("[ERROR] SMTP_PASSWORD is not set!")
            return False
        
        reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        print(f"[INFO] Reset link generated: {reset_link}")
        
        print("[INFO] Creating email message...")
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Cardiomegaly Detection System - Password Reset Request'
        msg['From'] = SMTP_CONFIG['email']
        msg['To'] = to_email
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello {user_name},</p>
            <p>We received a request to reset your password for your Cardiomegaly Detection System account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{reset_link}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">{reset_link}</p>
            <p style="color: #999; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Cardiomegaly Detection System - Medical AI Technology</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_content, 'html'))
        print("[INFO] Email message created successfully")
        
        print(f"[INFO] Connecting to SMTP server {SMTP_CONFIG['host']}:{SMTP_CONFIG['port']}...")
        server = smtplib.SMTP(SMTP_CONFIG['host'], SMTP_CONFIG['port'], timeout=30)
        server.set_debuglevel(1)
        
        if SMTP_CONFIG['use_tls']:
            print("[INFO] Starting TLS encryption...")
            server.starttls()
            print("[INFO] TLS started successfully")
        
        print(f"[INFO] Logging in as {SMTP_CONFIG['email']}...")
        server.login(SMTP_CONFIG['email'], SMTP_CONFIG['password'])
        print("[INFO] Login successful!")
        
        print(f"[INFO] Sending email to {to_email}...")
        server.sendmail(SMTP_CONFIG['email'], to_email, msg.as_string())
        server.quit()
        
        print("[SUCCESS] Password reset email sent successfully!")
        print("="*60 + "\n")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"[ERROR] SMTP Authentication failed: {e}")
        print("[HINT] For Gmail, use an App Password instead of your regular password")
        print("="*60 + "\n")
        return False
    except smtplib.SMTPConnectError as e:
        print(f"[ERROR] SMTP Connection failed: {e}")
        print("="*60 + "\n")
        return False
    except smtplib.SMTPServerDisconnected as e:
        print(f"[ERROR] SMTP Server disconnected: {e}")
        print("="*60 + "\n")
        return False
    except TimeoutError as e:
        print(f"[ERROR] Connection timed out: {e}")
        print("="*60 + "\n")
        return False
    except Exception as e:
        print(f"[ERROR] Failed to send email: {type(e).__name__}: {e}")
        print("="*60 + "\n")
        return False


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user against database"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = conn.cursor(dictionary=True)
        
        # Check if is_banned column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_banned'")
        has_is_banned = cursor.fetchone() is not None
        
        if has_is_banned:
            cursor.execute("""
                SELECT id, username, email, role, full_name, password, is_banned
                FROM users
                WHERE username = %s
            """, (username,))
        else:
            cursor.execute("""
                SELECT id, username, email, role, full_name, password
                FROM users
                WHERE username = %s
            """, (username,))
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            return jsonify({"error": "Invalid username or password"}), 401
        
        if not verify_password(password, user['password']):
            return jsonify({"error": "Invalid username or password"}), 401
        
        # Check if user is banned (if column exists)
        if user.get('is_banned'):
            return jsonify({"error": "Your account has been banned. Please contact an administrator."}), 403
        
        # Remove password from response
        user.pop('password')
        # Remove is_banned from response if it exists
        if 'is_banned' in user:
            user.pop('is_banned')
            
        return jsonify({
            "success": True,
            "user": user
        }), 200
            
    except Exception as e:
        print(f"Error during login: {str(e)}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset - sends email with reset link"""
    print("\n" + "="*60)
    print("FORGOT PASSWORD REQUEST")
    print("="*60)
    
    try:
        data = request.get_json()
        email = data.get('email')
        print(f"[INFO] Received request for email: {email}")
        
        if not email:
            print("[ERROR] No email provided")
            return jsonify({"error": "Email is required"}), 400
        
        conn = get_db_connection()
        if not conn:
            print("[ERROR] Database connection failed")
            return jsonify({'error': 'Database connection failed'}), 500
        
        print("[INFO] Database connected successfully")
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, email, full_name FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            print(f"[WARNING] No user found with email: {email}")
            cursor.close()
            conn.close()
            return jsonify({"message": "If an account exists with this email, a reset link will be sent."}), 200
        
        print(f"[INFO] User found: ID={user['id']}, Name={user['full_name']}, Email={user['email']}")
        
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(hours=1)
        print(f"[INFO] Generated reset token (expires: {expires_at})")
        
        cursor.execute("UPDATE password_reset_tokens SET used = TRUE WHERE user_id = %s AND used = FALSE", (user['id'],))
        print("[INFO] Invalidated existing tokens")
        
        cursor.execute(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user['id'], reset_token, expires_at)
        )
        conn.commit()
        print("[INFO] Token stored in database")
        
        print("[INFO] Attempting to send email...")
        email_sent = send_reset_email(user['email'], reset_token, user['full_name'] or 'User')
        
        cursor.close()
        conn.close()
        
        if email_sent:
            print("[SUCCESS] Password reset email sent!")
            print("="*60 + "\n")
            return jsonify({"message": "Password reset link sent to your email."}), 200
        else:
            print("[ERROR] Email sending failed")
            print("="*60 + "\n")
            return jsonify({"error": "Failed to send email. Please check SMTP configuration."}), 500
        
    except Exception as e:
        print(f"[ERROR] Exception in forgot_password: {e}")
        print("="*60 + "\n")
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/verify-reset-token', methods=['POST'])
def verify_reset_token():
    """Verify if a password reset token is valid"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({"error": "Token is required"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT t.*, u.email, u.full_name 
            FROM password_reset_tokens t
            JOIN users u ON t.user_id = u.id
            WHERE t.token = %s AND t.used = FALSE AND t.expires_at > NOW()
        """, (token,))
        token_record = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not token_record:
            return jsonify({"valid": False, "error": "Invalid or expired token"}), 400
        
        return jsonify({"valid": True, "email": token_record['email']}), 200
        
    except Exception as e:
        print(f"Error in verify_reset_token: {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using token"""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')
        
        if not token or not new_password:
            return jsonify({"error": "Token and new password are required"}), 400
        
        if len(new_password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT t.*, u.id as user_id
            FROM password_reset_tokens t
            JOIN users u ON t.user_id = u.id
            WHERE t.token = %s AND t.used = FALSE AND t.expires_at > NOW()
        """, (token,))
        token_record = cursor.fetchone()
        
        if not token_record:
            cursor.close()
            conn.close()
            return jsonify({"error": "Invalid or expired token"}), 400
        
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        print(f"[DEBUG] New password hash: {hashed_password}")
        print(f"[DEBUG] Hash length: {len(hashed_password)}")
        print(f"[DEBUG] User ID: {token_record['user_id']}")
        
        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_password, token_record['user_id']))
        print(f"[DEBUG] Rows affected: {cursor.rowcount}")
        
        cursor.execute("UPDATE password_reset_tokens SET used = TRUE WHERE token = %s", (token,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Password reset successfully. You can now login with your new password."}), 200
        
    except Exception as e:
        print(f"Error in reset_password: {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/user/<int:user_id>/change-password', methods=['POST'])
def change_password(user_id):
    """Change user password"""
    try:
        data = request.json
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters long'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT password FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        if not bcrypt.checkpw(current_password.encode('utf-8'), user['password'].encode('utf-8')):
            cursor.close()
            conn.close()
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        
        cursor.execute(
            "UPDATE users SET password = %s WHERE id = %s",
            (hashed_password.decode('utf-8'), user_id)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Password changed successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/validate-session/<int:user_id>', methods=['GET'])
def validate_session(user_id):
    """Validate if user session is still valid (not banned)"""
    try:
        from middleware import validate_user_session
        
        is_valid, error_message = validate_user_session(user_id)
        
        if not is_valid:
            return jsonify({
                'valid': False, 
                'error': error_message or 'Session invalid'
            }), 403
        
        return jsonify({'valid': True}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
