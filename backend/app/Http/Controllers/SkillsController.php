<?php

namespace App\Http\Controllers;

use App\Models\Skills;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SkillsController extends Controller
{
    /**
     * GET /api/students/{studentId}/skills
     * Get all skills for a student
     */
    public function index(int $studentId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $skills = Skills::where('student_id', $studentId)->get();

        return response()->json([
            'success' => true,
            'data' => $skills,
        ]);
    }

    /**
     * POST /api/students/{studentId}/skills
     * Add a new skill for a student
     */
    public function store(int $studentId, Request $request): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $validated = $request->validate([
            'skill_name' => 'required|string|max:100',
            'skill_category' => 'required|string|max:50',
            'proficiency_level' => 'nullable|in:Beginner,Intermediate,Advanced,Expert',
            'years_experience' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
        ]);

        $skill = Skills::create(array_merge(
            $validated,
            ['student_id' => $studentId]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Skill added successfully',
            'data' => $skill,
        ], 201);
    }

    /**
     * GET /api/students/{studentId}/skills/{skillId}
     * Get a specific skill
     */
    public function show(int $studentId, int $skillId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $skill = Skills::where('student_id', $studentId)
            ->where('skill_id', $skillId)
            ->first();

        if (!$skill) {
            return response()->json([
                'success' => false,
                'message' => 'Skill not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $skill,
        ]);
    }

    /**
     * PUT /api/students/{studentId}/skills/{skillId}
     * Update a skill
     */
    public function update(int $studentId, int $skillId, Request $request): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $skill = Skills::where('student_id', $studentId)
            ->where('skill_id', $skillId)
            ->first();

        if (!$skill) {
            return response()->json([
                'success' => false,
                'message' => 'Skill not found',
            ], 404);
        }

        $validated = $request->validate([
            'skill_name' => 'nullable|string|max:100',
            'skill_category' => 'nullable|string|max:50',
            'proficiency_level' => 'nullable|in:Beginner,Intermediate,Advanced,Expert',
            'years_experience' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
        ]);

        $skill->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Skill updated successfully',
            'data' => $skill,
        ]);
    }

    /**
     * DELETE /api/students/{studentId}/skills/{skillId}
     * Delete a skill
     */
    public function destroy(int $studentId, int $skillId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $skill = Skills::where('student_id', $studentId)
            ->where('skill_id', $skillId)
            ->first();

        if (!$skill) {
            return response()->json([
                'success' => false,
                'message' => 'Skill not found',
            ], 404);
        }

        $skill->delete();

        return response()->json([
            'success' => true,
            'message' => 'Skill deleted successfully',
        ]);
    }
}
