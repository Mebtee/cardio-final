# Cardiomegaly Detection System - UML Documentation

## 1. Actor Identification

### Primary Actors:
1. **Admin** - System administrator who manages users, monitors system performance, and handles patient edit requests
2. **Reception** - Reception staff who register patients and manage patient referrals
3. **General Doctor** - General practitioners who examine patients and request X-ray scans
4. **Specialist Doctor** - Cardiologists and other specialists who review X-ray results and provide specialized care
5. **X-Ray Technician** - Medical technicians who perform X-ray scans and upload images for analysis

### Secondary Actors:
- **Database System** - Stores all patient, user, and medical data
- **File System** - Stores X-ray images and prediction results
- **Email System** - Handles password reset notifications

## 2. Use Case Identification

### Admin Use Cases:
- Manage Users (Create, Update, Ban/Unban)
- View System Overview and Analytics
- Monitor Diagnosis Data with Filtering
- Review Patient Edit Requests
- Approve/Reject Edit Requests
- Download Diagnosis Images (Single/Bulk)
- Reset Default Users

### Reception Use Cases:
- Register New Patients (with auto-generated Patient ID)
- Search Existing Patients (by name, ID, phone)
- Request Patient Data Edits
- Submit Patient Changes (after approval)
- View Edit Request Status

### General Doctor Use Cases:
- Login to System
- View Registered Patients (awaiting triage)
- Refer Patients to Specialists
- Filter Patients by Status and Date
- Receive Notifications

### Specialist Doctor Use Cases:
- Login to System
- View Referred Patients
- Create X-Ray Requests for Patients
- Review X-Ray Results and AI Predictions
- View Request History and Statistics
- Receive Notifications about Results

### X-Ray Technician Use Cases:
- Login to System
- View Pending X-Ray Requests
- Upload X-Ray Images (JPEG/PNG only)
- Process AI Analysis for Cardiomegaly Detection
- View Request Statistics
- Receive Notifications about New Requests

## 3. System Use Case Diagram

```
                    Cardiomegaly Detection System
    
    Admin                                           Reception
      |                                               |
      |-- Manage Users                              |-- Register Patients
      |-- View System Overview                      |-- Search Patients  
      |-- Monitor Diagnosis Data                    |-- Request Patient Edits
      |-- Review Edit Requests                      |-- Submit Patient Changes
      |-- Download Images                           |-- View Edit Status
      |                                             |
      |                                             |
    General Doctor                              Specialist Doctor
      |                                               |
      |-- View Registered Patients                  |-- View Referred Patients
      |-- Refer to Specialists                      |-- Create X-Ray Requests
      |-- Filter Patients                           |-- Review X-Ray Results
      |-- Receive Notifications                     |-- View Request History
      |                                             |-- Receive Notifications
      |                                             |
                        X-Ray Technician
                              |
                              |-- View Pending Requests
                              |-- Upload X-Ray Images
                              |-- Process AI Analysis
                              |-- View Statistics
                              |-- Receive Notifications
```

## 4. Actor Description

### Admin
**Role**: System Administrator
**Responsibilities**: 
- User management and access control (create, update, ban/unban users)
- System monitoring and performance analysis with charts and metrics
- Diagnosis data monitoring with filtering and bulk download capabilities
- Patient edit request approval workflow management
- System overview analytics and reporting

**Permissions**: Full system access, user management, data analytics, edit request approval

### Reception
**Role**: Front desk and patient registration staff
**Responsibilities**:
- Patient registration with auto-generated patient IDs
- Patient search by name, ID, or phone number
- Patient data edit request initiation and submission
- Patient data modification after admin approval
- Edit request status tracking

**Permissions**: Patient registration, patient search, edit request management

### General Doctor
**Role**: Primary care physician
**Responsibilities**:
- View registered patients awaiting triage
- Refer patients to specialist doctors for further evaluation
- Filter patients by status and registration date
- Receive notifications about new patient registrations

**Permissions**: View registered patients, create specialist referrals, receive notifications

### Specialist Doctor
**Role**: Cardiologist or other medical specialist
**Responsibilities**:
- View patients referred by general doctors
- Create X-ray examination requests for referred patients
- Review AI-generated cardiomegaly predictions and confidence scores
- Monitor X-ray request history and statistics
- Receive notifications about X-ray results and referrals

