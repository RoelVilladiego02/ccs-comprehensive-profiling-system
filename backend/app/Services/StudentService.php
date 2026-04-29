<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Faculty;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class StudentService
{
    protected GradeService $gradeService;

    public function __construct(GradeService $gradeService)
    {
        $this->gradeService = $gradeService;
    }
    /**
     * Get all students with pagination and GPA
     */
    public function getAllStudents(int $perPage = 15): LengthAwarePaginator
    {
        $students = Student::paginate($perPage);
        
        // Add GPA to each student
        $students->getCollection()->transform(function ($student) {
            $student->gpa = $this->gradeService->getStudentGPA($student->student_id);
            return $student;
        });
        
        return $students;
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
     * Search students by name or email with GPA
     */
    public function searchStudents(string $query): Collection
    {
        $students = Student::where('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->orWhere('student_number', 'like', "%{$query}%")
            ->get();
        
        return $this->attachGPAToStudents($students);
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
            $query->where('organization_type', 'like', "%{$affiliationType}%");
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
     * Get students assigned to a specific faculty (by faculty_id) with GPA
     * Faculty can only see students enrolled in their classes
     */
    public function getStudentsByFaculty(int $facultyId, int $perPage = 15): LengthAwarePaginator
    {
        $students = Student::whereHas('classStatuses', function ($query) use ($facultyId) {
            $query->whereHas('class', function ($classQuery) use ($facultyId) {
                $classQuery->where('faculty_id', $facultyId);
            });
        })->distinct()->paginate($perPage);

        // Add GPA to each student
        $students->getCollection()->transform(function ($student) {
            $student->gpa = $this->gradeService->getStudentGPA($student->student_id);
            return $student;
        });

        return $students;
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
            $query->where('organization_type', 'like', "%{$affiliationType}%");
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

    /**
     * Get skills grouped by category with all skill names
     * Format: { "Communication": ["Basketball", "Leadership"], "Technical": ["Programming", ...] }
     */
    public function getSkillsByCategory(int $facultyId = null): array
    {
        $query = \App\Models\Skills::query();

        if ($facultyId) {
            $query->whereHas('student', function ($q) use ($facultyId) {
                $q->whereHas('classStatuses', function ($classQ) use ($facultyId) {
                    $classQ->whereHas('class', function ($cQ) use ($facultyId) {
                        $cQ->where('faculty_id', $facultyId);
                    });
                });
            });
        }

        // Get all skills and group them by category
        $skills = $query->select('skill_category', 'skill_name')
            ->get()
            ->groupBy('skill_category')
            ->map(function($group) {
                return $group->pluck('skill_name')
                    ->unique()
                    ->values()
                    ->toArray();
            })
            ->toArray();

        return $skills;
    }

    /**
     * Get affiliations grouped by organization type with all organization names
     * Format: { "Professional": ["Org A", "Org B"], "Sports": ["Club X", ...] }
     */
    public function getAffiliationsByType(int $facultyId = null): array
    {
        $query = \App\Models\Affiliation::query();

        if ($facultyId) {
            $query->whereHas('student', function ($q) use ($facultyId) {
                $q->whereHas('classStatuses', function ($classQ) use ($facultyId) {
                    $classQ->whereHas('class', function ($cQ) use ($facultyId) {
                        $cQ->where('faculty_id', $facultyId);
                    });
                });
            });
        }

        // Get all affiliations and group them by organization type
        $affiliations = $query->select('organization_type', 'organization_name')
            ->get()
            ->groupBy('organization_type')
            ->map(function($group) {
                return $group->pluck('organization_name')
                    ->unique()
                    ->values()
                    ->toArray();
            })
            ->toArray();

        return $affiliations;
    }

    /**
     * Attach GPA (0-4.0 scale) to a collection of students
     */
    protected function attachGPAToStudents(Collection $students): Collection
    {
        return $students->map(function ($student) {
            $student->gpa = $this->gradeService->getStudentGPA($student->student_id);
            return $student;
        });
    }
}
