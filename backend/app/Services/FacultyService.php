<?php

namespace App\Services;

use App\Models\Faculty;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class FacultyService
{
    /**
     * Get all faculty with pagination
     */
    public function getAllFaculty(int $perPage = 15): LengthAwarePaginator
    {
        return Faculty::paginate($perPage);
    }

    /**
     * Get faculty by ID with relationships
     */
    public function getFacultyById(int $facultyId): ?Faculty
    {
        return Faculty::with(['classes'])->find($facultyId);
    }

    /**
     * Get faculty by faculty number
     */
    public function getFacultyByNumber(string $facultyNumber): ?Faculty
    {
        return Faculty::where('faculty_number', $facultyNumber)->first();
    }

    /**
     * Search faculty by name or email
     */
    public function searchFaculty(string $query): Collection
    {
        return Faculty::where('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->orWhere('faculty_number', 'like', "%{$query}%")
            ->get();
    }

    /**
     * Get faculty by department
     */
    public function getFacultyByDepartment(string $department): Collection
    {
        return Faculty::where('department', $department)->get();
    }

    /**
     * Get faculty by employment status
     */
    public function getFacultyByEmploymentStatus(string $status): Collection
    {
        return Faculty::where('employment_status', $status)->get();
    }

    /**
     * Create new faculty
     */
    public function createFaculty(array $data): Faculty
    {
        return Faculty::create($data);
    }

    /**
     * Update faculty information
     */
    public function updateFaculty(int $facultyId, array $data): bool
    {
        $faculty = Faculty::find($facultyId);
        if (!$faculty) {
            return false;
        }
        return $faculty->update($data);
    }

    /**
     * Delete faculty
     */
    public function deleteFaculty(int $facultyId): bool
    {
        $faculty = Faculty::find($facultyId);
        if (!$faculty) {
            return false;
        }
        return $faculty->delete();
    }
}