**Permissions**: View referred patients, create X-ray requests, review AI results, receive notifications

### X-Ray Technician
**Role**: Medical imaging technician
**Responsibilities**:
- View pending X-ray examination requests
- Upload chest X-ray images (JPEG/PNG format only)
- Process AI analysis for cardiomegaly detection
- Monitor request statistics (pending/completed counts)
- Receive notifications about new X-ray requests

**Permissions**: View X-ray requests, upload images, process AI analysis, receive notifications

## 5. Admin Sequence Diagram

```
Admin -> System: Login
System -> Database: Validate Credentials
Database -> System: Return User Data
System -> Admin: Display Dashboard

Admin -> System: View System Overview
System -> Database: Query System Metrics
Database -> System: Return Analytics Data
System -> Admin: Display Charts & Statistics

Admin -> System: Manage Users
System -> Database: Query User List
Database -> System: Return Users
System -> Admin: Display User Management

Admin -> System: Create New User
System -> Database: Insert User Record
Database -> System: Confirm Creation
System -> Admin: Success Message

Admin -> System: Review Edit Requests
System -> Database: Query Pending Requests
Database -> System: Return Request List
System -> Admin: Display Requests

Admin -> System: Approve Edit Request
System -> Database: Update Patient Data
System -> Database: Update Request Status
Database -> System: Confirm Updates
System -> Admin: Approval Confirmation
```

## 6. Reception Sequence Diagram

```
Reception -> System: Login
System -> Database: Validate Credentials
Database -> System: Return User Data
System -> Reception: Display Dashboard

Reception -> System: Register New Patient
System -> Reception: Display Registration Form
Reception -> System: Submit Patient Data
System -> Database: Insert Patient Record
Database -> System: Return Patient ID
System -> Reception: Registration Success

Reception -> System: Search Patient
System -> Database: Query Patient Records
Database -> System: Return Search Results
System -> Reception: Display Patient List

Reception -> System: Refer Patient to Doctor
System -> Database: Update Patient Status
System -> Database: Create Referral Record
Database -> System: Confirm Referral
System -> Reception: Referral Success

Reception -> System: Request Patient Edit
System -> Database: Create Edit Request
Database -> System: Return Request ID
System -> Reception: Edit Request Submitted
```

## 7. General Doctor Sequence Diagram

```
General Doctor -> System: Login
System -> Database: Validate Credentials
Database -> System: Return User Data
System -> General Doctor: Display Dashboard

General Doctor -> System: View Registered Patients
System -> Database: Query Registered Patients (status='registered')
Database -> System: Return Patient List
System -> General Doctor: Display Patients

General Doctor -> System: Filter Patients
System -> Database: Query with Filters (date, status)
Database -> System: Return Filtered Results
System -> General Doctor: Display Filtered Patients

General Doctor -> System: Select Patient for Referral
System -> General Doctor: Display Specialist Selection Dialog

General Doctor -> System: Refer to Specialist
System -> Database: Update Patient Status to 'referred'
System -> Database: Set referred_to field
Database -> System: Confirm Referral
System -> Specialist Doctor: Send Notification
System -> General Doctor: Referral Success Message
```

## 8. Specialist Doctor Sequence Diagram

```
Specialist Doctor -> System: Login
System -> Database: Validate Credentials
Database -> System: Return User Data
System -> Specialist Doctor: Display Dashboard

Specialist Doctor -> System: View Referred Patients
System -> Database: Query Patients (referred_to=doctor_id, status='referred')
Database -> System: Return Patient List
System -> Specialist Doctor: Display Referred Patients

Specialist Doctor -> System: Select Patient for X-Ray Request
System -> Database: Query Patient Details
Database -> System: Return Patient Data
System -> Specialist Doctor: Display Patient Information

Specialist Doctor -> System: Create X-Ray Request
System -> Database: Insert X-Ray Request Record
System -> Database: Update Patient Status to 'xray_requested'
Database -> System: Return Request ID
System -> X-Ray Technician: Send Notification
System -> Specialist Doctor: Request Created Successfully

Specialist Doctor -> System: View X-Ray Request History
System -> Database: Query Doctor's Requests with Results
Database -> System: Return Request List with Predictions
System -> Specialist Doctor: Display Request History

Specialist Doctor -> System: Review X-Ray Results
System -> Database: Query Prediction Details
Database -> System: Return AI Analysis (prediction, confidence)
System -> Specialist Doctor: Display Detailed Results
```

