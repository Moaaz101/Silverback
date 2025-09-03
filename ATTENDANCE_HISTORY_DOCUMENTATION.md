# Fighter Attendance History Feature

This feature provides a comprehensive way to track and display a fighter's attendance history, helping to build transparency and trust in your attendance tracking system.

## Features

- View a fighter's complete attendance history
- Filter by date ranges
- See attendance statistics (present, late, absent, excused)
- Export attendance data to CSV
- View detailed attendance records with coach information and notes

## Backend Implementation

The backend API has been extended with a new endpoint:

### `GET /attendance/:id`

Gets all attendance records for a specific fighter.

**Parameters:**
- `id`: Fighter ID (path parameter)
- `startDate`: Optional start date for filtering (query parameter, format: YYYY-MM-DD)
- `endDate`: Optional end date for filtering (query parameter, format: YYYY-MM-DD)

**Response:**
```json
{
  "fighter": {
    "id": 1,
    "name": "John Doe",
    "sessionsLeft": 8
  },
  "attendance": [
    {
      "id": 123,
      "date": "2025-09-01T10:30:00.000Z",
      "status": "present",
      "coachName": "Coach Smith",
      "sessionType": "group",
      "notes": "Good performance"
    }
  ],
  "summary": {
    "totalRecords": 10,
    "present": 7,
    "late": 1,
    "absent": 1,
    "excused": 1
  }
}
```

## Frontend Implementation

The frontend implementation includes:

1. **Fighter Profile Page**: A dedicated page for each fighter accessible at `/fighters/:id`
2. **Attendance History Component**: A reusable component that displays attendance data with filtering capabilities
3. **Navigation Links**: FighterCard component now has a direct link to the fighter's profile

## How to Use

### For Admins

1. Navigate to the Fighters page
2. Click on a fighter card
3. Click "View Full Profile" to open the fighter's profile
4. The profile page shows the fighter's attendance history by default
5. Use the date filters to view attendance for specific time periods
6. Click "Export" to download attendance data as CSV

### For Fighters (when shared)

1. Fighters can be given access to their own profile page
2. They can view their complete attendance history
3. They can verify their session usage
4. They can download their attendance data for record-keeping

## Testing

The `backend/tests/attendance.test.js` file contains test cases for the attendance API endpoints. To run these tests:

1. Set up a test database
2. Configure test environment
3. Run tests using Jest

## Next Steps

Consider adding these enhancements:

1. Calendar view for attendance data
2. Email/PDF export options
3. Student-facing portal with restricted access
4. Attendance notifications for missed sessions

## Technical Notes

- The backend uses transactions to ensure data integrity
- Date boundaries are properly handled to ensure accurate filtering
- The frontend uses React Router for navigation
- The UI matches the existing design system with the purple color scheme
