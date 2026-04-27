<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Student;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class EventService
{
    /**
     * Get all events with pagination
     */
    public function getAllEvents(int $perPage = 15): LengthAwarePaginator
    {
        return Event::paginate($perPage);
    }

    /**
     * Get all active events
     */
    public function getActiveEvents(): Collection
    {
        return Event::active()->orderBy('event_date', 'asc')->get();
    }

    /**
     * Get upcoming events
     */
    public function getUpcomingEvents(): Collection
    {
        return Event::upcoming()->get();
    }

    /**
     * Get past events
     */
    public function getPastEvents(): Collection
    {
        return Event::past()->get();
    }

    /**
     * Get event by ID with students
     */
    public function getEventById(int $eventId): ?Event
    {
        return Event::with('students')->find($eventId);
    }

    /**
     * Get events by type (Curricular or Extra-Curricular)
     */
    public function getEventsByType(string $type): Collection
    {
        return Event::byType($type)->get();
    }

    /**
     * Get events by status
     */
    public function getEventsByStatus(string $status): Collection
    {
        return Event::byStatus($status)->get();
    }

    /**
     * Search events by name
     */
    public function searchEvents(string $query): Collection
    {
        return Event::where('event_name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->get();
    }

    /**
     * Create a new event
     */
    public function createEvent(array $data): Event
    {
        // Set default enrolled_count to 0
        $data['enrolled_count'] = 0;

        return Event::create($data);
    }

    /**
     * Update an existing event
     */
    public function updateEvent(int $eventId, array $data): ?Event
    {
        $event = Event::find($eventId);
        
        if (!$event) {
            return null;
        }

        $event->update($data);
        return $event;
    }

    /**
     * Delete an event
     */
    public function deleteEvent(int $eventId): bool
    {
        $event = Event::find($eventId);
        
        if (!$event) {
            return false;
        }

        $event->delete();
        return true;
    }

    /**
     * Register a student for an event
     */
    public function registerStudentForEvent(int $studentId, int $eventId): bool
    {
        $event = Event::find($eventId);
        $student = Student::find($studentId);

        if (!$event || !$student) {
            return false;
        }

        // Check if student is already registered
        if ($student->events()->where('event_id', $eventId)->exists()) {
            return false; // Already registered
        }

        // Check capacity if limited
        if ($event->capacity && $event->enrolled_count >= $event->capacity) {
            return false; // No available capacity
        }

        // Register student
        $student->events()->attach($eventId, [
            'participation_status' => 'Registered',
            'points_earned' => 0,
        ]);

        // Increment enrolled count
        $event->increment('enrolled_count');

        return true;
    }

    /**
     * Unregister a student from an event
     */
    public function unregisterStudentFromEvent(int $studentId, int $eventId): bool
    {
        $student = Student::find($studentId);
        $event = Event::find($eventId);

        if (!$student || !$event) {
            return false;
        }

        $student->events()->detach($eventId);
        $event->decrement('enrolled_count');

        return true;
    }

    /**
     * Update student participation status for an event
     */
    public function updateParticipationStatus(int $studentId, int $eventId, string $status): bool
    {
        $student = Student::find($studentId);

        if (!$student) {
            return false;
        }

        $student->events()->updateExistingPivot($eventId, [
            'participation_status' => $status,
        ]);

        return true;
    }

    /**
     * Record points earned by student in event
     */
    public function recordPointsEarned(int $studentId, int $eventId, int $points): bool
    {
        $student = Student::find($studentId);

        if (!$student) {
            return false;
        }

        $student->events()->updateExistingPivot($eventId, [
            'points_earned' => $points,
        ]);

        return true;
    }

    /**
     * Get all students in an event
     */
    public function getEventStudents(int $eventId): Collection
    {
        $event = Event::find($eventId);

        if (!$event) {
            return collect();
        }

        return $event->students()->get();
    }

    /**
     * Get students by participation status in an event
     */
    public function getStudentsByParticipationStatus(int $eventId, string $status): Collection
    {
        $event = Event::find($eventId);

        if (!$event) {
            return collect();
        }

        return $event->students()
                     ->wherePivot('participation_status', $status)
                     ->get();
    }

    /**
     * Get all events a student is registered for
     */
    public function getStudentEvents(int $studentId): Collection
    {
        $student = Student::find($studentId);

        if (!$student) {
            return collect();
        }

        return $student->events()->get();
    }

    /**
     * Get events by student and type
     */
    public function getStudentEventsByType(int $studentId, string $type): Collection
    {
        $student = Student::find($studentId);

        if (!$student) {
            return collect();
        }

        return $student->events()
                       ->where('event_type', $type)
                       ->get();
    }

    /**
     * Get eligible students for an event (those with required skills/affiliations)
     */
    public function getEligibleStudents(int $eventId): Collection
    {
        // This can be customized based on event requirements
        $event = Event::find($eventId);

        if (!$event) {
            return collect();
        }

        // For now, return all students with available capacity
        $registeredStudentIds = $event->students()->pluck('student_id')->toArray();

        return Student::whereNotIn('student_id', $registeredStudentIds)
                      ->where('student_identification', 'Regular')
                      ->get();
    }

    /**
     * Get event statistics
     */
    public function getEventStatistics(int $eventId): array
    {
        $event = Event::find($eventId);

        if (!$event) {
            return [];
        }

        $totalEnrolled = $event->students()->count();
        $attended = $event->students()
                          ->wherePivot('participation_status', 'Attended')
                          ->count();
        $absent = $event->students()
                        ->wherePivot('participation_status', 'Absent')
                        ->count();
        $cancelled = $event->students()
                           ->wherePivot('participation_status', 'Cancelled')
                           ->count();

        return [
            'event_id' => $event->event_id,
            'event_name' => $event->event_name,
            'total_enrolled' => $totalEnrolled,
            'attended' => $attended,
            'absent' => $absent,
            'cancelled' => $cancelled,
            'attendance_rate' => $totalEnrolled > 0 ? round(($attended / $totalEnrolled) * 100, 2) : 0,
            'remaining_capacity' => $event->getRemainingCapacity(),
        ];
    }

    /**
     * Get students with high participation points
     */
    public function getTopPerformers(int $eventId, int $limit = 10): Collection
    {
        $event = Event::find($eventId);

        if (!$event) {
            return collect();
        }

        return $event->students()
                     ->orderByPivot('points_earned', 'desc')
                     ->limit($limit)
                     ->get();
    }
}
