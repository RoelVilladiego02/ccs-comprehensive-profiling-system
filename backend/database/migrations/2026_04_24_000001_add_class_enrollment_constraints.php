<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds database-level constraints to enforce:
     * 1. No duplicate students in a class (unique constraint)
     * 2. Class enrollment cannot exceed max_students (check constraint)
     */
    public function up(): void
    {
        // Add check constraint to prevent enrolled_students from exceeding max_students
        DB::statement('ALTER TABLE `class` ADD CONSTRAINT `chk_max_students` CHECK (`enrolled_students` <= `max_students`)');

        // Add check constraint to prevent negative enrolled_students
        DB::statement('ALTER TABLE `class` ADD CONSTRAINT `chk_enrolled_students_positive` CHECK (`enrolled_students` >= 0)');

        // Add check constraint to prevent max_students from being less than 1
        DB::statement('ALTER TABLE `class` ADD CONSTRAINT `chk_max_students_positive` CHECK (`max_students` >= 1)');

        // Ensure unique constraint exists on student_class_status table
        // This constraint already exists from the initial migration, but we document it here
        // $table->unique(['student_id', 'class_id'], 'unique_student_class');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop check constraints
        DB::statement('ALTER TABLE `class` DROP CONSTRAINT `chk_max_students`');
        DB::statement('ALTER TABLE `class` DROP CONSTRAINT `chk_enrolled_students_positive`');
        DB::statement('ALTER TABLE `class` DROP CONSTRAINT `chk_max_students_positive`');
    }
};
