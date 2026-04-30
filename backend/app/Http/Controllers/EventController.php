<?php

namespace App\Http\Controllers;

use App\Services\EventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    protected EventService $eventService;

    public function __construct(EventService $eventService)
    {
        $this->eventService = $eventService;
    }

    /**
     * GET /api/events
     * Get all events with pagination
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $events = $this->eventService->getAllEvents($perPage);

        return response()->json([
            'success' => true,
            'data' => $events->items(),
            'pagination' => [
                'total' => $events->total(),
                'per_page' => $events->perPage(),
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/events/search
     * Search events by name or description
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Search query must be at least 2 characters',
            ], 400);
        }

        $events = $this->eventService->searchEvents($query);

        return response()->json([
            'success' => true,
            'data' => $events,
        ]);
    }

    /**
     * GET /api/events/type/{type}
     * Get events by type (Curricular or Extra-Curricular)
     */
    public function getByType(string $type): JsonResponse
    {
        $validTypes = ['Curricular', 'Extra-Curricular'];

        if (!in_array($type, $validTypes)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid event type. Must be Curricular or Extra-Curricular',
            ], 400);
        }

        $events = $this->eventService->getEventsByType($type);

        return response()->json([
            'success' => true,
            'count' => count($events),
            'data' => $events,
        ]);
    }

    /**
     * GET /api/events/status/{status}
     * Get events by status
     */
    public function getByStatus(string $status): JsonResponse
    {
        $validStatuses = ['Pending', 'Active', 'Ongoing', 'Completed', 'Cancelled'];

        if (!in_array($status, $validStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid event status',
            ], 400);
        }

        $events = $this->eventService->getEventsByStatus($status);

        return response()->json([
            'success' => true,
            'count' => count($events),
            'data' => $events,
        ]);
    }

    /**
     * GET /api/events/upcoming
     * Get upcoming events
     */
    public function getUpcoming(): JsonResponse
    {
        $events = $this->eventService->getUpcomingEvents();

        return response()->json([
            'success' => true,
            'count' => count($events),
            'data' => $events,
        ]);
    }

    /**
     * GET /api/events/past
     * Get past events
     */
    public function getPast(): JsonResponse
    {
        $events = $this->eventService->getPastEvents();

        return response()->json([
            'success' => true,
            'count' => count($events),
            'data' => $events,
        ]);
    }

    /**
     * GET /api/events/{id}
     * Get event by ID with students
     */
    public function show(int $id): JsonResponse
    {
        $event = $this->eventService->getEventById($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $event,
        ]);
    }

    /**
     * POST /api/events
     * Create new event
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_name' => 'required|unique:event,event_name|string|max:255',
            'event_type' => 'required|in:Curricular,Extra-Curricular',
            'description' => 'nullable|string',
            'objectives' => 'nullable|string',
            'event_date' => 'required|date_format:Y-m-d|after_or_equal:today',
            'start_time' => 'nullable|date_format:H:i:s',
            'end_time' => 'nullable|date_format:H:i:s',
            'location' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer|min:1',
            'event_status' => 'nullable|in:Pending,Active,Ongoing,Completed,Cancelled',
            'requirements' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $event = $this->eventService->createEvent($validated);

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'data' => $event,
        ], 201);
    }

    /**
     * PUT /api/events/{id}
     * Update event
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'event_name' => 'sometimes|string|max:255|unique:event,event_name,' . $id . ',event_id',
            'event_type' => 'sometimes|in:Curricular,Extra-Curricular',
            'description' => 'nullable|string',
            'objectives' => 'nullable|string',
            'event_date' => 'sometimes|date_format:Y-m-d',
            'start_time' => 'nullable|date_format:H:i:s',
            'end_time' => 'nullable|date_format:H:i:s',
            'location' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer|min:1',
            'event_status' => 'nullable|in:Pending,Active,Ongoing,Completed,Cancelled',
            'requirements' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $event = $this->eventService->updateEvent($id, $validated);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
            'data' => $event,
        ]);
    }

    /**
     * DELETE /api/events/{id}
     * Delete event
     */
    public function destroy(int $id): JsonResponse
    {
        $success = $this->eventService->deleteEvent($id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully',
        ]);
    }

    /**
     * POST /api/events/{eventId}/register/{studentId}
     * Register student for event
     */
    public function registerStudent(Request $request, int $eventId, int $studentId): JsonResponse
    {
        $user = $request->user();
        
        // Authorization: Students can only register themselves, admins/staff can register anyone
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Please log in',
            ], 401);
        }
        
        // Check if user is a student trying to register someone else (or not admin/staff)
        if (!$user->hasAnyRole(['Admin', 'Staff'])) {
            $userStudent = $user->student;
            if (!$userStudent || $userStudent->student_id !== $studentId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden - You can only register yourself for events',
                ], 403);
            }
        }

        $success = $this->eventService->registerStudentForEvent($studentId, $eventId);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to register student. Event or student not found, already registered, or no capacity available.',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Student registered for event successfully',
        ]);
    }

    /**
     * DELETE /api/events/{eventId}/unregister/{studentId}
     * Unregister student from event
     */
    public function unregisterStudent(Request $request, int $eventId, int $studentId): JsonResponse
    {
        $user = $request->user();
        
        // Authorization: Students can only unregister themselves, admins/staff can unregister anyone
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Please log in',
            ], 401);
        }
        
        // Check if user is a student trying to unregister someone else (or not admin/staff)
        if (!$user->hasAnyRole(['Admin', 'Staff'])) {
            $userStudent = $user->student;
            if (!$userStudent || $userStudent->student_id !== $studentId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden - You can only unregister yourself from events',
                ], 403);
            }
        }

        $success = $this->eventService->unregisterStudentFromEvent($studentId, $eventId);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unregister student',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Student unregistered from event successfully',
        ]);
    }

    /**
     * GET /api/events/{eventId}/students
     * Get all students in an event
     */
    public function getEventStudents(int $eventId): JsonResponse
    {
        $students = $this->eventService->getEventStudents($eventId);

        if ($students->isEmpty() && !$this->eventService->getEventById($eventId)) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'count' => count($students),
            'data' => $students,
        ]);
    }

    /**
     * GET /api/events/{eventId}/students/{status}
     * Get students by participation status
     */
    public function getStudentsByStatus(int $eventId, string $status): JsonResponse
    {
        $validStatuses = ['Registered', 'Attended', 'Absent', 'Cancelled'];

        if (!in_array($status, $validStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid participation status',
            ], 400);
        }

        $students = $this->eventService->getStudentsByParticipationStatus($eventId, $status);

        return response()->json([
            'success' => true,
            'count' => count($students),
            'data' => $students,
        ]);
    }

    /**
     * PUT /api/events/{eventId}/students/{studentId}/participation-status
     * Update participation status
     */
    public function updateParticipationStatus(Request $request, int $eventId, int $studentId): JsonResponse
    {
        $validated = $request->validate([
            'participation_status' => 'required|in:Registered,Attended,Absent,Cancelled',
        ]);

        $success = $this->eventService->updateParticipationStatus(
            $studentId,
            $eventId,
            $validated['participation_status']
        );

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Participation status updated successfully',
        ]);
    }

    /**
     * PUT /api/events/{eventId}/students/{studentId}/points
     * Record points earned
     */
    public function recordPoints(Request $request, int $eventId, int $studentId): JsonResponse
    {
        $validated = $request->validate([
            'points_earned' => 'required|integer|min:0',
        ]);

        $success = $this->eventService->recordPointsEarned(
            $studentId,
            $eventId,
            $validated['points_earned']
        );

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Points recorded successfully',
        ]);
    }

    /**
     * GET /api/events/{eventId}/statistics
     * Get event statistics
     */
    public function getStatistics(int $eventId): JsonResponse
    {
        $stats = $this->eventService->getEventStatistics($eventId);

        if (empty($stats)) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * GET /api/events/{eventId}/top-performers
     * Get top performers in event
     */
    public function getTopPerformers(Request $request, int $eventId): JsonResponse
    {
        $limit = $request->query('limit', 10);
        $students = $this->eventService->getTopPerformers($eventId, $limit);

        return response()->json([
            'success' => true,
            'count' => count($students),
            'data' => $students,
        ]);
    }
}
