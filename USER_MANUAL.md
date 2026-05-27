# Cardiomegaly Detection System - User Manual

## Document Information
- **Project**: Cardiomegaly Detection System
- **Version**: 1.0
- **Date**: May 27, 2026
- **Purpose**: Comprehensive user guide for all system users

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Installation Guide](#installation-guide)
4. [User Roles and Permissions](#user-roles-and-permissions)
5. [Admin Guide](#admin-guide)
6. [Reception Guide](#reception-guide)
7. [General Doctor Guide](#general-doctor-guide)
8. [Specialist Doctor Guide](#specialist-doctor-guide)
9. [X-Ray Technician Guide](#x-ray-technician-guide)
10. [Common Features](#common-features)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)
13. [Support and Contact](#support-and-contact)

---

## System Overview

### What is the Cardiomegaly Detection System?

The Cardiomegaly Detection System is an AI-powered hospital management system designed to assist medical professionals in detecting cardiomegaly (enlarged heart) from chest X-ray images. The system combines advanced machine learning with a comprehensive workflow management system to streamline patient care.

### Key Features

- **AI-Powered Diagnosis**: Automated cardiomegaly detection using deep learning models
- **Multi-Role Workflow**: Specialized interfaces for different medical staff roles
- **Patient Management**: Complete patient registration and tracking
- **X-Ray Request Management**: Streamlined X-ray examination workflow
- **Real-Time Notifications**: Instant alerts for important events
- **Data Security**: Role-based access control and secure authentication
- **Analytics Dashboard**: Comprehensive system analytics and reporting

### How It Works

```
1. Patient Registration (Reception)
   ↓
2. Triage by General Doctor
   ↓
3. Referral to Specialist
   ↓
4. X-Ray Request (Specialist)
   ↓
5. X-Ray Upload (Technician)
   ↓
6. AI Analysis (Automated)
   ↓
7. Result Review (Specialist)
   ↓
8. Treatment Planning
```

### Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Flask (Python)
- **Database**: MySQL
- **AI Models**: PyTorch (ResNet18)
- **Authentication**: bcrypt + session management

---

## Getting Started

### System Requirements

#### For Users
- Modern web browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Stable internet connection
- Screen resolution: 1280x720 or higher

#### For Administrators
- All user requirements plus:
- Node.js 18.x (for frontend development)
- Python 3.8+ (for backend development)
- XAMPP or MySQL server (for database)

### First-Time Login

#### Default User Accounts

The system comes with pre-configured default users:

| Role | Username | Password | Full Name |
|------|----------|----------|-----------|
| Admin | admin | admin123 | System Administrator |
| Reception | reception1 | admin123 | Sarah Johnson |
| General Doctor | general_doctor1 | admin123 | Dr. Emily Brown |
| Specialist Doctor | doctor1 | admin123 | Dr. John Smith |
| X-Ray Technician | technician1 | admin123 | Jane Doe |

**⚠️ Security Note**: Change default passwords after first login!

#### Login Steps

1. Open your web browser
2. Navigate to the system URL (e.g., http://localhost:5173)
3. You will see the login page
4. Enter your username and password
5. Click the "Login" button
6. You will be redirected to your role-specific dashboard

#### Forgot Password

If you forget your password:

1. Click "Forgot Password" on the login page
2. Enter your registered email address
3. Click "Send Reset Link"
4. Check your email for the reset link (valid for 1 hour)
5. Click the link to reset your password
6. Enter your new password
7. Click "Reset Password"
8. Login with your new password

---

## Installation Guide

### For System Administrators

#### Prerequisites

```bash
# Required Software
- Node.js 18.x or higher
- Python 3.8 or higher
- XAMPP (for MySQL) or standalone MySQL server
- Git (optional, for version control)
```

#### Backend Installation

```bash
# 1. Navigate to flask_backend directory
cd flask_backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. Configure environment variables
cp .env.example .env
# Edit .env file with your database credentials

# 6. Start XAMPP MySQL server
# - Open XAMPP Control Panel
# - Start Apache and MySQL services

# 7. Set up database
# Option A: Automatic setup (recommended)
# The system will create the database automatically on first run

# Option B: Manual setup
# Open phpMyAdmin (http://localhost/phpmyadmin)
# Import: heartsight_ai_startup.sql

# 8. Run Flask server
python app.py

# The backend will start on http://localhost:5000
```

#### Frontend Installation

```bash
# 1. Navigate to project root directory
cd heart-sight-ai-check

# 2. Install Node.js dependencies
npm install

# 3. Start development server
npm run dev

# The frontend will start on http://localhost:5173
```

#### Production Deployment

```bash
# Build frontend for production
npm run build

# The built files will be in the 'dist' directory
# Deploy 'dist' folder to your web server

# For backend, use a production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Database Configuration

#### Default Configuration

```python
# In flask_backend/config.py
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Empty for XAMPP default
    'database': 'cardiomegaly_detection'
}
```

#### Changing Database Credentials

1. Open `flask_backend/config.py`
2. Modify `DB_CONFIG` with your credentials
3. Save the file
4. Restart the Flask server

---

## User Roles and Permissions

### Role Overview

| Role | Responsibilities | Key Permissions |
|------|------------------|-----------------|
| **Admin** | System management, user administration | Full system access, user management, analytics |
| **Reception** | Patient registration, data entry | Patient registration, search, edit requests |
| **General Doctor** | Patient triage, referrals | View registered patients, refer to specialists |
| **Specialist Doctor** | X-ray requests, diagnosis | Create requests, review results, patient care |
| **X-Ray Technician** | X-ray imaging, uploads | View requests, upload images, process analysis |

### Permission Matrix

| Feature | Admin | Reception | General Doctor | Specialist | Technician |
|---------|-------|-----------|----------------|------------|-------------|
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Patient Registration | ✅ | ✅ | ❌ | ❌ | ❌ |
| Patient Search | ✅ | ✅ | ✅ | ✅ | ❌ |
| Patient Referral | ✅ | ✅ | ✅ | ❌ | ❌ |
| X-Ray Request Creation | ✅ | ❌ | ❌ | ✅ | ❌ |
| X-Ray Upload | ✅ | ❌ | ❌ | ❌ | ✅ |
| View Results | ✅ | ❌ | ❌ | ✅ | ✅ |
| System Analytics | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Request Approval | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Admin Guide

### Dashboard Overview

The Admin Dashboard provides comprehensive system management capabilities:

- **System Overview**: Real-time analytics and statistics
- **User Management**: Create, edit, ban, and delete users
- **Diagnosis Data**: View and filter all AI predictions
- **Edit Requests**: Review and approve patient data changes
- **Settings**: System configuration and maintenance

### User Management

#### Creating a New User

1. Navigate to **User Management** from the dashboard
2. Click the **"Add New User"** button
3. Fill in the required fields:
   - **Username**: Unique identifier for login
   - **Email**: Valid email address
   - **Full Name**: User's complete name
   - **Role**: Select from dropdown (Admin, Reception, General Doctor, Specialist Doctor, X-Ray Technician)
   - **Specialty**: For doctors only (e.g., Cardiology, Radiology)
   - **Password**: Initial password (minimum 8 characters)
4. Click **"Create User"**
5. The user will be created and can immediately login

#### Editing User Information

1. Navigate to **User Management**
2. Find the user in the list (use search/filter if needed)
3. Click the **"Edit"** button next to the user
4. Modify the desired fields
5. Click **"Save Changes"**
6. The user information will be updated

#### Banning a User

1. Navigate to **User Management**
2. Find the user to ban
3. Click the **"Ban"** button
4. Confirm the ban action
5. The user will be banned and cannot login
6. The user will receive a notification about the ban

#### Unbanning a User

1. Navigate to **User Management**
2. Find the banned user (they will be marked as banned)
3. Click the **"Unban"** button
4. Confirm the unban action
5. The user will be unbanned and can login again
6. The user will receive a notification about the unban

#### Deleting a User

⚠️ **Caution**: This action cannot be undone!

1. Navigate to **User Management**
2. Find the user to delete
3. Click the **"Delete"** button
4. Confirm the deletion
5. The user and all associated data will be permanently removed

### System Overview

The System Overview provides real-time analytics:

- **Total Users**: Count of all registered users
- **Total Patients**: Count of all registered patients
- **Total X-Ray Requests**: Count of all X-ray requests
- **Completed Requests**: Count of completed X-ray analyses
- **Positive Diagnoses**: Count of cardiomegaly-positive cases
- **Negative Diagnoses**: Count of cardiomegaly-negative cases
- **Success Rate**: Percentage of successful analyses

#### Viewing Charts

1. Navigate to **System Overview**
2. View the various charts:
   - User distribution by role
   - Patient registration trends
   - X-ray request trends
   - Diagnosis distribution
3. Hover over chart elements for detailed information

### Diagnosis Data Management

#### Viewing All Predictions

1. Navigate to **Diagnosis Data**
2. All AI predictions are displayed in a table
3. Each entry shows:
   - Prediction ID
   - Patient name
   - Prediction result (Positive/Negative)
   - Confidence score
   - Timestamp
   - Requesting doctor

#### Filtering Predictions

1. Navigate to **Diagnosis Data**
2. Use the filter controls:
   - **Date Range**: Select start and end dates
   - **Prediction Result**: Filter by Positive/Negative
   - **Doctor**: Filter by requesting doctor
   - **Confidence Range**: Filter by confidence score
3. Click **"Apply Filters"**
4. Results will update based on your filters

#### Downloading X-Ray Images

**Single Download**:
1. Navigate to **Diagnosis Data**
2. Find the desired prediction
3. Click the **"Download Image"** button
4. The image will be downloaded to your computer

**Bulk Download**:
1. Navigate to **Diagnosis Data**
2. Select multiple predictions using checkboxes
3. Click **"Download Selected"**
4. Images will be downloaded as a ZIP file

### Edit Request Management

#### Viewing Edit Requests

1. Navigate to **Edit Requests**
2. All pending and processed requests are displayed
3. Each request shows:
   - Request ID
   - Patient name
   - Requested by
   - Status (Pending, Approved, Rejected)
   - Request reason
   - Timestamp

#### Approving an Edit Request

1. Navigate to **Edit Requests**
2. Find a pending request
3. Click **"View Details"**
4. Review the original data and proposed changes
5. Add review notes (optional)
6. Click **"Approve"**
7. The reception staff will be notified to submit the changes

#### Rejecting an Edit Request

1. Navigate to **Edit Requests**
2. Find a pending request
3. Click **"View Details"**
4. Review the request details
5. Add rejection reason (required)
6. Click **"Reject"**
7. The request will be marked as rejected
8. The reception staff will be notified

#### Final Approval

After the reception staff submits the changes:

1. Navigate to **Edit Requests**
2. Find the request with status "Changes Submitted"
3. Click **"View Details"**
4. Review the submitted changes
5. Add final review notes (optional)
6. Click **"Final Approve"** to apply changes
7. Or click **"Reject"** to reject the changes

### Notifications

Admins receive notifications for:
- New user registrations
- Edit requests
- System errors
- Security alerts

#### Managing Notifications

1. Click the **notification bell** icon in the top right
2. View the notification list
3. Click on a notification to mark it as read
4. Click **"Mark All as Read"** to clear all notifications

### Profile Management

#### Updating Your Profile

1. Click your **username** in the top right
2. Select **"Profile"**
3. Update your information:
   - Full name
   - Email
   - Specialty (if applicable)
4. Click **"Save Changes"**

#### Changing Your Password

1. Click your **username** in the top right
2. Select **"Profile"**
3. Scroll to **"Change Password"** section
4. Enter your current password
5. Enter your new password
6. Confirm your new password
7. Click **"Update Password"**
8. You will be logged out and need to login again

---

## Reception Guide

### Dashboard Overview

The Reception Dashboard focuses on patient management:

- **Patient Registration**: Register new patients
- **Patient Search**: Find existing patients
- **Patient List**: View all registered patients
- **Edit Requests**: Request and submit patient data changes
- **Notifications**: Receive alerts about important events

### Patient Registration

#### Registering a New Patient

1. Navigate to **Patient Registration**
2. Fill in the required fields (marked with *):

   **Personal Information**:
   - **Patient Name**: Full name of the patient
   - **Age**: Patient's age
   - **Gender**: Select Male, Female, or Other
   - **Contact Number**: Phone number (format: XXX-XXX-XXXX)

   **Medical Information**:
   - **Medical History**: Any relevant medical history (optional)

3. Click **"Register Patient"**
4. A unique Patient ID will be automatically generated (format: PAT-XXXXX)
5. The patient will be registered in the system
6. A success message will be displayed

#### Patient ID Format

Patient IDs are automatically generated in the format: `PAT-XXXXX`
- Example: `PAT-00123`, `PAT-00124`
- IDs are sequential and unique
- Do not modify or reuse patient IDs

### Patient Search

#### Searching by Name

1. Navigate to **Patient Search**
2. Select **"Search by Name"**
3. Enter the patient's name (full or partial)
4. Click **"Search"**
5. Matching patients will be displayed

#### Searching by Patient ID

1. Navigate to **Patient Search**
2. Select **"Search by ID"**
3. Enter the patient ID (e.g., PAT-00123)
4. Click **"Search"**
5. The patient will be displayed if found

#### Searching by Phone Number

1. Navigate to **Patient Search**
2. Select **"Search by Phone"**
3. Enter the phone number
4. Click **"Search"**
5. Matching patients will be displayed

### Viewing Patient Details

1. Search for a patient using any method
2. Click on the patient in the results
3. The patient details page will show:
   - Patient ID
   - Name
   - Age
   - Gender
   - Contact number
   - Medical history
   - Registration date
   - Current status
   - Referred doctor (if any)

### Patient Referral

#### Referring a Patient to a Doctor

1. Navigate to patient details
2. Click **"Refer to Doctor"**
3. Select a specialist doctor from the dropdown
4. Add referral notes (optional)
5. Click **"Submit Referral"**
6. The patient status will change to "Referred"
7. The specialist doctor will receive a notification

### Patient Data Edit Requests

#### Requesting a Data Edit

If you discover incorrect patient information:

1. Navigate to patient details
2. Click **"Request Edit"**
3. Select the fields that need correction
4. Enter the correct information
5. Provide a reason for the edit request
6. Click **"Submit Request"**
7. The request will be sent to admin for approval
8. You will receive a notification when the request is reviewed

#### Viewing Edit Request Status

1. Navigate to **Edit Requests**
2. All your edit requests are displayed
3. Status indicators:
   - **Pending**: Waiting for admin review
   - **Approved for Edit**: Admin approved, you can now submit changes
   - **Changes Submitted**: You submitted changes, waiting for final approval
   - **Approved Final**: Changes applied successfully
   - **Rejected**: Request was rejected

#### Submitting Changes After Approval

1. Navigate to **Edit Requests**
2. Find a request with status "Approved for Edit"
3. Click **"Submit Changes"**
4. Enter the corrected information
5. Click **"Submit"**
6. The changes will be sent to admin for final approval

### Notifications

Reception staff receive notifications for:
- New patient registrations
- Edit request approvals/rejections
- Patient referrals

#### Managing Notifications

1. Click the **notification bell** icon
2. View the notification list
3. Click on a notification to mark it as read
4. Click **"Mark All as Read"** to clear all

### Profile Management

#### Updating Your Profile

1. Click your **username** in the top right
2. Select **"Profile"**
3. Update your information
4. Click **"Save Changes"**

#### Changing Your Password

1. Click your **username** in the top right
2. Select **"Profile"**
3. Scroll to **"Change Password"**
4. Enter current password
5. Enter new password
6. Confirm new password
7. Click **"Update Password"**

---

## General Doctor Guide

### Dashboard Overview

The General Doctor Dashboard focuses on patient triage:

- **Registered Patients**: View patients awaiting triage
- **Patient Referrals**: Refer patients to specialists
- **Referral History**: View past referrals
- **Notifications**: Receive alerts about new registrations

### Viewing Registered Patients

1. Navigate to **Registered Patients**
2. All patients with status "Registered" are displayed
3. Each patient shows:
   - Patient ID
   - Name
   - Age
   - Gender
   - Registration date
   - Contact number

#### Filtering Patients

**By Status**:
1. Navigate to **Registered Patients**
2. Select status from dropdown (Registered, Referred, X-Ray Requested, Completed)
3. Click **"Apply Filter"**

**By Date**:
1. Navigate to **Registered Patients**
2. Select date range
3. Click **"Apply Filter"**

### Patient Triage

#### Reviewing Patient Information

1. Navigate to **Registered Patients**
2. Click on a patient
3. Review:
   - Personal information
   - Medical history
   - Contact information

#### Referring to Specialist

1. Navigate to patient details
2. Click **"Refer to Specialist"**
3. Select a specialist from the dropdown:
   - Cardiologist
   - Radiologist
   - Other specialists
4. Add referral notes (optional but recommended)
5. Click **"Submit Referral"**
6. The patient status changes to "Referred"
7. The specialist doctor receives a notification

### Referral History

1. Navigate to **Referral History**
2. All your referrals are displayed
3. Each entry shows:
   - Patient name
   - Referred to
   - Referral date
   - Current status

### Notifications

General doctors receive notifications for:
- New patient registrations
- Referral confirmations

#### Managing Notifications

1. Click the **notification bell** icon
2. View notification list
3. Click to mark as read

### Profile Management

#### Updating Your Profile

1. Click your **username** in the top right
2. Select **"Profile"**
3. Update your information
4. Click **"Save Changes"**

#### Changing Your Password

1. Click your **username** in the top right
2. Select **"Profile"**
3. Scroll to **"Change Password"**
4. Enter current password
5. Enter new password
6. Confirm new password
7. Click **"Update Password"**

---

## Specialist Doctor Guide

### Dashboard Overview

The Specialist Doctor Dashboard focuses on X-ray management:

- **Referred Patients**: View patients referred to you
- **X-Ray Requests**: Create and manage X-ray requests
- **Request History**: View past requests and results
- **Results Review**: Review AI analysis results
- **Statistics**: View your request statistics

### Viewing Referred Patients

1. Navigate to **Referred Patients**
2. All patients referred to you are displayed
3. Each patient shows:
   - Patient ID
   - Name
   - Age
   - Gender
   - Referral date
   - Referring doctor
   - Current status

#### Patient Details

1. Click on a patient
2. View complete information:
   - Personal details
   - Medical history
   - Referral notes
   - Previous X-rays (if any)

### Creating X-Ray Requests

1. Navigate to **Referred Patients**
2. Select a patient
3. Click **"Create X-Ray Request"**
4. Fill in the request form:
   - **Request Notes**: Specific instructions for the X-ray (optional)
   - **Priority**: Normal or Urgent
5. Click **"Submit Request"**
6. The request is created
7. The X-ray technician receives a notification
8. The patient status changes to "X-Ray Requested"

### Request History

1. Navigate to **Request History**
2. All your X-ray requests are displayed
3. Each request shows:
   - Request ID
   - Patient name
   - Request date
   - Status (Pending, In Progress, Completed)
   - Prediction result (if completed)

#### Filtering Requests

**By Status**:
1. Navigate to **Request History**
2. Select status from dropdown
3. Click **"Apply Filter"**

**By Date**:
1. Navigate to **Request History**
2. Select date range
3. Click **"Apply Filter"**

### Reviewing X-Ray Results

1. Navigate to **Request History**
2. Find a completed request
3. Click **"View Results"**
4. The results page shows:
   - **X-Ray Image**: The uploaded chest X-ray
   - **AI Prediction**: Positive or Negative for cardiomegaly
   - **Confidence Score**: Percentage confidence (0-100%)
   - **Analysis Date**: When the analysis was performed
   - **Request Notes**: Your original request notes

#### Understanding the Results

- **Positive**: AI detected signs of cardiomegaly (enlarged heart)
- **Negative**: AI did not detect signs of cardiomegaly
- **Confidence Score**: How confident the AI is in its prediction
  - > 90%: Very confident
  - 70-90%: Confident
  - 50-70%: Moderately confident
  - < 50%: Low confidence (recommend manual review)

⚠️ **Important**: AI predictions are for assistance only. Always use your clinical judgment.

#### Adding Clinical Notes

1. Navigate to request results
2. Click **"Add Clinical Notes"**
3. Enter your observations and diagnosis
4. Click **"Save Notes"**
5. Notes are saved to the patient record

### Statistics

1. Navigate to **Statistics**
2. View your performance metrics:
   - Total requests
   - Completed requests
   - Pending requests
   - Average completion time
   - Positive diagnosis rate
   - Negative diagnosis rate

### Notifications

Specialist doctors receive notifications for:
- New patient referrals
- X-ray request completions
- Result availability

#### Managing Notifications

1. Click the **notification bell** icon
2. View notification list
3. Click to mark as read

### Profile Management

#### Updating Your Profile

1. Click your **username** in the top right
2. Select **"Profile"**
3. Update your information:
   - Full name
   - Email
   - Specialty
4. Click **"Save Changes"**

#### Changing Your Password

1. Click your **username** in the top right
2. Select **"Profile"**
3. Scroll to **"Change Password"**
4. Enter current password
5. Enter new password
6. Confirm new password
7. Click **"Update Password"**

---

## X-Ray Technician Guide

### Dashboard Overview

The X-Ray Technician Dashboard focuses on image processing:

- **Pending Requests**: View X-ray requests awaiting images
- **Request Queue**: Manage your active requests
- **Request History**: View completed requests
- **Statistics**: View your processing statistics

### Viewing Pending Requests

1. Navigate to **Pending Requests**
2. All pending X-ray requests are displayed
3. Each request shows:
   - Request ID
   - Patient name
   - Requesting doctor
   - Request date
   - Priority (Normal/Urgent)
   - Request notes

### Processing X-Ray Requests

#### Uploading an X-Ray Image

1. Navigate to **Pending Requests**
2. Click on a request
3. Review the request details
4. Click **"Upload X-Ray"**
5. Select the image file from your computer
6. Click **"Upload"**
7. The image will be uploaded
8. AI analysis will automatically begin
9. Results will be displayed when analysis completes

#### Image Requirements

- **Format**: JPEG or PNG only
- **Size**: Maximum 10MB
- **Content**: Chest X-ray images only
- **Quality**: Clear, well-exposed images recommended

#### What Happens After Upload

1. Image is uploaded to the server
2. AI X-ray filter verifies it's a chest X-ray
3. If valid, cardiomegaly detection model analyzes the image
4. Prediction and confidence score are generated
5. Results are saved to the database
6. Specialist doctor is notified
7. You can view the results

#### Handling Non-X-Ray Images

If you upload a non-X-ray image:
- The X-ray filter will reject it
- You'll see a message: "Image is not a chest X-ray"
- Upload a valid chest X-ray image

### Updating Request Status

1. Navigate to a request
2. After image upload and analysis, click **"Update Status"**
3. Select status:
   - **In Progress**: Currently processing
   - **Completed**: Analysis complete
4. Click **"Save"**
5. The specialist doctor will be notified

### Request History

1. Navigate to **Request History**
2. All your processed requests are displayed
3. Each request shows:
   - Request ID
   - Patient name
   - Upload date
   - Status
   - Prediction result

#### Viewing Past Results

1. Navigate to **Request History**
2. Click on a completed request
3. View the image and results

### Statistics

1. Navigate to **Statistics**
2. View your performance metrics:
   - Total requests processed
   - Pending requests
   - Completed requests
   - Average processing time
   - Success rate

### Notifications

X-ray technicians receive notifications for:
- New X-ray requests
- Request priority changes

#### Managing Notifications

1. Click the **notification bell** icon
2. View notification list
3. Click to mark as read

### Profile Management

#### Updating Your Profile

1. Click your **username** in the top right
2. Select **"Profile"**
3. Update your information
4. Click **"Save Changes"**

#### Changing Your Password

1. Click your **username** in the top right
2. Select **"Profile"**
3. Scroll to **"Change Password"**
4. Enter current password
5. Enter new password
6. Confirm new password
7. Click **"Update Password"**

---

## Common Features

### Notifications

All users receive role-specific notifications:

#### Notification Types

- **New Patient Registration**: Reception and General Doctors
- **Patient Referral**: Specialist Doctors
- **X-Ray Request**: X-Ray Technicians
- **X-Ray Result**: Specialist Doctors
- **Edit Request**: Admin and Reception
- **System Alerts**: Admin

#### Managing Notifications

1. Click the **notification bell** icon (top right)
2. View the notification dropdown
3. Unread notifications are highlighted
4. Click a notification to:
   - Mark it as read
   - Navigate to related content
5. Click **"Mark All as Read"** to clear all

### Search Functionality

Most pages include search capabilities:

#### Basic Search

1. Locate the search bar
2. Enter your search term
3. Press Enter or click the search icon
4. Results will appear below

#### Advanced Search

Some pages support advanced filters:
- Date ranges
- Status filters
- Category filters
- Multiple criteria

### Data Export

#### Exporting to CSV

1. Navigate to a data table (e.g., Diagnosis Data)
2. Apply any desired filters
3. Click **"Export CSV"**
4. The file will download to your computer

#### Exporting Images

1. Navigate to Diagnosis Data (Admin only)
2. Select images using checkboxes
3. Click **"Download Selected"**
4. Images will be downloaded as a ZIP file

### Printing

1. Navigate to the page you want to print
2. Click **"Print"** in your browser
3. Adjust print settings if needed
4. Click **"Print"**

---

## Troubleshooting

### Login Issues

#### Problem: Cannot Login

**Possible Causes**:
- Incorrect username or password
- Account is banned
- System is down
- Browser cache issues

**Solutions**:
1. Verify username and password are correct
2. Check if account is banned (contact admin)
3. Try clearing browser cache
4. Try a different browser
5. Contact system administrator

#### Problem: Forgot Password

**Solution**:
1. Click "Forgot Password" on login page
2. Enter your email address
3. Check your email for reset link
4. Click the link and reset your password
5. If no email received, contact admin

### Performance Issues

#### Problem: Slow Page Loading

**Possible Causes**:
- Slow internet connection
- Server overload
- Large data sets
- Browser issues

**Solutions**:
1. Check your internet connection
2. Try refreshing the page
3. Clear browser cache
4. Close other browser tabs
5. Try a different browser

#### Problem: Image Upload Fails

**Possible Causes**:
- File too large (> 10MB)
- Invalid file format (not JPEG/PNG)
- Network issues
- Server issues

**Solutions**:
1. Check file size (must be < 10MB)
2. Check file format (must be JPEG or PNG)
3. Check internet connection
4. Try uploading a smaller file
5. Contact support if issue persists

### Data Issues

#### Problem: Patient Not Found in Search

**Possible Causes**:
- Incorrect search term
- Patient not registered
- Typo in patient information

**Solutions**:
1. Verify search spelling
2. Try different search criteria (ID, phone)
3. Check if patient is registered
4. Contact reception to verify patient information

#### Problem: Edit Request Not Showing

**Possible Causes**:
- Request not submitted
- Request already processed
- Filter applied hiding the request

**Solutions**:
1. Clear all filters
2. Check request status
3. Verify request was submitted
4. Contact admin if needed

### AI Analysis Issues

#### Problem: Analysis Taking Too Long

**Possible Causes**:
- Large image file
- Server load
- Network issues

**Solutions**:
1. Wait up to 30 seconds for analysis
2. Try uploading a smaller image
3. Refresh the page
4. Contact support if issue persists

#### Problem: "Not a Chest X-Ray" Error

**Possible Causes**:
- Image is not a chest X-ray
- Image quality too poor
- Image orientation incorrect

**Solutions**:
1. Verify image is a chest X-ray
2. Ensure image is clear and well-exposed
3. Try uploading a different image
4. Contact support if you believe it's an error

### Browser Issues

#### Problem: Page Not Displaying Correctly

**Possible Causes**:
- Outdated browser
- Browser compatibility issues
- JavaScript disabled

**Solutions**:
1. Update your browser to latest version
2. Enable JavaScript
3. Clear browser cache
4. Try a different browser (Chrome, Firefox, Edge)

#### Problem: Buttons Not Working

**Possible Causes**:
- JavaScript disabled
- Browser extension interference
- Page not fully loaded

**Solutions**:
1. Enable JavaScript
2. Disable browser extensions
3. Refresh the page
4. Try a different browser

---

## FAQ

### General Questions

**Q: What is cardiomegaly?**
A: Cardiomegaly is an enlarged heart. It can be a sign of various heart conditions and is often detected through chest X-rays.

**Q: How accurate is the AI detection?**
A: The AI model has been trained on thousands of medical images and typically achieves high accuracy. However, AI predictions should always be reviewed by medical professionals.

**Q: Can I use the system on mobile devices?**
A: The system is designed for desktop use but can be accessed on tablets. Mobile use is not recommended due to screen size limitations.

**Q: Is my data secure?**
A: Yes, the system uses industry-standard security measures including encryption, secure authentication, and role-based access control.

**Q: How often is the AI model updated?**
A: The AI model is periodically retrained with new data to improve accuracy. Updates are announced by the system administrator.

### User Account Questions

**Q: How do I change my password?**
A: Click your username in the top right, select "Profile", scroll to "Change Password", enter your current and new password, then click "Update Password".

**Q: What if I forget my password?**
A: Click "Forgot Password" on the login page, enter your email, and follow the instructions in the reset email.

**Q: Can I have multiple sessions open?**
A: No, for security reasons, only one session per user is allowed at a time.

**Q: How do I update my profile information?**
A: Click your username, select "Profile", update your information, and click "Save Changes".

### Workflow Questions

**Q: What happens after I register a patient?**
A: The patient is added to the system with a unique ID. General doctors can then view and refer the patient to specialists.

**Q: How long does AI analysis take?**
A: Typically 5-10 seconds after image upload, depending on image size and server load.

**Q: Can I upload multiple X-rays for one patient?**
A: Yes, specialists can create multiple X-ray requests for the same patient if needed.

**Q: What if the AI prediction seems wrong?**
A: AI predictions are for assistance only. Always use your clinical judgment. You can add clinical notes to document your assessment.

**Q: How do I request a patient data correction?**
A: Reception staff can submit edit requests through the patient details page. Admin must approve before changes can be made.

### Technical Questions

**Q: What browsers are supported?**
A: Chrome 90+, Firefox 88+, Edge 90+, and Safari 14+ are supported.

**Q: What image formats can I upload?**
A: Only JPEG and PNG formats are accepted for X-ray images.

**Q: What is the maximum file size for uploads?**
A: The maximum file size is 10MB per image.

**Q: Is there an API available?**
A: Yes, there is a REST API for programmatic access. Contact your system administrator for API documentation.

**Q: How do I report a bug or issue?**
A: Contact your system administrator or use the support contact information provided below.

---

## Support and Contact

### Getting Help

#### For Technical Issues
- **System Administrator**: [admin@yourhospital.com]
- **IT Support**: [support@yourhospital.com]
- **Phone**: [XXX-XXX-XXXX]

#### For Training Requests
- **Training Coordinator**: [training@yourhospital.com]
- **Phone**: [XXX-XXX-XXXX]

#### For Feature Requests
- **Product Manager**: [product@yourhospital.com]
- **Phone**: [XXX-XXX-XXXX]

### System Status

Check the system status page at: [http://status.yourhospital.com]

### Documentation Updates

This manual is updated regularly. Check for the latest version at: [http://docs.yourhospital.com]

### Emergency Contacts

For system emergencies outside business hours:
- **Emergency Support**: [emergency@yourhospital.com]
- **Phone**: [XXX-XXX-XXXX] (24/7)

---

## Appendix

### Glossary

- **Cardiomegaly**: Medical term for an enlarged heart
- **X-Ray**: Medical imaging technique using radiation
- **AI**: Artificial Intelligence
- **Triage**: Process of determining priority of patient treatment
- **Referral**: Process of sending a patient to a specialist
- **DICOM**: Digital Imaging and Communications in Medicine (standard medical image format)

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search | Ctrl + F |
| Logout | Ctrl + L |
| Notifications | Ctrl + N |
| Profile | Ctrl + P |
| Help | F1 |

### System Requirements Summary

**Minimum Requirements**:
- Processor: Intel Core i3 or equivalent
- RAM: 4GB
- Storage: 500MB free space
- Browser: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- Internet: 5 Mbps

**Recommended Requirements**:
- Processor: Intel Core i5 or equivalent
- RAM: 8GB
- Storage: 1GB free space
- Browser: Latest version
- Internet: 10 Mbps

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | May 27, 2026 | Initial release |

---

## Quick Reference Cards

### Admin Quick Reference

```
Key Tasks:
- Create/Edit/Ban Users: User Management
- View Analytics: System Overview
- Review Edit Requests: Edit Requests
- Download Images: Diagnosis Data

Important:
- Change default passwords immediately
- Review edit requests promptly
- Monitor system analytics regularly
```

### Reception Quick Reference

```
Key Tasks:
- Register Patient: Patient Registration
- Search Patient: Patient Search
- Refer Patient: Patient Details → Refer
- Request Edit: Patient Details → Request Edit

Important:
- Verify patient information before registration
- Use unique patient IDs
- Submit edit requests for any corrections
```

### General Doctor Quick Reference

```
Key Tasks:
- View Registered Patients: Registered Patients
- Refer to Specialist: Patient Details → Refer
- View Referral History: Referral History

Important:
- Review patient medical history before referral
- Add referral notes for context
- Monitor referral status
```

### Specialist Doctor Quick Reference

```
Key Tasks:
- View Referred Patients: Referred Patients
- Create X-Ray Request: Patient Details → Create Request
- Review Results: Request History → View Results
- Add Clinical Notes: Results Page → Add Notes

Important:
- AI predictions are for assistance only
- Always use clinical judgment
- Add clinical notes for documentation
```

### X-Ray Technician Quick Reference

```
Key Tasks:
- View Pending Requests: Pending Requests
- Upload X-Ray: Request → Upload X-Ray
- Update Status: Request → Update Status
- View History: Request History

Important:
- Upload only chest X-rays (JPEG/PNG)
- Maximum file size: 10MB
- Verify image quality before upload
```

---

**End of User Manual**

© 2026 Cardiomegaly Detection System. All rights reserved.
