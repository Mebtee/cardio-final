# Cardiomegaly Detection System - Testing Document

## Document Information
- **Project**: Cardiomegaly Detection System
- **Version**: 1.0
- **Date**: May 27, 2026
- **Purpose**: Comprehensive testing guide for quality assurance

## Table of Contents
1. [Test Strategy](#test-strategy)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [System Testing](#system-testing)
6. [User Acceptance Testing](#user-acceptance-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [Test Cases by Module](#test-cases-by-module)
10. [Bug Reporting Template](#bug-reporting-template)

---

## Test Strategy

### Testing Approach
- **Black-box testing**: Focus on functional requirements without examining internal code
- **White-box testing**: Code-level testing for critical components
- **Gray-box testing**: Combination with partial knowledge of system internals
- **Agile testing**: Continuous testing throughout development cycle

### Testing Levels
1. **Unit Testing**: Individual component testing
2. **Integration Testing**: Module interaction testing
3. **System Testing**: Complete system testing
4. **Acceptance Testing**: User requirement validation

### Test Types
- Functional Testing
- Usability Testing
- Performance Testing
- Security Testing
- Compatibility Testing
- Regression Testing

---

## Test Environment Setup

### Prerequisites
```bash
# Frontend Requirements
- Node.js 18.x or higher
- npm 9.x or higher
- Modern web browser (Chrome, Firefox, Edge)

# Backend Requirements
- Python 3.8 or higher
- pip package manager
- XAMPP (for MySQL)
- Virtual environment (venv)

# ML Model Requirements
- PyTorch 2.x
- CUDA (optional, for GPU acceleration)
```

### Installation Steps

#### Backend Setup
```bash
# Navigate to flask_backend directory
cd flask_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start XAMPP MySQL server
# Open phpMyAdmin and import heartsight_ai_startup.sql

# Configure .env file
cp .env.example .env
# Edit .env with your database credentials

# Run Flask server
python app.py
```

#### Frontend Setup
```bash
# Navigate to project root
cd heart-sight-ai-check

# Install dependencies
npm install

# Start development server
npm run dev
```

### Test Data Setup
```bash
# Import sample data
cd flask_backend
mysql -u root -p cardiomegaly_detection < insert_sample_data.sql
```

---

## Unit Testing

### Backend Unit Tests

#### Test: Database Connection
```python
# File: test_db.py
# Purpose: Verify database connectivity
# Status: ✅ Implemented

Test Cases:
1. Test successful database connection
2. Test connection with invalid credentials
3. Test connection timeout handling
4. Test connection pool management
```

#### Test: Authentication
```python
# File: test_login.py
# Purpose: Verify user authentication
# Status: ✅ Implemented

Test Cases:
1. Test login with valid credentials
2. Test login with invalid username
3. Test login with invalid password
4. Test login with banned user
5. Test session creation
6. Test session validation
7. Test password hashing
8. Test logout functionality
```

#### Test: User Management
```python
# File: test_ban_workflow.py
# Purpose: Verify user ban/unban functionality
# Status: ✅ Implemented

Test Cases:
1. Test admin can ban user
2. Test banned user cannot login
3. Test admin can unban user
4. Test unbanned user can login
5. Test ban notification sent
6. Test ban history tracking
```

#### Test: Patient Edit Workflow
```python
# File: test_patient_edit_workflow.py
# Purpose: Verify patient edit request workflow
# Status: ✅ Implemented

Test Cases:
1. Test reception can request edit
2. Test admin receives edit request
3. Test admin can approve edit request
4. Test admin can reject edit request
5. Test reception can submit changes after approval
6. Test admin final approval
7. Test edit request status transitions
```

#### Test: Session Management
```python
# File: test_session_invalidation.py
# Purpose: Verify session invalidation
# Status: ✅ Implemented

Test Cases:
1. Test session expires after timeout
2. Test session invalidates on logout
3. Test session invalidates on password change
4. Test session invalidates on ban
5. Test concurrent session handling
```

#### Test: View Details
```python
# File: test_view_details.py
# Purpose: Verify data viewing permissions
# Status: ✅ Implemented

Test Cases:
1. Test admin can view all users
2. Test doctor can view assigned patients
3. Test technician can view assigned requests
4. Test reception can view registered patients
5. Test unauthorized access blocked
6. Test data filtering by role
```

### Frontend Unit Tests

#### Test: Component Rendering
```typescript
// Test Cases:
1. Test AuthForm component renders correctly
2. Test ImageUploader component handles file selection
3. Test ResultDisplay component shows predictions
4. Test NotificationBell component updates count
5. Test all shadcn-ui components render
```

#### Test: Form Validation
```typescript
// Test Cases:
1. Test login form validates required fields
2. Test patient registration form validates email
3. Test patient registration form validates phone
4. Test X-ray request form validates notes
5. Test password reset form validates email
```

#### Test: API Integration
```typescript
// Test Cases:
1. Test login API call
2. Test patient registration API call
3. Test X-ray upload API call
4. Test prediction retrieval API call
5. Test error handling for failed API calls
```

---

## Integration Testing

### Module Integration Tests

#### Test: Frontend-Backend Integration
```
Test ID: IT-001
Description: Verify React frontend communicates with Flask backend

Preconditions:
- Backend server running on localhost:5000
- Frontend server running on localhost:5173
- Database initialized with test data

Test Steps:
1. Open browser to http://localhost:5173
2. Navigate to login page
3. Enter valid credentials (admin/admin123)
4. Click login button
5. Verify redirect to admin dashboard
6. Verify dashboard loads user data

Expected Result:
- User successfully logged in
- Dashboard displays correct user information
- No console errors

Actual Result: ___________
Status: Pass/Fail
```

#### Test: Backend-Database Integration
```
Test ID: IT-002
Description: Verify Flask backend communicates with MySQL database

Preconditions:
- MySQL server running
- Database cardiomegaly_detection created
- Backend server running

Test Steps:
1. Send POST request to /login with valid credentials
2. Verify response contains session token
3. Send GET request to /api/users with session token
4. Verify response contains user list
5. Create new user via API
6. Query database directly to verify user creation

Expected Result:
- All API calls succeed
- Database contains expected data
- Data consistency maintained

Actual Result: ___________
Status: Pass/Fail
```

#### Test: ML Model Integration
```
Test ID: IT-003
Description: Verify ML models load and process images correctly

Preconditions:
- Model files present in flask_backend/
- Backend server running
- Test X-ray image available

Test Steps:
1. Upload valid chest X-ray image
2. Verify X-ray filter model processes image
3. Verify cardiomegaly model processes image
4. Verify prediction returned with confidence score
5. Upload non-X-ray image
6. Verify rejection by X-ray filter

Expected Result:
- Valid X-rays processed through both stages
- Non-X-rays rejected at filter stage
- Confidence scores between 0-1
- Predictions match expected classes

Actual Result: ___________
Status: Pass/Fail
```

#### Test: Email System Integration
```
Test ID: IT-004
Description: Verify password reset email functionality

Preconditions:
- Email service configured
- Test email account available

Test Steps:
1. Navigate to forgot password page
2. Enter registered email address
3. Submit request
4. Check email inbox for reset link
5. Click reset link
6. Enter new password
7. Verify password updated

Expected Result:
- Email received within 2 minutes
- Reset link valid and working
- Password successfully updated
- Can login with new password

Actual Result: ___________
Status: Pass/Fail
```

---

## System Testing

### Functional Testing by Role

#### Admin Dashboard Testing

```
Test Suite: Admin Functionality
Test ID: ST-ADM-001 to ST-ADM-020

ST-ADM-001: Admin Login
Description: Verify admin can login with valid credentials
Preconditions: Admin user exists in database
Steps:
1. Navigate to login page
2. Enter username: admin
3. Enter password: admin123
4. Click login button
Expected: Redirect to admin dashboard
Priority: High

ST-ADM-002: View System Overview
Description: Verify admin can view system analytics
Preconditions: Admin logged in
Steps:
1. Click on System Overview tab
2. Verify charts display
3. Verify statistics load
Expected: All charts and statistics visible
Priority: High

ST-ADM-003: User Management - Create User
Description: Verify admin can create new users
Preconditions: Admin logged in
Steps:
1. Navigate to User Management
2. Click "Add New User"
3. Fill user details
4. Select role
5. Submit form
Expected: User created successfully
Priority: High

ST-ADM-004: User Management - Edit User
Description: Verify admin can edit existing users
Preconditions: Admin logged in, user exists
Steps:
1. Navigate to User Management
2. Click edit on user
3. Modify user details
4. Submit form
Expected: User updated successfully
Priority: High

ST-ADM-005: User Management - Ban User
Description: Verify admin can ban users
Preconditions: Admin logged in, user exists
Steps:
1. Navigate to User Management
2. Click ban on user
3. Confirm ban action
Expected: User banned, cannot login
Priority: High

ST-ADM-006: User Management - Unban User
Description: Verify admin can unban users
Preconditions: Admin logged in, banned user exists
Steps:
1. Navigate to User Management
2. Click unban on banned user
3. Confirm unban action
Expected: User unbanned, can login
Priority: High

ST-ADM-007: View Diagnosis Data
Description: Verify admin can view all diagnosis data
Preconditions: Admin logged in, predictions exist
Steps:
1. Navigate to Diagnosis Data
2. Apply filters
3. View results
Expected: All predictions displayed with filters
Priority: High

ST-ADM-008: Download Diagnosis Images
Description: Verify admin can download X-ray images
Preconditions: Admin logged in, predictions exist
Steps:
1. Navigate to Diagnosis Data
2. Select predictions
3. Click download
Expected: Images downloaded successfully
Priority: Medium

ST-ADM-009: Review Edit Requests
Description: Verify admin can view patient edit requests
Preconditions: Admin logged in, edit requests exist
Steps:
1. Navigate to Edit Requests
2. View pending requests
Expected: All pending requests displayed
Priority: High

ST-ADM-010: Approve Edit Request
Description: Verify admin can approve edit requests
Preconditions: Admin logged in, pending request exists
Steps:
1. Navigate to Edit Requests
2. Click approve on request
3. Add review notes
4. Confirm approval
Expected: Request approved, status updated
Priority: High

ST-ADM-011: Reject Edit Request
Description: Verify admin can reject edit requests
Preconditions: Admin logged in, pending request exists
Steps:
1. Navigate to Edit Requests
2. Click reject on request
3. Add review notes
4. Confirm rejection
Expected: Request rejected, status updated
Priority: High

ST-ADM-012: Reset Default Users
Description: Verify admin can reset default users
Preconditions: Admin logged in
Steps:
1. Navigate to Settings
2. Click Reset Default Users
3. Confirm action
Expected: Default users reset to initial state
Priority: Low

ST-ADM-013: View Notifications
Description: Verify admin receives notifications
Preconditions: Admin logged in
Steps:
1. Check notification bell
2. View notification list
Expected: Notifications displayed correctly
Priority: Medium

ST-ADM-014: Mark Notification as Read
Description: Verify admin can mark notifications as read
Preconditions: Admin logged in, unread notifications exist
Steps:
1. Click notification bell
2. Click on notification
3. Verify marked as read
Expected: Notification marked as read
Priority: Medium

ST-ADM-015: Filter Users by Role
Description: Verify admin can filter users by role
Preconditions: Admin logged in
Steps:
1. Navigate to User Management
2. Select role filter
3. Apply filter
Expected: Only users of selected role displayed
Priority: Medium

ST-ADM-016: Search Users
Description: Verify admin can search users
Preconditions: Admin logged in
Steps:
1. Navigate to User Management
2. Enter search term
3. Submit search
Expected: Matching users displayed
Priority: Medium

ST-ADM-017: View User Details
Description: Verify admin can view detailed user information
Preconditions: Admin logged in, user exists
Steps:
1. Navigate to User Management
2. Click on user
Expected: User details displayed
Priority: Medium

ST-ADM-018: Delete User
Description: Verify admin can delete users
Preconditions: Admin logged in, user exists
Steps:
1. Navigate to User Management
2. Click delete on user
3. Confirm deletion
Expected: User deleted from system
Priority: Low

ST-ADM-019: View System Logs
Description: Verify admin can view system activity logs
Preconditions: Admin logged in
Steps:
1. Navigate to System Logs
2. View log entries
Expected: Recent system activities displayed
Priority: Low

ST-ADM-020: Export Analytics Report
Description: Verify admin can export analytics data
Preconditions: Admin logged in
Steps:
1. Navigate to System Overview
2. Click export button
3. Select format
4. Download report
Expected: Report downloaded successfully
Priority: Medium
```

#### Reception Dashboard Testing

```
Test Suite: Reception Functionality
Test ID: ST-REC-001 to ST-REC-015

ST-REC-001: Reception Login
Description: Verify reception can login
Preconditions: Reception user exists
Steps:
1. Navigate to login page
2. Enter reception credentials
3. Click login
Expected: Redirect to reception dashboard
Priority: High

ST-REC-002: Register New Patient
Description: Verify reception can register patients
Preconditions: Reception logged in
Steps:
1. Navigate to Patient Registration
2. Fill patient details
3. Submit form
Expected: Patient registered, ID generated
Priority: High

ST-REC-003: Auto-generate Patient ID
Description: Verify patient ID auto-generated
Preconditions: Reception logged in
Steps:
1. Register new patient
2. Verify patient ID format
Expected: Unique patient ID generated (PAT-XXXXX)
Priority: High

ST-REC-004: Search Patient by Name
Description: Verify patient search by name works
Preconditions: Reception logged in, patients exist
Steps:
1. Navigate to Patient Search
2. Enter patient name
3. Submit search
Expected: Matching patients displayed
Priority: High

ST-REC-005: Search Patient by ID
Description: Verify patient search by ID works
Preconditions: Reception logged in, patients exist
Steps:
1. Navigate to Patient Search
2. Enter patient ID
3. Submit search
Expected: Patient displayed if found
Priority: High

ST-REC-006: Search Patient by Phone
Description: Verify patient search by phone works
Preconditions: Reception logged in, patients exist
Steps:
1. Navigate to Patient Search
2. Enter phone number
3. Submit search
Expected: Matching patients displayed
Priority: High

ST-REC-007: View Patient Details
Description: Verify reception can view patient details
Preconditions: Reception logged in, patient exists
Steps:
1. Search for patient
2. Click on patient
Expected: Patient details displayed
Priority: High

ST-REC-008: Request Patient Edit
Description: Verify reception can request patient data edits
Preconditions: Reception logged in, patient exists
Steps:
1. Navigate to patient details
2. Click Request Edit
3. Fill edit request form
4. Submit request
Expected: Edit request created, pending approval
Priority: High

ST-REC-009: View Edit Request Status
Description: Verify reception can view edit request status
Preconditions: Reception logged in, edit request exists
Steps:
1. Navigate to Edit Requests
2. View request status
Expected: Current status displayed
Priority: High

ST-REC-010: Submit Patient Changes
Description: Verify reception can submit changes after approval
Preconditions: Reception logged in, approved request exists
Steps:
1. Navigate to approved request
2. Enter proposed changes
3. Submit changes
Expected: Changes submitted for final approval
Priority: High

ST-REC-011: View Registered Patients List
Description: Verify reception can view all registered patients
Preconditions: Reception logged in
Steps:
1. Navigate to Patients List
Expected: All registered patients displayed
Priority: Medium

ST-REC-012: Filter Patients by Date
Description: Verify reception can filter patients by registration date
Preconditions: Reception logged in
Steps:
1. Navigate to Patients List
2. Select date range
3. Apply filter
Expected: Patients in date range displayed
Priority: Medium

ST-REC-013: Refer Patient to Doctor
Description: Verify reception can refer patients
Preconditions: Reception logged in, patient exists
Steps:
1. Navigate to patient details
2. Click Refer
3. Select doctor
4. Submit referral
Expected: Patient referred, doctor notified
Priority: High

ST-REC-014: View Notifications
Description: Verify reception receives notifications
Preconditions: Reception logged in
Steps:
1. Check notification bell
Expected: Notifications displayed
Priority: Medium

ST-REC-015: Update Profile
Description: Verify reception can update own profile
Preconditions: Reception logged in
Steps:
1. Navigate to Profile
2. Update information
3. Submit changes
Expected: Profile updated successfully
Priority: Low
```

#### General Doctor Dashboard Testing

```
Test Suite: General Doctor Functionality
Test ID: ST-GDOC-001 to ST-GDOC-012

ST-GDOC-001: General Doctor Login
Description: Verify general doctor can login
Preconditions: General doctor user exists
Steps:
1. Navigate to login page
2. Enter general doctor credentials
3. Click login
Expected: Redirect to general doctor dashboard
Priority: High

ST-GDOC-002: View Registered Patients
Description: Verify general doctor can view registered patients
Preconditions: General doctor logged in
Steps:
1. Navigate to Registered Patients
Expected: Patients with status 'registered' displayed
Priority: High

ST-GDOC-003: Filter Patients by Status
Description: Verify general doctor can filter patients by status
Preconditions: General doctor logged in
Steps:
1. Navigate to Registered Patients
2. Select status filter
3. Apply filter
Expected: Patients with selected status displayed
Priority: High

ST-GDOC-004: Filter Patients by Date
Description: Verify general doctor can filter by registration date
Preconditions: General doctor logged in
Steps:
1. Navigate to Registered Patients
2. Select date range
3. Apply filter
Expected: Patients in date range displayed
Priority: Medium

ST-GDOC-005: Refer Patient to Specialist
Description: Verify general doctor can refer patients
Preconditions: General doctor logged in, patient exists
Steps:
1. Select patient
2. Click Refer to Specialist
3. Select specialist doctor
4. Submit referral
Expected: Patient status updated to 'referred'
Priority: High

ST-GDOC-006: View Specialist List
Description: Verify general doctor can view available specialists
Preconditions: General doctor logged in
Steps:
1. Navigate to referral dialog
Expected: List of specialist doctors displayed
Priority: High

ST-GDOC-007: View Patient Details
Description: Verify general doctor can view patient details
Preconditions: General doctor logged in, patient exists
Steps:
1. Click on patient
Expected: Patient information displayed
Priority: High

ST-GDOC-008: View Medical History
Description: Verify general doctor can view patient medical history
Preconditions: General doctor logged in, patient exists
Steps:
1. Navigate to patient details
2. View medical history section
Expected: Medical history displayed
Priority: Medium

ST-GDOC-009: Receive New Registration Notifications
Description: Verify general doctor notified of new registrations
Preconditions: General doctor logged in, new patient registered
Steps:
1. Check notification bell
Expected: Notification about new registration
Priority: High

ST-GDOC-010: View Referral History
Description: Verify general doctor can view referral history
Preconditions: General doctor logged in
Steps:
1. Navigate to Referral History
Expected: List of past referrals displayed
Priority: Medium

ST-GDOC-011: Search Patients
Description: Verify general doctor can search patients
Preconditions: General doctor logged in
Steps:
1. Enter search term
2. Submit search
Expected: Matching patients displayed
Priority: Medium

ST-GDOC-012: Update Profile
Description: Verify general doctor can update own profile
Preconditions: General doctor logged in
Steps:
1. Navigate to Profile
2. Update information
3. Submit changes
Expected: Profile updated successfully
Priority: Low
```

#### Specialist Doctor Dashboard Testing

```
Test Suite: Specialist Doctor Functionality
Test ID: ST-SDOC-001 to ST-SDOC-015

ST-SDOC-001: Specialist Doctor Login
Description: Verify specialist doctor can login
Preconditions: Specialist doctor user exists
Steps:
1. Navigate to login page
2. Enter specialist doctor credentials
3. Click login
Expected: Redirect to specialist doctor dashboard
Priority: High

ST-SDOC-002: View Referred Patients
Description: Verify specialist doctor can view referred patients
Preconditions: Specialist doctor logged in
Steps:
1. Navigate to Referred Patients
Expected: Patients referred to this doctor displayed
Priority: High

ST-SDOC-003: Create X-Ray Request
Description: Verify specialist doctor can create X-ray requests
Preconditions: Specialist doctor logged in, patient exists
Steps:
1. Select patient
2. Click Create X-Ray Request
3. Add request notes
4. Submit request
Expected: X-ray request created, technician notified
Priority: High

ST-SDOC-004: View X-Ray Request History
Description: Verify specialist doctor can view request history
Preconditions: Specialist doctor logged in
Steps:
1. Navigate to Request History
Expected: All X-ray requests displayed with status
Priority: High

ST-SDOC-005: Review X-Ray Results
Description: Verify specialist doctor can view AI predictions
Preconditions: Specialist doctor logged in, completed request exists
Steps:
1. Navigate to request
2. View results section
Expected: Prediction and confidence score displayed
Priority: High

ST-SDOC-006: View X-Ray Image
Description: Verify specialist doctor can view uploaded X-ray
Preconditions: Specialist doctor logged in, completed request exists
Steps:
1. Navigate to request
2. Click on image
Expected: X-ray image displayed
Priority: High

ST-SDOC-007: Receive Referral Notifications
Description: Verify specialist doctor notified of referrals
Preconditions: Specialist doctor logged in, patient referred
Steps:
1. Check notification bell
Expected: Notification about new referral
Priority: High

ST-SDOC-008: Receive Result Notifications
Description: Verify specialist doctor notified of results
Preconditions: Specialist doctor logged in, X-ray completed
Steps:
1. Check notification bell
Expected: Notification about X-ray result
Priority: High

ST-SDOC-009: Filter Requests by Status
Description: Verify specialist doctor can filter requests by status
Preconditions: Specialist doctor logged in
Steps:
1. Navigate to Request History
2. Select status filter
3. Apply filter
Expected: Requests with selected status displayed
Priority: Medium

ST-SDOC-010: Filter Requests by Date
Description: Verify specialist doctor can filter by date
Preconditions: Specialist doctor logged in
Steps:
1. Navigate to Request History
2. Select date range
3. Apply filter
Expected: Requests in date range displayed
Priority: Medium

ST-SDOC-011: View Request Statistics
Description: Verify specialist doctor can view statistics
Preconditions: Specialist doctor logged in
Steps:
1. Navigate to Statistics
Expected: Request counts and success rates displayed
Priority: Medium

ST-SDOC-012: Add Notes to Request
Description: Verify specialist doctor can add notes to requests
Preconditions: Specialist doctor logged in, request exists
Steps:
1. Navigate to request
2. Add clinical notes
3. Save notes
Expected: Notes saved successfully
Priority: Medium

ST-SDOC-013: View Patient Medical History
Description: Verify specialist doctor can view patient history
Preconditions: Specialist doctor logged in, patient exists
Steps:
1. Navigate to patient details
2. View medical history
Expected: Complete medical history displayed
Priority: Medium

ST-SDOC-014: Download X-Ray Image
Description: Verify specialist doctor can download X-ray
Preconditions: Specialist doctor logged in, completed request exists
Steps:
1. Navigate to request
2. Click download image
Expected: Image downloaded successfully
Priority: Low

ST-SDOC-015: Update Profile
Description: Verify specialist doctor can update own profile
Preconditions: Specialist doctor logged in
Steps:
1. Navigate to Profile
2. Update information
3. Submit changes
Expected: Profile updated successfully
Priority: Low
```

#### X-Ray Technician Dashboard Testing

```
Test Suite: X-Ray Technician Functionality
Test ID: ST-TECH-001 to ST-TECH-012

ST-TECH-001: Technician Login
Description: Verify technician can login
Preconditions: Technician user exists
Steps:
1. Navigate to login page
2. Enter technician credentials
3. Click login
Expected: Redirect to technician dashboard
Priority: High

ST-TECH-002: View Pending Requests
Description: Verify technician can view pending X-ray requests
Preconditions: Technician logged in
Steps:
1. Navigate to Pending Requests
Expected: All pending requests displayed
Priority: High

ST-TECH-003: View Request Details
Description: Verify technician can view request details
Preconditions: Technician logged in, request exists
Steps:
1. Click on request
Expected: Patient and request information displayed
Priority: High

ST-TECH-004: Upload X-Ray Image
Description: Verify technician can upload X-ray images
Preconditions: Technician logged in, request exists
Steps:
1. Navigate to request
2. Click Upload Image
3. Select JPEG/PNG file
4. Submit upload
Expected: Image uploaded, AI analysis triggered
Priority: High

ST-TECH-005: Upload Invalid File Type
Description: Verify system rejects invalid file types
Preconditions: Technician logged in, request exists
Steps:
1. Navigate to request
2. Try to upload non-image file
Expected: Upload rejected with error message
Priority: High

ST-TECH-006: View AI Prediction Results
Description: Verify technician can view AI analysis results
Preconditions: Technician logged in, image uploaded
Steps:
1. Navigate to request
2. View results section
Expected: Prediction and confidence displayed
Priority: High

ST-TECH-007: Update Request Status
Description: Verify technician can update request status
Preconditions: Technician logged in, request exists
Steps:
1. Navigate to request
2. Update status to completed
3. Submit
Expected: Status updated, doctor notified
Priority: High

ST-TECH-008: Receive New Request Notifications
Description: Verify technician notified of new requests
Preconditions: Technician logged in, new request created
Steps:
1. Check notification bell
Expected: Notification about new request
Priority: High

ST-TECH-009: View Request Statistics
Description: Verify technician can view statistics
Preconditions: Technician logged in
Steps:
1. Navigate to Statistics
Expected: Pending/completed counts displayed
Priority: Medium

ST-TECH-010: Filter Requests by Status
Description: Verify technician can filter requests by status
Preconditions: Technician logged in
Steps:
1. Navigate to Requests
2. Select status filter
3. Apply filter
Expected: Requests with selected status displayed
Priority: Medium

ST-TECH-011: View Request History
Description: Verify technician can view completed requests
Preconditions: Technician logged in
Steps:
1. Navigate to Request History
Expected: All completed requests displayed
Priority: Medium

ST-TECH-012: Update Profile
Description: Verify technician can update own profile
Preconditions: Technician logged in
Steps:
1. Navigate to Profile
2. Update information
3. Submit changes
Expected: Profile updated successfully
Priority: Low
```

---

## User Acceptance Testing

### UAT Test Scenarios

#### Scenario 1: Complete Patient Workflow
```
UAT-001: End-to-End Patient Journey
Actors: Reception, General Doctor, Specialist Doctor, X-Ray Technician

Preconditions:
- System fully operational
- All users logged in

Steps:
1. Reception registers new patient (John Doe)
2. General Doctor views registered patients
3. General Doctor refers John to Specialist Doctor
4. Specialist Doctor receives notification
5. Specialist Doctor creates X-ray request
6. X-Ray Technician receives notification
7. X-Ray Technician uploads chest X-ray
8. AI analyzes image for cardiomegaly
9. Specialist Doctor reviews results
10. Admin monitors system analytics

Expected Results:
- Patient ID auto-generated
- Referral notification sent
- X-ray request created
- Image uploaded successfully
- AI prediction returned with confidence
- Results visible to specialist
- All data tracked in system

Acceptance Criteria:
- ✅ Patient registered within 2 minutes
- ✅ Referral notification received within 1 minute
- ✅ X-ray request created within 1 minute
- ✅ Image upload completes within 30 seconds
- ✅ AI analysis completes within 10 seconds
- ✅ Results visible to specialist immediately
- ✅ All steps logged in system

Status: ___________
Tester: ___________
Date: ___________
```

#### Scenario 2: Patient Data Edit Workflow
```
UAT-002: Patient Data Correction Process
Actors: Reception, Admin

Preconditions:
- Patient with incorrect data exists
- Reception and Admin logged in

Steps:
1. Reception identifies incorrect patient data
2. Reception submits edit request with reason
3. Admin receives notification
4. Admin reviews original vs proposed changes
5. Admin approves edit request
6. Reception receives approval notification
7. Reception submits corrected data
8. Admin reviews and gives final approval
9. Patient data updated in system

Expected Results:
- Edit request created with proper documentation
- Admin can compare original vs proposed
- Approval workflow enforced
- Changes only applied after final approval
- Audit trail maintained

Acceptance Criteria:
- ✅ Edit request created within 1 minute
- ✅ Admin notification received within 1 minute
- ✅ Approval/rejection decision recorded
- ✅ Reception notified of decision within 1 minute
- ✅ Changes applied only after final approval
- ✅ Complete audit trail available

Status: ___________
Tester: ___________
Date: ___________
```

#### Scenario 3: User Management Workflow
```
UAT-003: User Lifecycle Management
Actors: Admin

Preconditions:
- Admin logged in

Steps:
1. Admin creates new doctor user
2. Admin assigns role and specialty
3. New user can login
4. Admin edits user details
5. Admin bans user for policy violation
6. Banned user cannot login
7. Admin unbans user
8. User can login again
9. Admin deletes user

Expected Results:
- User created with correct permissions
- Role-based access control enforced
- Ban prevents login
- Unban restores access
- Delete removes user from system

Acceptance Criteria:
- ✅ User created within 1 minute
- ✅ Role-based permissions enforced
- ✅ Ban prevents login immediately
- ✅ Unban restores access immediately
- ✅ Delete removes all user data
- ✅ All actions logged

Status: ___________
Tester: ___________
Date: ___________
```

---

## Performance Testing

### Load Testing

#### Test: Concurrent User Load
```
Test ID: PT-001
Description: System performance under concurrent user load

Test Configuration:
- Virtual users: 50, 100, 200
- Test duration: 10 minutes per load level
- Tool: Apache JMeter or k6

Test Scenarios:
1. 50 concurrent users - Normal load
2. 100 concurrent users - High load
3. 200 concurrent users - Stress test

Metrics to Measure:
- Response time (average, 95th percentile)
- Throughput (requests per second)
- Error rate
- CPU utilization
- Memory usage
- Database connection pool usage

Acceptance Criteria:
- 50 users: < 2s response time, < 1% error rate
- 100 users: < 3s response time, < 2% error rate
- 200 users: < 5s response time, < 5% error rate

Results:
50 users: ___________
100 users: ___________
200 users: ___________
Status: Pass/Fail
```

#### Test: Image Upload Performance
```
Test ID: PT-002
Description: Image upload and processing performance

Test Configuration:
- Image sizes: 1MB, 5MB, 10MB
- Concurrent uploads: 5, 10, 20
- Test duration: 5 minutes per configuration

Metrics to Measure:
- Upload time
- AI processing time
- Total end-to-end time
- Database write time

Acceptance Criteria:
- 1MB image: < 5s total
- 5MB image: < 10s total
- 10MB image: < 20s total

Results:
1MB: ___________
5MB: ___________
10MB: ___________
Status: Pass/Fail
```

### Stress Testing

#### Test: Database Connection Pool
```
Test ID: PT-003
Description: Database connection pool under stress

Test Configuration:
- Rapid consecutive requests
- Connection pool size: 10, 20, 50
- Test duration: 5 minutes

Metrics to Measure:
- Connection wait time
- Connection timeout errors
- Active connection count
- Idle connection count

Acceptance Criteria:
- No connection timeouts
- Wait time < 100ms
- Pool utilization < 80%

Results: ___________
Status: Pass/Fail
```

---

## Security Testing

### Authentication Security

#### Test: Password Security
```
Test ID: SEC-001
Description: Verify password security measures

Test Cases:
1. Password minimum length (8 characters)
2. Password complexity requirements
3. Password hashing with bcrypt
4. Password change requires current password
5. Password reset token expiration
6. Password reset token single-use

Expected Results:
- Weak passwords rejected
- Passwords properly hashed
- Reset tokens expire after 1 hour
- Reset tokens invalidated after use

Status: Pass/Fail
```

#### Test: Session Security
```
Test ID: SEC-002
Description: Verify session security measures

Test Cases:
1. Session token generation
2. Session expiration after timeout
3. Session invalidation on logout
4. Session invalidation on password change
5. Session invalidation on user ban
6. Concurrent session handling

Expected Results:
- Secure session tokens generated
- Sessions expire after inactivity
- Sessions invalidated on security events
- Only one active session per user

Status: Pass/Fail
```

### Authorization Security

#### Test: Role-Based Access Control
```
Test ID: SEC-003
Description: Verify role-based access control

Test Cases:
1. Reception cannot access admin functions
2. General doctor cannot access technician functions
3. Technician cannot access doctor functions
4. Admin can access all functions
5. API endpoints enforce role checks
6. Direct URL access blocked for unauthorized users

Expected Results:
- Each role can only access permitted functions
- API returns 403 for unauthorized access
- Direct URL access redirected to login

Status: Pass/Fail
```

### Data Security

#### Test: SQL Injection Prevention
```
Test ID: SEC-004
Description: Verify SQL injection protection

Test Cases:
1. SQL injection in login form
2. SQL injection in search fields
3. SQL injection in data entry forms
4. SQL injection in API parameters

Test Payloads:
- ' OR '1'='1
- ' DROP TABLE users--
- ' UNION SELECT * FROM users--
- ; DELETE FROM users--

Expected Results:
- All injection attempts blocked
- No database errors exposed
- Input sanitization working

Status: Pass/Fail
```

#### Test: XSS Prevention
```
Test ID: SEC-005
Description: Verify XSS protection

Test Cases:
1. XSS in patient name field
2. XSS in request notes
3. XSS in search fields
4. XSS in file upload names

Test Payloads:
- <script>alert('XSS')</script>
- <img src=x onerror=alert('XSS')>
- javascript:alert('XSS')

Expected Results:
- Scripts not executed
- Input properly escaped
- Output sanitized

Status: Pass/Fail
```

#### Test: File Upload Security
```
Test ID: SEC-006
Description: Verify file upload security

Test Cases:
1. Upload executable file (.exe)
2. Upload script file (.php, .js)
3. Upload file with malicious extension
4. Upload file exceeding size limit
5. Upload file with path traversal

Expected Results:
- Only JPEG/PNG allowed
- File size limit enforced (10MB)
- Malicious files rejected
- Path traversal blocked

Status: Pass/Fail
```

---

## Test Cases by Module

### Authentication Module

```
TC-AUTH-001: Valid Login
Description: User can login with valid credentials
Priority: P0 (Critical)
Preconditions: User exists in database
Test Steps:
1. Navigate to login page
2. Enter valid username
3. Enter valid password
4. Click login button
Expected Result: User redirected to appropriate dashboard
Actual Result: ___________
Status: Pass/Fail

TC-AUTH-002: Invalid Username
Description: Login fails with invalid username
Priority: P0 (Critical)
Preconditions: None
Test Steps:
1. Navigate to login page
2. Enter invalid username
3. Enter any password
4. Click login button
Expected Result: Error message "Invalid credentials"
Actual Result: ___________
Status: Pass/Fail

TC-AUTH-003: Invalid Password
Description: Login fails with invalid password
Priority: P0 (Critical)
Preconditions: User exists
Test Steps:
1. Navigate to login page
2. Enter valid username
3. Enter invalid password
4. Click login button
Expected Result: Error message "Invalid credentials"
Actual Result: ___________
Status: Pass/Fail

TC-AUTH-004: Empty Fields
Description: Login fails with empty fields
Priority: P1 (High)
Preconditions: None
Test Steps:
1. Navigate to login page
2. Leave username empty
3. Leave password empty
4. Click login button
Expected Result: Validation error for empty fields
Actual Result: ___________
Status: Pass/Fail

TC-AUTH-005: Banned User Login
Description: Banned user cannot login
Priority: P0 (Critical)
Preconditions: Banned user exists
Test Steps:
1. Navigate to login page
2. Enter banned username
3. Enter valid password
4. Click login button
Expected Result: Error message "Account is banned"
Actual Result: ___________
Status: Pass/Fail

TC-AUTH-006: Logout
Description: User can logout successfully
Priority: P1 (High)
Preconditions: User logged in
Test Steps:
1. Click logout button
2. Confirm logout
Expected Result: Redirected to login page, session invalidated
Actual Result: ___________
Status: Pass/Fail

TC-AUTH-007: Password Reset Request
Description: User can request password reset
Priority: P1 (High)
Preconditions: User exists
Test Steps:
1. Navigate to forgot password page
2. Enter registered email
3. Submit request
Expected Result: Success message, email sent
Actual Result: ___________
Status: Pass/Fail

TC-AUTH-008: Password Reset with Invalid Email
Description: Reset fails with unregistered email
Priority: P2 (Medium)
Preconditions: None
Test Steps:
1. Navigate to forgot password page
2. Enter unregistered email
3. Submit request
Expected Result: Error message "Email not found"
Actual Result: ___________
Status: Pass/Fail

TC-AUTH-009: Password Reset Token Expiration
Description: Reset token expires after time limit
Priority: P1 (High)
Preconditions: Reset token generated
Test Steps:
1. Wait for token to expire (1 hour)
2. Click reset link
Expected Result: Error message "Token expired"
Actual Result: ___________
Status: Pass/Fail

TC-AUTH-010: Password Change
Description: User can change password
Priority: P1 (High)
Preconditions: User logged in
Test Steps:
1. Navigate to profile
2. Enter current password
3. Enter new password
4. Confirm new password
5. Submit
Expected Result: Password updated, logged out
Actual Result: ___________
Status: Pass/Fail
```

### Patient Management Module

```
TC-PAT-001: Register Patient
Description: Reception can register new patient
Priority: P0 (Critical)
Preconditions: Reception logged in
Test Steps:
1. Navigate to patient registration
2. Fill all required fields
3. Submit form
Expected Result: Patient registered, unique ID generated
Actual Result: ___________
Status: Pass/Fail

TC-PAT-002: Patient Validation - Missing Required Fields
Description: Registration fails with missing required fields
Priority: P1 (High)
Preconditions: Reception logged in
Test Steps:
1. Navigate to patient registration
2. Leave required fields empty
3. Submit form
Expected Result: Validation errors for missing fields
Actual Result: ___________
Status: Pass/Fail

TC-PAT-003: Patient Validation - Invalid Email
Description: Registration fails with invalid email
Priority: P1 (High)
Preconditions: Reception logged in
Test Steps:
1. Navigate to patient registration
2. Enter invalid email format
3. Submit form
Expected Result: Validation error for email format
Actual Result: ___________
Status: Pass/Fail

TC-PAT-004: Patient Validation - Invalid Phone
Description: Registration fails with invalid phone
Priority: P1 (High)
Preconditions: Reception logged in
Test Steps:
1. Navigate to patient registration
2. Enter invalid phone format
3. Submit form
Expected Result: Validation error for phone format
Actual Result: ___________
Status: Pass/Fail

TC-PAT-005: Search Patient by Name
Description: Can search patients by name
Priority: P1 (High)
Preconditions: Patients exist
Test Steps:
1. Navigate to patient search
2. Enter patient name
3. Submit search
Expected Result: Matching patients displayed
Actual Result: ___________
Status: Pass/Fail

TC-PAT-006: Search Patient by ID
Description: Can search patients by ID
Priority: P1 (High)
Preconditions: Patients exist
Test Steps:
1. Navigate to patient search
2. Enter patient ID
3. Submit search
Expected Result: Patient displayed if found
Actual Result: ___________
Status: Pass/Fail

TC-PAT-007: Search Patient by Phone
Description: Can search patients by phone
Priority: P1 (High)
Preconditions: Patients exist
Test Steps:
1. Navigate to patient search
2. Enter phone number
3. Submit search
Expected Result: Matching patients displayed
Actual Result: ___________
Status: Pass/Fail

TC-PAT-008: View Patient Details
Description: Can view patient details
Priority: P1 (High)
Preconditions: Patient exists
Test Steps:
1. Search for patient
2. Click on patient
Expected Result: Patient details displayed
Actual Result: ___________
Status: Pass/Fail

TC-PAT-009: Edit Patient Data
Description: Cannot edit patient data directly
Priority: P2 (Medium)
Preconditions: Reception logged in
Test Steps:
1. Navigate to patient details
2. Try to edit patient information
Expected Result: Edit option not available or requires approval
Actual Result: ___________
Status: Pass/Fail

TC-PAT-010: Patient ID Uniqueness
Description: Patient IDs are unique
Priority: P0 (Critical)
Preconditions: Multiple patients registered
Test Steps:
1. Register multiple patients
2. Verify patient IDs
Expected Result: All patient IDs unique
Actual Result: ___________
Status: Pass/Fail
```

### X-Ray Request Module

```
TC-XRAY-001: Create X-Ray Request
Description: Specialist can create X-ray request
Priority: P0 (Critical)
Preconditions: Specialist logged in, patient exists
Test Steps:
1. Navigate to referred patients
2. Select patient
3. Click create X-ray request
4. Add notes
5. Submit
Expected Result: Request created, technician notified
Actual Result: ___________
Status: Pass/Fail

TC-XRAY-002: Request Validation - Missing Notes
Description: Request can be created without notes
Priority: P2 (Medium)
Preconditions: Specialist logged in, patient exists
Test Steps:
1. Navigate to referred patients
2. Select patient
3. Click create X-ray request
4. Leave notes empty
5. Submit
Expected Result: Request created successfully
Actual Result: ___________
Status: Pass/Fail

TC-XRAY-003: View Pending Requests
Description: Technician can view pending requests
Priority: P0 (Critical)
Preconditions: Technician logged in, requests exist
Test Steps:
1. Navigate to pending requests
Expected Result: All pending requests displayed
Actual Result: ___________
Status: Pass/Fail

TC-XRAY-004: Upload X-Ray Image
Description: Technician can upload X-ray image
Priority: P0 (Critical)
Preconditions: Technician logged in, request exists
Test Steps:
1. Navigate to request
2. Click upload image
3. Select JPEG file
4. Submit
Expected Result: Image uploaded, AI analysis triggered
Actual Result: ___________
Status: Pass/Fail

TC-XRAY-005: Upload Invalid File Type
Description: Invalid file types rejected
Priority: P0 (Critical)
Preconditions: Technician logged in, request exists
Test Steps:
1. Navigate to request
2. Click upload image
3. Select non-image file
4. Submit
Expected Result: Upload rejected with error
Actual Result: ___________
Status: Pass/Fail

TC-XRAY-006: Upload Large File
Description: Large files rejected
Priority: P1 (High)
Preconditions: Technician logged in, request exists
Test Steps:
1. Navigate to request
2. Click upload image
3. Select file > 10MB
4. Submit
Expected Result: Upload rejected with size error
Actual Result: ___________
Status: Pass/Fail

TC-XRAY-007: AI Analysis - Valid X-Ray
Description: AI analyzes valid chest X-ray
Priority: P0 (Critical)
Preconditions: Valid chest X-ray uploaded
Test Steps:
1. Wait for analysis to complete
2. View results
Expected Result: Prediction returned with confidence
Actual Result: ___________
Status: Pass/Fail

TC-XRAY-008: AI Analysis - Non X-Ray
Description: AI rejects non-X-ray images
Priority: P0 (Critical)
Preconditions: Non-X-ray image uploaded
Test Steps:
1. Wait for analysis to complete
2. View results
Expected Result: "Not a chest X-ray" message
Actual Result: ___________
Status: Pass/Fail

TC-XRAY-009: View Results
Description: Specialist can view AI results
Priority: P0 (Critical)
Preconditions: Analysis completed
Test Steps:
1. Navigate to request
2. View results section
Expected Result: Prediction and confidence displayed
Actual Result: ___________
Status: Pass/Fail

TC-XRAY-010: Update Request Status
Description: Technician can update request status
Priority: P1 (High)
Preconditions: Technician logged in, request exists
Test Steps:
1. Navigate to request
2. Update status to completed
3. Submit
Expected Result: Status updated, doctor notified
Actual Result: ___________
Status: Pass/Fail
```

### Notification Module

```
TC-NOT-001: Receive Referral Notification
Description: Specialist notified of new referral
Priority: P1 (High)
Preconditions: Patient referred
Test Steps:
1. Check notification bell
Expected Result: Notification about referral
Actual Result: ___________
Status: Pass/Fail

TC-NOT-002: Receive Request Notification
Description: Technician notified of new request
Priority: P1 (High)
Preconditions: X-ray request created
Test Steps:
1. Check notification bell
Expected Result: Notification about new request
Actual Result: ___________
Status: Pass/Fail

TC-NOT-003: Receive Result Notification
Description: Specialist notified of results
Priority: P1 (High)
Preconditions: Analysis completed
Test Steps:
1. Check notification bell
Expected Result: Notification about results
Actual Result: ___________
Status: Pass/Fail

TC-NOT-004: Mark as Read
Description: Can mark notifications as read
Priority: P2 (Medium)
Preconditions: Unread notifications exist
Test Steps:
1. Click notification
2. Verify marked as read
Expected Result: Notification marked as read
Actual Result: ___________
Status: Pass/Fail

TC-NOT-005: Notification Count
Description: Notification count displays correctly
Priority: P2 (Medium)
Preconditions: Unread notifications exist
Test Steps:
1. View notification bell
Expected Result: Correct unread count displayed
Actual Result: ___________
Status: Pass/Fail
```

---

## Bug Reporting Template

### Bug Report Form

```
Bug ID: BUG-XXX
Title: [Brief description of bug]
Severity: [Critical / High / Medium / Low]
Priority: [P0 / P1 / P2 / P3]
Status: [Open / In Progress / Resolved / Closed]
Assigned To: ___________
Reported By: ___________
Reported Date: ___________
Environment:
- OS: ___________
- Browser: ___________
- Backend Version: ___________
- Frontend Version: ___________

Description:
[Detailed description of the bug]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[What should happen]

Actual Result:
[What actually happens]

Screenshots/Videos:
[Attach evidence]

Frequency:
[Always / Sometimes / Rarely]

Workaround:
[If any workaround exists]

Additional Notes:
[Any other relevant information]
```

---

## Test Execution Summary

### Test Statistics

```
Total Test Cases: _____
Executed: _____
Passed: _____
Failed: _____
Blocked: _____
Not Executed: _____

Pass Rate: _____%
Execution Date: _____
Test Environment: _____
```

### Defect Summary

```
Total Defects Found: _____
Critical: _____
High: _____
Medium: _____
Low: _____

Resolved: _____
Open: _____
Deferred: _____
```

### Test Coverage

```
Module Coverage:
- Authentication: _____%
- Patient Management: _____%
- X-Ray Requests: _____%
- Notifications: _____%
- User Management: _____%
- Reports/Analytics: _____%

Overall Coverage: _____%
```

---

## Sign-off

### Test Lead Approval

Name: ___________
Signature: ___________
Date: ___________

### Project Manager Approval

Name: ___________
Signature: ___________
Date: ___________

### Client/Stakeholder Approval

Name: ___________
Signature: ___________
Date: ___________
