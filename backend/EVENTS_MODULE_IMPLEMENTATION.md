# Events Module Implementation Guide

## Overview
The Events Module is now fully implemented in the backend with complete CRUD operations, student enrollment management, and participation tracking. This module enables tracking of curricular and extra-curricular events with comprehensive statistics.

## Module Components

### 1. Database Models

#### Event Model (`app/Models/Event.php`)
- **Table**: `event`
- **Primary Key**: `event_id` (auto-increment)
- **Relationships**: 
  - `students()` - BelongsToMany through `student_event` pivot table

**Fields:**
- `event_name` (string, unique) - Event name
- `event_type` (enum: Curricular, Extra-Curricular) - Type of event
- `description` (text, nullable) - Event description
- `objectives` (text, nullable) - Event objectives
- `event_date` (date) - Date of the event
- `start_time` (time, nullable) - Event start time
- `end_time` (time, nullable) - Event end time
- `location` (string, nullable) - Event location
- `capacity` (integer, nullable) - Maximum capacity (NULL for unlimited)
- `enrolled_count` (integer) - Current enrollment count
- `event_status` (enum: Pending, Active, Ongoing, Completed, Cancelled) - Status
- `requirements` (text, nullable) - Event requirements
- `is_active` (boolean) - Active status
- `timestamps` - created_at, updated_at

**Query Scopes:**
- `active()` - Get active events only
- `upcoming()` - Get future events ordered by date
- `past()` - Get completed events
- `byType($type)` - Filter by event type
- `byStatus($status)` - Filter by status
- `availableCapacity()` - Events with available capacity

**Helper Methods:**
- `hasAvailableCapacity()` - Check if event has capacity
- `getRemainingCapacity()` - Get remaining spots
- `isToday()` - Check if event is today
- `isUpcoming()` - Check if event is upcoming
- `isPast()` - Check if event has passed

#### Student-Event Pivot Table (`student_event`)
- **Enrollment ID**: `enrollment_id` (auto-increment)
- **Fields**:
  - `student_id` - Foreign key to student
  - `event_id` - Foreign key to event
  - `participation_status` (enum: Registered, Attended, Absent, Cancelled)
  - `points_earned` (integer, default 0) - Points for event participation
  - `notes` (text, nullable) - Additional notes
  - `timestamps` - created_at, updated_at

### 2. Service Layer

#### EventService (`app/Services/EventService.php`)

**Query Methods:**
- `getAllEvents(perPage)` - Get paginated events
- `getActiveEvents()` - Get active events
- `getUpcomingEvents()` - Get upcoming events
- `getPastEvents()` - Get past events
- `getEventById(eventId)` - Get event with students
- `getEventsByType(type)` - Filter by type
- `getEventsByStatus(status)` - Filter by status
- `searchEvents(query)` - Search by name/description
- `getEventStatistics(eventId)` - Event statistics (attendance rate, etc.)
- `getTopPerformers(eventId, limit)` - Top scoring students

**CRUD Methods:**
- `createEvent(data)` - Create new event
- `updateEvent(eventId, data)` - Update event
- `deleteEvent(eventId)` - Delete event

**Enrollment Methods:**
- `registerStudentForEvent(studentId, eventId)` - Register student
- `unregisterStudentFromEvent(studentId, eventId)` - Unregister student
- `updateParticipationStatus(studentId, eventId, status)` - Update status
- `recordPointsEarned(studentId, eventId, points)` - Record points

**Relationship Methods:**
- `getEventStudents(eventId)` - Get all students in event
- `getStudentsByParticipationStatus(eventId, status)` - Filter by status
- `getStudentEvents(studentId)` - Get student's events
- `getStudentEventsByType(studentId, type)` - Get student's events by type
- `getEligibleStudents(eventId)` - Get eligible students

### 3. Controller

#### EventController (`app/Http/Controllers/EventController.php`)

**API Endpoints:**

