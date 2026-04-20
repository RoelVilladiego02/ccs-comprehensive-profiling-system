# Admin Class Management Feature

## Overview
The Admin Class Management component provides a comprehensive interface for managing classes and assigning faculty to sections. This replaces the "coming soon" placeholder in the Scheduling Module.

## Features

### ✅ Implemented Features
- **Class Listing**: View all classes with sortable columns for course code, faculty, semester, and status
- **Search Functionality**: Search classes by course code, course name, section, or faculty name
- **Create Classes**: Add new classes with:
  - Course selection
  - Faculty assignment
  - Section identifier
  - Academic year and semester
  - Schedule details (day, start time, end time)
  - Room assignment
  - Max student capacity
  - Status (Open/Closed/Cancelled)
- **Edit Classes**: Modify any existing class details
- **Delete Classes**: Remove classes with confirmation dialog
- **Sort by Columns**: Click on course code, faculty, semester, or status headers to sort
- **Responsive Design**: Works on desktop and mobile devices

## User Interface

### Sections Tab Integration
The feature is now integrated into the **Scheduling Module** under the **Sections** tab. When you click on the Sections tab, you'll see the full class management interface instead of a "coming soon" message.

### Main Views

#### List View (Default)
- Displays all classes in a table format
- Shows: Course Code, Course Name, Section, Faculty, Academic Year, Semester, Schedule, Room, Student Count, Status
- Includes search bar and sorting options
- Action buttons: Edit and Delete for each row
- "Add New Class" button to create new classes

#### Form View (Create/Edit)
- Appears when clicking "Add New Class" or "Edit" on a class
- Form fields for all class attributes
- Required fields marked with red asterisk (*)
- Form validation with error messages
- Cancel button to return to list view

## Backend API Integration

The component communicates with these API endpoints:

```
GET    /api/classes              - List all classes (paginated)
GET    /api/classes/{id}         - Get class details
POST   /api/classes              - Create new class
PUT    /api/classes/{id}         - Update existing class
DELETE /api/classes/{id}         - Delete class
GET    /api/courses              - List courses (for dropdown)
GET    /api/faculty              - List faculty (for dropdown)
```

## Required Permissions

Users must have the following permissions to use this feature:
- `classes.view` - To view class list
- `classes.create` - To create new classes
- `classes.edit` - To edit existing classes
- `classes.delete` - To delete classes

## Usage Example

### Creating a New Class
1. Go to Scheduling Module → Sections tab
2. Click "Add New Class" button
3. Fill in the form:
   - Select a Course
   - Select a Faculty member
   - Enter Section (e.g., "A", "B", "C")
   - Set Academic Year
   - Select Semester
   - Enter Schedule details
   - Assign a Room
   - Set Max Students capacity
   - Select Status
4. Click "Create Class"

### Editing a Class
1. Go to Scheduling Module → Sections tab
2. Find the class in the list
3. Click "Edit" button
4. Modify the desired fields
5. Click "Update Class"

### Deleting a Class
1. Go to Scheduling Module → Sections tab
2. Find the class in the list
3. Click "Delete" button
4. Confirm the deletion in the dialog

### Searching for Classes
1. Go to Scheduling Module → Sections tab
2. Use the search bar at the top
3. Type any part of: course code, course name, section, or faculty name
4. Results update in real-time as you type

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AdminClassManagement.jsx    (New)
│   │   ├── SchedulingModule.jsx        (Updated)
│   │   └── ...
│   ├── services/
│   │   └── api.js                       (Contains classAPI)
│   ├── styles/
│   │   ├── AdminDashboard.css           (New)
│   │   └── ...
│   └── ...
└── ...
```

## Component Dependencies

- React hooks: `useState`, `useEffect`
- API Service: `classAPI`, `courseAPI`, `facultyAPI` from `services/api.js`
- CSS: `AdminDashboard.css`

## Error Handling

The component includes comprehensive error handling:
- Missing required fields validation
- API request error messages
- User confirmation for destructive actions (delete)
- Success/error notifications via alerts
- Loading states during operations

## Styling

The component uses a professional color scheme:
- Primary color: `#667eea` (purple gradient)
- Success: `#2e7d32` (green)
- Error: `#c62828` (red)
- Warning: `#e65100` (orange)
- Neutral: Grays for backgrounds and borders

All styles are responsive and tested on mobile, tablet, and desktop views.

## Next Steps / Future Enhancements

Potential improvements for future versions:
- Bulk import/export of classes (CSV)
- Class capacity management and waitlist
- Conflict detection (room/faculty/time conflicts)
- Schedule template system
- Class duplication feature
- Attendance tracking integration
- Grade synchronization with classes

## Troubleshooting

### Classes not loading
- Verify the backend API is running and accessible
- Check that you have `classes.view` permission
- Check browser console for API errors

### Cannot create/edit classes
- Ensure you have `classes.create` or `classes.edit` permissions
- Verify all required fields are filled
- Check that the selected course and faculty exist in the system

### Search not working
- Try clearing the search box and searching again
- Ensure the classes are actually in the system
- Check spelling of search terms

## Support

For issues or questions about the class management system, contact the development team or check the main project README.
