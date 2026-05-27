# Admin Features - Ban Users

## Overview
The admin dashboard now includes the ability to ban and unban users from the system.

## Database Migration Required
Before using the ban functionality, you need to run the database migration:

1. Open phpMyAdmin or your MySQL client
2. Select the `cardiomegaly_detection` database
3. Run the SQL script: `flask_backend/add_is_banned_column.sql`

This will add the `is_banned` column to the users table.

## Features Added

### 1. Ban/Unban Users
- **Ban User**: Prevents the user from logging into the system
- **Unban User**: Restores access for a banned user
- **Visual Status**: Shows "Active" or "Banned" status in the users table
- **Confirmation Dialog**: Asks for confirmation before banning/unbanning



## API Endpoints Added

### Ban User
```
POST /admin/users/{user_id}/ban
```

### Unban User
```
POST /admin/users/{user_id}/unban
```



### Session Validation
```
GET /validate-session/{user_id}
```
Returns 200 OK for valid sessions, 403 Forbidden for banned users.

## Technical Implementation

### Session Monitoring Flow
```
1. User logs in → Session stored in localStorage
2. Dashboard loads → useSessionValidation hook starts
3. Every 30 seconds → API call to /validate-session/{user_id}
4. If banned → Clear localStorage + redirect to login + show error
5. Critical actions → Additional session check before execution
```

### Files Modified
- `flask_backend/middleware.py` - Ban status checking utilities
- `flask_backend/routes/auth.py` - Login ban check + session validation endpoint
- `src/hooks/useSessionValidation.ts` - React hook for session monitoring
- `src/services/api.ts` - Session validation API function
- All dashboard components - Integrated session validation

## UI Changes

### Users Table
- Added "Status" column showing Active/Banned status
- Added Ban/Unban button (shield icon)
- Updated Actions column layout

### Confirmation Dialogs
- Ban/Unban confirmation with clear explanation of consequences

## Security Notes
- Only admin users can access these features
- All actions require confirmation dialogs
- **Banned users cannot log in** - login attempts return 403 Forbidden with clear error message
- Banned users' data remains intact but they lose system access
- Login system automatically checks ban status before allowing authentication

## Login Ban Enforcement

### How It Works
- When a user attempts to login, the system checks their ban status
- If `is_banned = TRUE`, login is denied with HTTP 403 status
- Error message: "Your account has been banned. Please contact an administrator."
- Frontend displays this message to the user via toast notification

### Session Invalidation (Real-time Ban Enforcement)
- **Automatic Session Checks**: All dashboards check user ban status every 30 seconds
- **Immediate Logout**: Banned users are automatically logged out with clear notification
- **Critical Action Validation**: Ban operations validate admin session before execution
- **Session Validation API**: `/validate-session/{user_id}` endpoint for real-time checks

### Backend Implementation
- Login route (`/login`) checks for `is_banned` column existence
- Session validation route (`/validate-session/{user_id}`) for ongoing session checks
- Backward compatible - works even if column doesn't exist
- Returns 403 Forbidden for banned users
- Returns 401 Unauthorized for invalid credentials

### Frontend Implementation
- **useSessionValidation Hook**: Automatic session monitoring for all dashboards
- **30-second intervals**: Regular ban status checks while user is active
- **Immediate feedback**: Toast notifications when session becomes invalid
- **Automatic cleanup**: Clears localStorage and redirects to login on ban detection

## Usage
1. Navigate to Admin Dashboard → Users tab
2. Find the user you want to ban/unban
3. Click the Ban/Unban button (shield icon)
4. Confirm the action in the dialog that appears
5. Banned users will immediately lose login access