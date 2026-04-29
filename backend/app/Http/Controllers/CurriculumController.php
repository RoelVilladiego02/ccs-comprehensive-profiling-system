<?php

namespace App\Http\Controllers;

use App\Services\CurriculumService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurriculumController extends Controller
{
    protected CurriculumService $curriculumService;

    public function __construct(CurriculumService $curriculumService)
    {
        $this->curriculumService = $curriculumService;
    }

    /**
     * GET /api/curriculum
     * Get all curriculum
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $curriculum = $this->curriculumService->getAllCurriculum($perPage);

        return response()->json([
            'success' => true,
            'data' => $curriculum->items(),
            'pagination' => [
                'total' => $curriculum->total(),
                'per_page' => $curriculum->perPage(),
                'current_page' => $curriculum->currentPage(),
                'last_page' => $curriculum->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/curriculum/search
     * Search curriculum
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

        $curriculum = $this->curriculumService->searchCurriculum($query);

        return response()->json([
            'success' => true,
            'data' => $curriculum,
        ]);
    }

    /**
     * GET /api/curriculum/active
     * Get active curriculum
     */
    public function getActive(): JsonResponse
    {
        $curriculum = $this->curriculumService->getActiveCurriculum();

        return response()->json([
            'success' => true,
            'data' => $curriculum,
        ]);
    }

    /**
     * GET /api/curriculum/{id}
     * Get curriculum by ID
     */
    public function show(int $id): JsonResponse
    {
        $curriculum = $this->curriculumService->getCurriculumById($id);

        if (!$curriculum) {
            return response()->json([
                'success' => false,
                'message' => 'Curriculum not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $curriculum,
        ]);
    }

    /**
     * POST /api/curriculum
     * Create a new curriculum
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'curriculum_code' => 'required|string|max:20|unique:curriculum,curriculum_code',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'department' => 'nullable|string|max:100',
            'total_credits' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        try {
            $curriculum = $this->curriculumService->createCurriculum($validated);

            return response()->json([
                'success' => true,
                'message' => 'Curriculum created successfully',
                'data' => $curriculum,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create curriculum: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PUT /api/curriculum/{id}
     * Update curriculum
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $curriculum = $this->curriculumService->getCurriculumById($id);

        if (!$curriculum) {
            return response()->json([
                'success' => false,
                'message' => 'Curriculum not found',
            ], 404);
        }

        $validated = $request->validate([
            'curriculum_code' => 'sometimes|string|max:20|unique:curriculum,curriculum_code,' . $id . ',curriculum_id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'department' => 'nullable|string|max:100',
            'total_credits' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        try {
            $updated = $this->curriculumService->updateCurriculum($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Curriculum updated successfully',
                'data' => $updated,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update curriculum: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/curriculum/{id}
     * Delete curriculum
     */
    public function destroy(int $id): JsonResponse
    {
        $curriculum = $this->curriculumService->getCurriculumById($id);

        if (!$curriculum) {
            return response()->json([
                'success' => false,
                'message' => 'Curriculum not found',
            ], 404);
        }

        try {
            $this->curriculumService->deleteCurriculum($id);

            return response()->json([
                'success' => true,
                'message' => 'Curriculum deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete curriculum: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/curriculum/department/{department}
     * Get curriculum by department
     */
    public function getByDepartment(string $department): JsonResponse
    {
        $curriculum = $this->curriculumService->getCurriculumByDepartment($department);

        return response()->json([
            'success' => true,
            'data' => $curriculum,
        ]);
    }
}