## 9. X-Ray Technician Sequence Diagram

```
X-Ray Technician -> System: Login
System -> Database: Validate Credentials
Database -> System: Return User Data
System -> X-Ray Technician: Display Dashboard

X-Ray Technician -> System: View Pending Requests
System -> Database: Query Pending X-Ray Requests
Database -> System: Return Request List
System -> X-Ray Technician: Display Queue

X-Ray Technician -> System: Select Request
System -> Database: Query Request Details
Database -> System: Return Patient & Request Data
System -> X-Ray Technician: Display Request Info

X-Ray Technician -> System: Upload X-Ray Image
System -> File System: Store Image File
File System -> System: Return File Path
System -> AI Model: Process Image
AI Model -> System: Return Prediction
System -> Database: Store Prediction Result
Database -> System: Confirm Storage
System -> X-Ray Technician: Upload Success

X-Ray Technician -> System: Update Request Status
System -> Database: Update Request to Completed
Database -> System: Confirm Update
System -> General Doctor: Notify Result Ready
System -> X-Ray Technician: Status Updated
```

## 10. Complete Sequence Diagram

```
Patient Registration & X-Ray Analysis Complete Workflow:

Reception -> System: Register Patient
System -> Database: Store Patient Data (auto-generate Patient ID)
System -> General Doctor: Notify New Registration

General Doctor -> System: View Registered Patients
General Doctor -> System: Refer Patient to Specialist
System -> Database: Update Patient Status to 'referred'
System -> Specialist Doctor: Notify New Referral

Specialist Doctor -> System: View Referred Patients
Specialist Doctor -> System: Create X-Ray Request
System -> Database: Create X-Ray Request Record
System -> X-Ray Technician: Notify New Request

X-Ray Technician -> System: View Pending Requests
X-Ray Technician -> System: Upload X-Ray Image (JPEG/PNG)
System -> AI Model: Analyze for Cardiomegaly
AI Model -> System: Return Prediction & Confidence
System -> Database: Store Prediction Results
System -> Database: Update Request Status to 'completed'
System -> Specialist Doctor: Notify Results Ready

Specialist Doctor -> System: View X-Ray Results
Specialist Doctor -> System: Review AI Prediction

Admin -> System: Monitor System Overview
Admin -> System: View Diagnosis Data
Admin -> System: Download Images (if needed)
Admin -> System: Manage Edit Requests

Reception -> System: Request Patient Edit (if needed)
Admin -> System: Approve/Reject Edit Request
Reception -> System: Submit Patient Changes (if approved)
Admin -> System: Final Approval of Changes
```
##
 11. Collaboration Diagram

```
Patient Registration and X-Ray Analysis Collaboration:

1: register() 
Reception ---------> Patient Management System

2: store()
Patient Management System ---------> Database

3: refer()
Reception ---------> Doctor Assignment System

4: viewPatient()
General Doctor ---------> Patient Management System

5: requestXRay()
General Doctor ---------> X-Ray Request System

6: createRequest()
X-Ray Request System ---------> Database

7: notify()
X-Ray Request System ---------> Notification System

8: viewRequests()
X-Ray Technician ---------> X-Ray Request System

9: uploadImage()
X-Ray Technician ---------> Image Processing System

10: analyze()
Image Processing System ---------> AI Analysis Engine

11: storeResults()
AI Analysis Engine ---------> Database

12: notifyResults()
Notification System ---------> General Doctor

13: viewResults()
General Doctor ---------> Results Display System

14: referSpecialist()
General Doctor ---------> Specialist Referral System

15: reviewCase()
Specialist Doctor ---------> Patient Management System

16: provideDiagnosis()
Specialist Doctor ---------> Diagnosis System

17: monitor()
Admin ---------> System Monitoring
```

## 12. Activity Diagrams

### Admin Activity Diagram

