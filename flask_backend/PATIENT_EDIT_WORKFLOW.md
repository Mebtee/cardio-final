# Patient Edit Workflow

## Overview
The patient edit workflow provides a secure, multi-step approval process for modifying patient data. This ensures data integrity and maintains an audit trail of all changes.

## Database Migration Required
Before using the patient edit functionality, you need to run the database migration:

1. Open phpMyAdmin or your MySQL client
2. Select the `cardiomegaly_detection` database
3. Run the SQL script: `flask_backend/patient_edit_requests.sql`

This will create the `patient_edit_requests` table.

## Workflow Steps

### Step 1: Request Edit Permission
**Actor**: Receptionist
**Action**: Click "Request Edit" button on patient list
**Result**: Creates edit request with status `pending_approval`

```
Receptionist → Patient List → Request Edit → Provide Reason → Submit
```

### Step 2: Admin Approval (First)
**Actor**: Admin
**Action**: Review and approve edit request
**Result**: Status changes to `approved_for_edit`

```
Admin → Edit Requests Tab → Review Request → Approve/Reject
```

### Step 3: Edit Patient Data
**Actor**: Receptionist
**Action**: Edit patient data using approved request
**Result**: Status changes to `changes_submitted`

```
Receptionist → Edit Requests Tab → Edit Data → Submit Changes
```

### Step 4: Final Admin Approval
**Actor**: Admin
**Action**: Review and approve submitted changes
**Result**: Status changes to `approved_final` and data is saved

```
Admin → Edit Requests Tab → View Details → Review Changes → Final Approve/Reject
```

#### View Details Feature
When changes are submitted (`changes_submitted` status), admins can click "View Details" to see:
- **Request Information**: Patient details, requester, reason, status
- **Data Comparison**: Side-by-side comparison of original vs proposed changes
- **Change Highlights**: Visual indicators showing which fields were modified
- **Timeline**: Complete history of the request lifecycle
- **Quick Actions**: Approve or reject directly from the details view

## Request Statuses

| Status | Description | Next Action |
|--------|-------------|-------------|
| `pending_approval` | Waiting for admin to approve edit request | Admin approves/rejects |
| `approved_for_edit` | Admin approved, receptionist can edit | Receptionist edits data |
| `changes_submitted` | Changes submitted, waiting for final approval | Admin final approval |
| `approved_final` | Changes approved and applied to database | Complete |
| `rejected` | Request rejected by admin | Complete |

## API Endpoints

### Request Edit Permission
```
POST /patient-edits/request
Body: {
  "patient_id": number,
  "requested_by": number,
  "reason": string
}
```

### Get My Edit Requests (Receptionist)
```
GET /patient-edits/my-requests/{user_id}
```

### Get Pending Requests (Admin)
```
GET /patient-edits/pending
```

### Approve Request
```
POST /patient-edits/{request_id}/approve
Body: {
  "admin_id": number,
  "notes": string (optional)
}
```

### Reject Request
```
POST /patient-edits/{request_id}/reject
Body: {
  "admin_id": number,
  "notes": string (optional)
}
```

### Submit Changes
```
POST /patient-edits/{request_id}/submit-changes
Body: {
  "changes": {
    "patient_name": string,
    "contact_number": string,
    "age": number,
    "gender": string,
    "medical_history": string
  }
}
```

### Get Request Details
```
GET /patient-edits/{request_id}
```

## Frontend Components

### Reception Dashboard
- **Patient List Tab**: Shows "Request Edit" button for each patient
- **Edit Requests Tab**: Shows user's edit requests and their statuses
- **Edit Request Dialog**: Form to submit edit request with reason
- **Edit Form Dialog**: Form to edit patient data (only when approved)

### Admin Dashboard
- **Edit Requests Tab**: Shows all pending requests for approval
- **View Details Button**: Available for requests with submitted changes
- **Details Dialog**: Comprehensive view of changes with highlights
- **Data Comparison**: Side-by-side original vs proposed values
- **Change Indicators**: Visual highlights for modified fields
- **Timeline View**: Complete request history
- **Approval Actions**: Approve/Reject buttons for each request
- **Two-stage approval**: Initial approval and final approval

## Security Features

- **Role-based access**: Only receptionists can request edits, only admins can approve
- **Audit trail**: All requests, approvals, and changes are logged with timestamps
- **Reason tracking**: Every edit request must include a reason
- **Review notes**: Admins can add notes when approving/rejecting
- **Data integrity**: Original data is preserved until final approval

## User Experience

### For Receptionists
1. **Simple request process**: Click button, provide reason, submit
2. **Clear status tracking**: See request status in dedicated tab
3. **Guided editing**: Only edit when approved, clear form interface
4. **Status indicators**: Visual feedback on request progress

### For Admins
1. **Centralized review**: All requests in one place
2. **Context information**: See patient details, requester, and reason
3. **Detailed change view**: Side-by-side comparison of original vs proposed data
4. **Visual highlights**: Clear indicators showing what changed
5. **Two-stage approval**: Review request first, then review changes
6. **Audit information**: Full history of request lifecycle
7. **Quick actions**: Approve/reject directly from details view

## Data Flow

```
Patient Data (Original)
    ↓
Edit Request Created (with original data snapshot)
    ↓
Admin Approval (request approved for editing)
    ↓
Receptionist Edits (proposed changes stored)
    ↓
Admin Final Approval (changes applied to patient table)
    ↓
Patient Data (Updated)
```

## Testing

Run the test script to verify the complete workflow:
```bash
python flask_backend/test_patient_edit_workflow.py
```

This tests all steps from request creation to final data update.

## Files Created/Modified

### Backend
- `flask_backend/routes/patient_edits.py` - New API routes
- `flask_backend/patient_edit_requests.sql` - Database migration
- `flask_backend/app.py` - Register new blueprint

### Frontend
- `src/services/api.ts` - New API functions
- `src/pages/ReceptionDashboard.tsx` - Edit request functionality
- `src/pages/AdminDashboard.tsx` - Edit request approval functionality

### Documentation
- `flask_backend/PATIENT_EDIT_WORKFLOW.md` - This documentation
- `flask_backend/test_patient_edit_workflow.py` - Test script