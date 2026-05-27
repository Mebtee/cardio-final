import bcrypt
from werkzeug.security import check_password_hash
from config import ALLOWED_EXTENSIONS


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def verify_password(plain_password, stored_hash):
    """Password verification supporting bcrypt and legacy hashes"""
    try:
        print(f"[DEBUG LOGIN] Stored hash: {stored_hash[:30]}... (length: {len(stored_hash)})")
        print(f"[DEBUG LOGIN] Hash type check - starts with $2a$: {stored_hash.startswith('$2a$')}, $2b$: {stored_hash.startswith('$2b$')}, $2y$: {stored_hash.startswith('$2y$')}")
        
        if isinstance(stored_hash, bytes):
            stored_hash = stored_hash.decode('utf-8')
        if stored_hash.startswith("$2a$") or stored_hash.startswith("$2b$") or stored_hash.startswith("$2y$"):
            result = bcrypt.checkpw(plain_password.encode('utf-8'), stored_hash.encode('utf-8'))
            print(f"[DEBUG LOGIN] bcrypt.checkpw result: {result}")
            return result
        if stored_hash.startswith("pbkdf2:"):
            return check_password_hash(stored_hash, plain_password)
        # Fallback for legacy plaintext (dev only)
        return plain_password == stored_hash
    except Exception as e:
        print(f"Password verify error: {e}")
        return False


def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