```
START
  |
  v
[Login to System]
  |
  v
<Authentication Successful?>
  |                    |
  v (Yes)             v (No)
[Access Dashboard]   [Display Error]
  |                    |
  v                    v
[Select Activity]     END
  |
  v
<Activity Type?>
  |         |         |         |
  v         v         v         v
[Manage   [View     [Review   [Generate
 Users]    System   Edit      Reports]
  |        Overview] Requests]   |
  v         |         |         v
[CRUD      v         v        [Select Report
 Operations][Display  [Approve/ Parameters]
  |         Charts]   Reject]    |
  v         |         |         v
[Update    v         v        [Generate &
 Database] [Monitor  [Update   Display]
  |         Performance] Database] |
  v         |         |         v
[Success   v         v        [Export
 Message]  END       END       Options]
  |                             |
  v                             v
END                            END
```

### Reception Activity Diagram

```
START
  |
  v
[Login to System]
  |
  v
<Authentication Successful?>
  |                    |
  v (Yes)             v (No)
[Access Dashboard]   [Display Error]
  |                    |
  v                    v
[Select Task]         END
  |
  v
<Task Type?>
  |           |           |
  v           v           v
[Register    [Search     [Refer
 Patient]     Patient]    Patient]
  |           |           |
  v           v           v
[Enter       [Enter      [Select
 Patient      Search      Doctor]
 Details]     Criteria]   |
  |           |           v
  v           v          [Create
[Validate    [Display    Referral]
 Data]        Results]    |
  |           |           v
  v           v          [Update
[Save to     [Select     Patient
 Database]    Patient]    Status]
  |           |           |
  v           v           v
[Generate    [View/Edit  [Notify
 Patient ID]  Details]    Doctor]
  |           |           |
  v           v           v
[Success     END         END
 Message]
  |
  v
END
```

### General Doctor Activity Diagram

```
START
  |
  v
[Login to System]
  |
  v
<Authentication Successful?>
  |                    |
  v (Yes)             v (No)
[Access Dashboard]   [Display Error]
  |                    |
  v                    v
[View Registered     END
 Patients]
  |
  v
<Apply Filters?>
  |           |
  v (Yes)     v (No)
[Set Date/   [View All
 Status       Patients]
 Filters]     |
  |           |
  v-----------
[Review Patient List]
  |
  v
<Select Patient for Referral?>
  |           |
  v (Yes)     v (No)
[Open        [Continue
 Referral     Monitoring]
 Dialog]      |
  |           v
  v          END
[Select Specialist Doctor]
  |
  v
[Confirm Referral]
  |
  v
[Patient Status Updated to 'referred']
  |
  v
[Specialist Notified]
  |
  v
[Success Message Displayed]
  |
  v
END
```

### Specialist Doctor Activity Diagram

```
START
  |
  v
[Login to System]
  |
  v
<Authentication Successful?>
  |                    |
  v (Yes)             v (No)
[Access Dashboard]   [Display Error]
  |                    |
  v                    v
[View Referred       END
 Patients]
  |
  v
<Patients Available?>
  |           |
  v (Yes)     v (No)
[Select      [Wait for
 Patient]     New Referrals]
  |           |
  v           v
[Review      END
 Patient Info]
  |
  v
<Need X-Ray?>
  |           |
  v (Yes)     v (No)
[Create      [Continue
 X-Ray        Monitoring]
 Request]     |
  |           v
  v          [View Request
[Enter        History]
 Request      |
 Details]     v
  |          END
  v
[Submit Request]
  |
  v
[Technician Notified]
  |
  v
[Wait for Results]
  |
  v
<Results Available?>
  |           |
  v (Yes)     v (No)
[Review      [Continue
 AI Results]  Other Tasks]
  |           |
  v           v
[View        END
 Prediction &
 Confidence]
  |
  v
[Analyze Results]
  |
  v
<Request Another X-Ray?>
  |           |
  v (Yes)     v (No)
[Create      [Complete
 New Request] Assessment]
  |           |
  v           v
END         END
```

### X-Ray Technician Activity Diagram