#### Event Listing & Search
```
GET /api/events
- Query params: per_page (default: 15)
- Returns: Paginated list of events with pagination metadata

GET /api/events/search?q={query}
- Search in event_name and description
- Returns: Matching events

GET /api/events/upcoming
- Returns: Future events ordered by date

GET /api/events/past
- Returns: Completed events ordered by date

GET /api/events/type/{type}
- Path params: type (Curricular or Extra-Curricular)
- Returns: Events of specified type

GET /api/events/status/{status}
- Path params: status (Pending, Active, Ongoing, Completed, Cancelled)
- Returns: Events with specified status
```

#### Event CRUD Operations
```
GET /api/events/{eventId}
- Returns: Single event with all enrolled students

POST /api/events
- Permission: events.create
- Body: {
    event_name (required): string,
    event_type (required): "Curricular" or "Extra-Curricular",
    description: string,
    objectives: string,
    event_date (required): "YYYY-MM-DD",
    start_time: "HH:MM:SS",
    end_time: "HH:MM:SS",
    location: string,
    capacity: integer,
    event_status: string,
    requirements: string,
    is_active: boolean
  }
- Returns: Created event object (201)

PUT /api/events/{eventId}
- Permission: events.edit
- Body: (same as POST, all fields optional)
- Returns: Updated event object

DELETE /api/events/{eventId}
- Permission: events.delete
- Returns: Success message
```

#### Student Enrollment Management
```
POST /api/events/{eventId}/register/{studentId}
- Permission: events.manage_students
- Returns: Success message
- Checks: Duplicate registration, capacity, event exists

DELETE /api/events/{eventId}/unregister/{studentId}
- Permission: events.manage_students
- Returns: Success message

GET /api/events/{eventId}/students
- Returns: All students enrolled in event with pivot data

GET /api/events/{eventId}/students/{status}
- Path params: status (Registered, Attended, Absent, Cancelled)
- Returns: Students filtered by participation status

PUT /api/events/{eventId}/students/{studentId}/participation-status
- Permission: events.manage_students
- Body: { participation_status: "Attended|Absent|Cancelled" }
- Returns: Success message

PUT /api/events/{eventId}/students/{studentId}/points
- Permission: events.manage_students
- Body: { points_earned: integer }
- Returns: Success message
```

#### Statistics & Reports
```
GET /api/events/{eventId}/statistics
- Returns: {
    event_id: int,
    event_name: string,
    total_enrolled: int,
    attended: int,
    absent: int,
    cancelled: int,
    attendance_rate: float (percentage),
    remaining_capacity: int|null
  }

GET /api/events/{eventId}/top-performers?limit={limit}
- Query params: limit (default: 10)
- Returns: Top students by points earned
```

### 4. Routes Configuration

**API Prefix**: `/api/events`
**Base Middleware**: `auth:sanctum`, `active.user`, `permission:events.view`

**Route Groups:**
- Public query routes: available to all authenticated users
- Protected CRUD routes: require specific permissions
- Admin-only routes: require Admin role

See `routes/api.php` for complete route configuration.

### 5. Permissions

**Event-Related Permissions:**
- `events.view` - View events
- `events.create` - Create new events
- `events.edit` - Edit existing events
- `events.delete` - Delete events
- `events.manage_students` - Manage student enrollment

**Role Assignments:**
- **Admin**: All event permissions
- **Faculty**: view, create, manage_students
- **Staff**: view, create, edit, manage_students
- **Student**: view only

## Database Migrations

**Migration 1**: `2026_04_27_000001_create_event_table.php`
- Creates main `event` table with indexes

**Migration 2**: `2026_04_27_000002_create_student_event_table.php`
- Creates `student_event` pivot table with constraints
- Unique constraint: (student_id, event_id) per enrollment
- Cascade delete on both foreign keys

## Request Validation

