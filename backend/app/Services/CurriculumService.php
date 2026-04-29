<?php

namespace App\Services;

use App\Models\Curriculum;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class CurriculumService
{
    /**
     * Get all curriculum with pagination
     */
    public function getAllCurriculum(int $perPage = 15): LengthAwarePaginator
    {
        return Curriculum::paginate($perPage);
    }

    /**
     * Get curriculum by ID
     */
    public function getCurriculumById(int $curriculumId): ?Curriculum
    {
        return Curriculum::find($curriculumId);
    }

    /**
     * Get curriculum by code
     */
    public function getCurriculumByCode(string $code): ?Curriculum
    {
        return Curriculum::where('curriculum_code', $code)->first();
    }

    /**
     * Get active curriculum
     */
    public function getActiveCurriculum(): Collection
    {
        return Curriculum::where('is_active', true)->get();
    }

    /**
     * Get curriculum by department
     */
    public function getCurriculumByDepartment(string $department): Collection
    {
        return Curriculum::where('department', $department)->get();
    }

    /**
     * Create a new curriculum
     */
    public function createCurriculum(array $data): Curriculum
    {
        return Curriculum::create($data);
    }

    /**
     * Update curriculum
     */
    public function updateCurriculum(int $curriculumId, array $data): ?Curriculum
    {
        $curriculum = Curriculum::find($curriculumId);
        if ($curriculum) {
            $curriculum->update($data);
        }
        return $curriculum;
    }

    /**
     * Delete curriculum
     */
    public function deleteCurriculum(int $curriculumId): bool
    {
        $curriculum = Curriculum::find($curriculumId);
        return $curriculum ? $curriculum->delete() : false;
    }

    /**
     * Search curriculum
     */
    public function searchCurriculum(string $query): Collection
    {
        return Curriculum::where('title', 'like', "%{$query}%")
            ->orWhere('curriculum_code', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->get();
    }
}
