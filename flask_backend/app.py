import os
from flask import Flask
from flask_cors import CORS

from config import UPLOAD_FOLDER
from database import init_db
from ml_models import init_models

# Import route blueprints
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.requests import requests_bp
from routes.patients import patients_bp
from routes.notifications import notifications_bp
from routes.patient_edits import patient_edits_bp

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(requests_bp)
app.register_blueprint(patients_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(patient_edits_bp)

# Initialize database
init_db()

# Initialize ML models
init_models()

if __name__ == '__main__':
    app.run(debug=True)