### Event Creation/Update Validation Rules:
```php
'event_name' => 'required|unique:event,event_name|string|max:255'
'event_type' => 'required|in:Curricular,Extra-Curricular'
'description' => 'nullable|string'
'objectives' => 'nullable|string'
'event_date' => 'required|date_format:Y-m-d|after_or_equal:today'
'start_time' => 'nullable|date_format:H:i:s'
'end_time' => 'nullable|date_format:H:i:s'
'location' => 'nullable|string|max:255'
'capacity' => 'nullable|integer|min:1'
'event_status' => 'nullable|in:Pending,Active,Ongoing,Completed,Cancelled'
'requirements' => 'nullable|string'
'is_active' => 'nullable|boolean'
```

## Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message"
}
```

Paginated responses include:
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "total": 100,
    "per_page": 15,
    "current_page": 1,
    "last_page": 7
  }
}
```

## Integration Examples

### Create an Event
```bash
POST /api/events
Content-Type: application/json
Authorization: Bearer {token}

{
  "event_name": "Annual Basketball Championship",
  "event_type": "Extra-Curricular",
  "description": "Inter-class basketball tournament",
  "event_date": "2024-05-15",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "location": "Sports Complex",
  "capacity": 100,
  "event_status": "Pending",
  "is_active": true
}
```

### Register Student for Event
```bash
POST /api/events/1/register/42
Authorization: Bearer {token}
```

### Update Participation Status
```bash
PUT /api/events/1/students/42/participation-status
Content-Type: application/json
Authorization: Bearer {token}

{
  "participation_status": "Attended"
}
```

### Get Event Statistics
```bash
GET /api/events/1/statistics
Authorization: Bearer {token}
```

## Upcoming Features (For Frontend)

1. **Events Dashboard Component** - Display all events
2. **Event Details Component** - Show single event with students
3. **Student Event Registration** - Self-service registration
4. **Event Attendance Marking** - Mark attendance status
5. **Event Reports** - Statistics and performance reports
6. **Calendar View** - Display events on calendar
7. **Event Filtering** - Filter by type, status, date range
8. **Student Event History** - View personal event participation

## Testing

### Test Event Creation
```php
$this->post('/api/events', [
    'event_name' => 'Test Event',
    'event_type' => 'Curricular',
    'event_date' => now()->addDay()->format('Y-m-d'),
    'capacity' => 50,
])->assertStatus(201);
```

### Test Student Registration
```php
$this->post("/api/events/{$eventId}/register/{$studentId}")
    ->assertStatus(200);
```

### Test Capacity Limits
```php
// Fill event to capacity
for ($i = 0; $i < $event->capacity; $i++) {
    $this->registerStudentForEvent($studentIds[$i], $eventId);
}
// Next registration should fail
$this->post("/api/events/{$eventId}/register/{$studentIds[$event->capacity]}")
    ->assertStatus(400);
```

## Deployment Notes

1. Run migrations:
   ```bash
   php artisan migrate
   ```

2. Seed permissions:
   ```bash
   php artisan db:seed --class=RolePermissionSeeder
   ```

3. Clear config cache:
   ```bash
   php artisan config:cache
   ```

4. Verify event endpoints:
   ```bash
   php artisan route:list | grep events
   ```

## Support & Troubleshooting

**Permissions denied?**
- Check user role and assigned permissions
- Verify role_permission_assignments table
- Ensure middleware is properly configured

**Capacity checks failing?**
- Verify capacity field is not NULL
- Check enrolled_count is being incremented
- Test with events that have NULL capacity (unlimited)

**Pivot data not saving?**
- Verify student_event pivot table exists
- Check student and event IDs are valid
- Ensure withPivot() in model relationships

## Additional Resources

- **Model Scopes**: Used in query optimization
- **Eager Loading**: Use `with('students')` to avoid N+1 queries
- **Pagination**: Default 15 per page, configurable
- **Timestamps**: All operations tracked with created_at, updated_at
- **Soft Deletes**: Not implemented; use `is_active` flag instead

---

*Last Updated: April 27, 2026*
*Module Status: FULLY IMPLEMENTED - Ready for Frontend Development*
