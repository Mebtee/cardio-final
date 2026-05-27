import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Upload Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'dcm'}

# MySQL Configuration for XAMPP
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Default XAMPP password is empty
    'database': 'cardiomegaly_detection'
}

# SMTP Configuration
SMTP_CONFIG = {
    'host': os.environ.get('SMTP_HOST', 'smtp.gmail.com'),
    'port': int(os.environ.get('SMTP_PORT', 587)),
    'email': os.environ.get('SMTP_EMAIL', ''),
    'password': os.environ.get('SMTP_PASSWORD', ''),
    'use_tls': True
}

# Frontend URL for reset links
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:8080')
