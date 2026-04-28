<?php

namespace Database\Seeders;

use App\Models\Grades;
use App\Models\StudentClassStatus;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class GradesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Seeds midterm and final grades for all enrolled students.
     */
    public function run(): void
    {
        $this->command->info('Seeding grades for enrolled students...');

        // Get all student enrollments
        $enrollments = StudentClassStatus::with(['student', 'class'])
            ->where('enrollment_status', 'Enrolled')
            ->get();

        if ($enrollments->isEmpty()) {
            $this->command->warn('⚠️  No enrolled students found. Skipping grades seeding.');
            return;
        }

        $this->command->info("Found {$enrollments->count()} enrolled students.\n");

        $totalGrades = 0;
        $batchSize = 100;
        $batch = [];

        foreach ($enrollments as $enrollment) {
            // Generate midterm grade
            $midtermGrade = $this->generateScore(50, 98);

            // Generate final grade
            $finalGrade = $this->generateScore(55, 100);

            // Calculate overall grade: (midterm * 0.4) + (final * 0.6)
            $overallGrade = ($midtermGrade * 0.4) + ($finalGrade * 0.6);
            $gradeLetter = $this->getGradeLetter($overallGrade);
            $isPassed = $overallGrade >= 60; // 60 is passing

            $batch[] = [
                'student_id' => $enrollment->student_id,
                'class_id' => $enrollment->class_id,
                'midterm_grade' => $midtermGrade,
                'final_grade_numeric' => $finalGrade,
                'grade_letter' => $gradeLetter,
                'is_passed' => $isPassed,
                'remarks' => $this->getRemarks($overallGrade),
                // Legacy fields (optional, for backwards compatibility)
                'assessment_type' => null,
                'assessment_name' => null,
                'score' => null,
                'max_score' => null,
                'percentage' => null,
                'grade_date' => now()->toDateString(),
                'final_grade' => $gradeLetter, // Store letter grade in legacy column
            ];

            $totalGrades++;

            // Bulk insert when batch reaches size limit
            if (count($batch) >= $batchSize) {
                Grades::insert($batch);
                $batch = [];
                $this->command->info("  Inserted {$totalGrades} grades...");
            }
        }

        // Insert remaining batch
        if (!empty($batch)) {
            Grades::insert($batch);
        }

        $this->command->info("\n✓ Grades seeding complete!");
        $this->command->info("  Students with grades: {$enrollments->count()}");
        $this->command->info("  Total grade records: {$totalGrades}");
    }

    /**
     * Generate a realistic grade score using a normal distribution
     */
    private function generateScore(int $min = 50, int $max = 100): float
    {
        // Use a slightly skewed distribution favoring higher scores
        $random = rand(0, 10000) / 10000;

        // Apply exponential skew to favor higher scores
        $random = sqrt($random); // Bias toward higher values

        // Map to the range
        $score = $min + ($random * ($max - $min));

        // Add some variation with occasional outliers
        if (rand(0, 100) < 5) {
            // 5% chance of much higher score
            $score = min(100, $score + rand(5, 15));
        } elseif (rand(0, 100) < 10) {
            // 10% chance of lower score
            $score = max($min, $score - rand(5, 20));
        }

        return round($score, 2);
    }

    /**
     * Get letter grade based on percentage
     */
    private function getGradeLetter(float $percentage): string
    {
        if ($percentage >= 95) return 'A+';
        if ($percentage >= 90) return 'A';
        if ($percentage >= 88) return 'A-';
        if ($percentage >= 85) return 'B+';
        if ($percentage >= 80) return 'B';
        if ($percentage >= 78) return 'B-';
        if ($percentage >= 75) return 'C+';
        if ($percentage >= 70) return 'C';
        if ($percentage >= 65) return 'C-';
        if ($percentage >= 60) return 'D';
        return 'F';
    }

    /**
     * Get remarks based on score
     */
    private function getRemarks(float $score): string
    {
        if ($score >= 90) return 'Excellent performance';
        if ($score >= 80) return 'Good performance';
        if ($score >= 70) return 'Satisfactory';
        if ($score >= 60) return 'Passing';
        return 'Needs improvement';
    }
}