```
START
  |
  v
[Login to System]
  |
  v
<Authentication Successful?>
  |                    |
  v (Yes)             v (No)
[Access Dashboard]   [Display Error]
  |                    |
  v                    v
[View Pending        END
 Requests]
  |
  v
<Requests Available?>
  |           |
  v (Yes)     v (No)
[Select      [Wait for
 Request]     New Requests]
  |           |
  v           v
[Review      END
 Patient Info]
  |
  v
[Prepare Equipment]
  |
  v
[Position Patient]
  |
  v
[Capture X-Ray Image]
  |
  v
<Image Quality OK?>
  |           |
  v (Yes)     v (No)
[Upload      [Retake
 Image]       Image]
  |           |
  v           |
[Wait for    |
 AI Analysis]|
  |           |
  v           |
[Review      |
 Results]     |
  |           |
  v           |
[Update      |
 Request      |
 Status]      |
  |           |
  v           |
[Notify      |
 Doctor]      |
  |           |
  v-----------
[Complete Request]
  |
  v
<More Requests?>
  |           |
  v (Yes)     v (No)
[Continue]   END
  |
  v
[View Pending Requests]
```

## 13. State Chart Diagram

### Patient State Chart

```
Patient States:

[Initial]
    |
    | register()
    v
[Registered] 
    |
    | refer()
    v
[Referred]
    |
    | createXRayRequest()
    v
[X-Ray Requested]
    |
    | uploadImage()
    v
[X-Ray Processing]
    |
    | analyzeComplete()
    v
[Results Available]
    |
    | reviewResults()
    v
[Completed]

Note: The system currently supports these core patient states.
Additional states like 'Under Treatment' may be added in future versions.
```

### X-Ray Request State Chart

```
X-Ray Request States:

[Created]
    |
    | submit()
    v
[Pending]
    |
    | assign()
    v
[Assigned to Technician]
    |
    | startProcessing()
    v
[In Progress]
    |
    | uploadImage()
    v
[Image Uploaded]
    |
    | analyze()
    v
[Processing Analysis]
    |
    | analysisComplete()
    v
[Analysis Complete]
    |
    | reviewResults()
    v
[Results Reviewed]
    |
    | complete()
    v
[Completed]
```

### User Session State Chart

```
User Session States:

[Logged Out]
    |
    | login()
    v
<Valid Credentials?>
    |           |
    | (Yes)     | (No)
    v           v
[Authenticated] [Login Failed]
    |           |
    | access()  | retry()
    v           |
[Active Session]|
    |           |
    | timeout() |
    | logout()  |
    v-----------
[Session Expired]
    |
    | cleanup()
    v
[Logged Out]
```

## 14. Object Modelling

### Class Diagram

```
+------------------+     +------------------+     +------------------+
|      User        |     |     Patient      |     |   XRayRequest    |
+------------------+     +------------------+     +------------------+
| - id: int        |     | - id: int        |     | - id: string     |
| - username: str  |     | - patientName: str|    | - doctorId: int  |
| - password: str  |     | - patientId: str |     | - patientName: str|
| - email: str     |     | - contactNumber: str| - patientId: str |
| - role: enum     |     | - age: int       |     | - requestNotes: str|
| - fullName: str  |     | - gender: enum   |     | - status: enum   |
| - specialty: str |     | - medicalHistory: str| - createdAt: date|
| - isBanned: bool |     | - registeredBy:int|    +------------------+
| - createdAt: date|     | - status: enum   |     | + create()       |
+------------------+     | - referredTo: int|     | + updateStatus() |
| + login()        |     | - createdAt: date|     | + getByDoctor()  |
| + validateSession()|   +------------------+     +------------------+
| + changePassword()|     | + register()     |              |
+------------------+     | + search()       |              |
         |               | + refer()        |              |
         |               +------------------+              |
         |                        |                       |
+------------------+              |              +------------------+
|     Admin        |              |              |   Prediction     |
+------------------+              |              +------------------+
| + manageUsers()  |              |              | - id: string     |
| + viewOverview() |              |              | - requestId: str |
| + banUser()      |              |              | - filename: str  |
| + downloadImages()|             |              | - prediction: str|
| + approveEdits() |              |              | - confidence: float|
+------------------+              |              | - timestamp: date|
         |                        |              +------------------+
+------------------+              |              | + analyzeImage() |
|    Reception     |              |              | + getResult()    |
+------------------+              |              +------------------+
| + registerPatient|              |                       |
| + searchPatient()|              |                       |
| + requestEdit()  |              |                       |
| + submitChanges()|              |                       |
+------------------+              |                       |
         |                        |                       |
+------------------+              |                       |
|  GeneralDoctor   |              |                       |
+------------------+              |                       |
| + viewRegistered()|             |                       |
| + referSpecialist|              |                       |
| + filterPatients()|             |                       |
+------------------+              |                       |
         |                        |                       |
+------------------+              |                       |
| SpecialistDoctor |              |                       |
+------------------+              |                       |
| + viewReferred() |              |                       |
| + createXRayReq()|              |                       |
| + reviewResults()|              |                       |
| + viewHistory()  |              |                       |
+------------------+              |                       |
         |                        |                       |
+------------------+     +------------------+              |
|  XRayTechnician  |     | PatientEditRequest|             |
+------------------+     +------------------+              |
| + viewRequests() |     | - id: int        |              |
| + uploadImage()  |     | - patientId: int |              |
| + processAI()    |     | - requestedBy: int|             |
| + viewStats()    |     | - requestReason: str|           |
+------------------+     | - status: enum   |              |
                         | - originalData: json|            |
                         | - proposedChanges: json|         |
                         | - reviewedBy: int|               |
                         | - createdAt: date|               |
                         +------------------+              |
                         | + create()       |              |
                         | + approve()      |              |
                         | + reject()       |              |
                         | + submitChanges()|              |
                         +------------------+              |
                                  |                        |
                         +------------------+              |
                         |  Notification    |              |
                         +------------------+              |
                         | - id: int        |              |
                         | - userId: int    |              |
                         | - type: str      |              |
                         | - title: str     |              |
                         | - message: str   |              |
                         | - isRead: bool   |              |
                         | - createdAt: date|              |
                         +------------------+              |
                         | + send()         |              |
                         | + markRead()     |              |
                         | + getUnreadCount()|             |
                         +------------------+              |
```

