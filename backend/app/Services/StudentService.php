<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Faculty;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class StudentService
{
    /**
     * Get all students with pagination
     */
    public function getAllStudents(int $perPage = 15): LengthAwarePaginator
    {
        return Student::paginate($perPage);
    }

    /**
     * Get student by ID with all relationships
     */
    public function getStudentById(int $studentId): ?Student
    {
        return Student::with([
            'classStatuses',
            'programs',
            'attendance',
            'grades',
            'violations',
            'medicalRecords',
            'affiliations',
            'academicHistory',
            'nonAcademicHistory',
            'skills'
        ])->find($studentId);
    }

    /**
     * Get student by student number
     */
    public function getStudentByNumber(string $studentNumber): ?Student
    {
        return Student::where('student_number', $studentNumber)->first();
    }

    /**
     * Search students by name or email
     */
    public function searchStudents(string $query): Collection
    {
        return Student::where('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->orWhere('student_number', 'like', "%{$query}%")
            ->get();
    }

    /**
     * Create new student
     */
    public function createStudent(array $data): Student
    {
        return Student::create($data);
    }

    /**
     * Update student information
     */
    public function updateStudent(int $studentId, array $data): bool
    {
        $student = Student::find($studentId);
        if (!$student) {
            return false;
        }
        return $student->update($data);
    }

    /**
     * Delete student
     */
    public function deleteStudent(int $studentId): bool
    {
        $student = Student::find($studentId);
        if (!$student) {
            return false;
        }
        return $student->delete();
    }

    /**
     * Get students by identification status
     */
    public function getStudentsByStatus(string $status): Collection
    {
        return Student::where('student_identification', $status)->get();
    }

    /**
     * Get students by curriculum
     */
    public function getStudentsByCurriculum(string $curriculum): Collection
    {
        return Student::where('curriculum', $curriculum)->get();
    }

    /**
     * Get students by skill name
     */
    public function getStudentsBySkill(string $skillName): Collection
    {
        return Student::whereHas('skills', function ($query) use ($skillName) {
            $query->where('skill_name', 'like', "%{$skillName}%");
        })
        ->with('skills')
        ->get();
    }

    /**
     * Get students by affiliation type
     */
    public function getStudentsByAffiliation(string $affiliationType): Collection
    {
        return Student::whereHas('affiliations', function ($query) use ($affiliationType) {
            $query->where('affiliation_type', 'like', "%{$affiliationType}%");
        })
        ->with('affiliations')
        ->get();
    }

    /**
     * Get available skills
     */
    public function getAvailableSkills()
    {
        return \App\Models\Skills::select('skill_category')
            ->distinct()
            ->pluck('skill_category')
            ->values();
    }

    /**
     * Get available affiliation types
     */
    public function getAvailableAffiliationTypes()
    {
        return \App\Models\Affiliation::select('organization_type')
            ->distinct()
            ->pluck('organization_type')
            ->values();
    }

    /**
     * Get students assigned to a specific faculty (by faculty_id)
     * Faculty can only see students enrolled in their classes
     */
    public function getStudentsByFaculty(int $facultyId, int $perPage = 15): LengthAwarePaginator
    {
        return Student::whereHas('classStatuses', function ($query) use ($facultyId) {
            $query->whereHas('class', function ($classQuery) use ($facultyId) {
                $classQuery->where('faculty_id', $facultyId);
            });
        })->distinct()->paginate($perPage);
    }

    /**
     * Search students by name/email/number assigned to a specific faculty
     */
    public function searchStudentsByFaculty(string $query, int $facultyId): Collection
    {
        return Student::whereHas('classStatuses', function ($q) use ($facultyId) {
            $q->whereHas('class', function ($classQuery) use ($facultyId) {
                $classQuery->where('faculty_id', $facultyId);
            });
        })
        ->where(function ($q) use ($query) {
            $q->where('first_name', 'like', "%{$query}%")
                ->orWhere('last_name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->orWhere('student_number', 'like', "%{$query}%");
        })
        ->distinct()
        ->get();
    }

    /**
     * Get students by skill and faculty
     */
    public function getStudentsBySkillAndFaculty(string $skillName, int $facultyId): Collection
    {
        return Student::whereHas('classStatuses', function ($q) use ($facultyId) {
            $q->whereHas('class', function ($classQuery) use ($facultyId) {
                $classQuery->where('faculty_id', $facultyId);
            });
        })
        ->whereHas('skills', function ($query) use ($skillName) {
            $query->where('skill_name', 'like', "%{$skillName}%");
        })
        ->with('skills')
        ->distinct()
        ->get();
    }

    /**
     * Get students by affiliation and faculty
     */
    public function getStudentsByAffiliationAndFaculty(string $affiliationType, int $facultyId): Collection
    {
        return Student::whereHas('classStatuses', function ($q) use ($facultyId) {
            $q->whereHas('class', function ($classQuery) use ($facultyId) {
                $classQuery->where('faculty_id', $facultyId);
            });
        })
        ->whereHas('affiliations', function ($query) use ($affiliationType) {
            $query->where('affiliation_type', 'like', "%{$affiliationType}%");
        })
        ->with('affiliations')
        ->distinct()
        ->get();
    }

    /**
     * Get available skills for a specific faculty's students
     */
    public function getAvailableSkillsForFaculty(int $facultyId)
    {
        return Student::whereHas('classStatuses', function ($q) use ($facultyId) {
            $q->whereHas('class', function ($classQuery) use ($facultyId) {
                $classQuery->where('faculty_id', $facultyId);
            });
        })
        ->whereHas('skills')
        ->with('skills')
        ->get()
        ->flatMap(fn($student) => $student->skills)
        ->pluck('skill_category')
        ->unique()
        ->values();
    }

    /**
     * Get available affiliation types for a specific faculty's students
     */
    public function getAvailableAffiliationTypesForFaculty(int $facultyId)
    {
        return Student::whereHas('classStatuses', function ($q) use ($facultyId) {
            $q->whereHas('class', function ($classQuery) use ($facultyId) {
                $classQuery->where('faculty_id', $facultyId);
            });
        })
        ->whereHas('affiliations')
        ->with('affiliations')
        ->get()
        ->flatMap(fn($student) => $student->affiliations)
        ->pluck('organization_type')
        ->unique()
        ->values();
    }
}