### Object Diagram

```
Instance: Patient Registration and X-Ray Analysis

patient1: Patient
- id = 1
- name = "John Doe"
- patientId = "PAT001"
- age = 45
- gender = "male"
- status = "xray_requested"

reception1: Reception
- id = 6
- username = "rec"
- fullName = "Sarah Johnson"
- role = "reception"

doctor1: GeneralDoctor
- id = 2
- username = "doctor1"
- fullName = "Dr. John Smith"
- role = "doctor"
- specialty = "cardiology"

technician1: XRayTechnician
- id = 3
- username = "technician1"
- fullName = "Jane Doe"
- role = "xray_technician"

xrayRequest1: XRayRequest
- id = "req-12345"
- doctorId = 2
- patientName = "John Doe"
- status = "completed"
- createdAt = "2025-12-14"

prediction1: Prediction
- id = "pred-67890"
- requestId = "req-12345"
- filename = "chest_xray.jpg"
- prediction = "positive"
- confidence = 0.95
- timestamp = "2025-12-14 10:30:00"

admin1: Admin
- id = 1
- username = "admin"
- fullName = "System Administrator"
- role = "admin"

editRequest1: PatientEditRequest
- id = 1
- patientId = 1
- requestedBy = 6
- reason = "Update contact information"
- status = "approved_final"
- reviewedBy = 1

notification1: Notification
- id = 1
- userId = 2
- type = "xray_result_ready"
- title = "X-ray Result Ready"
- message = "Result for John Doe: Positive"
- isRead = false

Relationships:
- reception1 registered patient1
- doctor1 requested xrayRequest1 for patient1
- technician1 processed xrayRequest1
- prediction1 analyzed xrayRequest1
- reception1 created editRequest1 for patient1
- admin1 approved editRequest1
- notification1 notifies doctor1 about prediction1
```

## 15. System Architecture Overview

### Component Relationships:
1. **Frontend (React)** - User interface for all actors
2. **Backend (Flask)** - API server handling business logic
3. **Database (MySQL)** - Data persistence layer
4. **AI Model** - Image analysis engine (PyTorch)
5. **File System** - Image storage and management

### Key Design Patterns:
- **MVC Pattern**: Separation of concerns between UI, logic, and data
- **Repository Pattern**: Data access abstraction
- **Observer Pattern**: Notification system for real-time updates
- **Factory Pattern**: User role-based dashboard creation
- **Strategy Pattern**: Different analysis algorithms for different image types

This comprehensive UML documentation provides a complete view of the Cardiomegaly Detection System's architecture, user interactions, and data flow patterns.