<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Fix the grades table to match the GradeService and frontend expectations.
     * Add the missing columns: midterm_grade, final_grade (numeric), grade_letter, is_passed
     * Make legacy columns nullable since they're not used in the new system
     */
    public function up(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            // Make legacy columns nullable since they're not used in the new system
            if (Schema::hasColumn('grades', 'assessment_type')) {
                $table->string('assessment_type', 50)->nullable()->change();
            }
            if (Schema::hasColumn('grades', 'assessment_name')) {
                $table->string('assessment_name', 100)->nullable()->change();
            }
            if (Schema::hasColumn('grades', 'score')) {
                $table->decimal('score', 5, 2)->nullable()->change();
            }
            if (Schema::hasColumn('grades', 'max_score')) {
                $table->decimal('max_score', 5, 2)->nullable()->change();
            }
            if (Schema::hasColumn('grades', 'percentage')) {
                $table->decimal('percentage', 5, 2)->nullable()->change();
            }
        });

        Schema::table('grades', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('grades', 'midterm_grade')) {
                $table->decimal('midterm_grade', 5, 2)->nullable()->after('class_id');
            }
            
            // Add numeric final_grade if needed (check type first)
            if (!Schema::hasColumn('grades', 'final_grade_numeric')) {
                $table->decimal('final_grade_numeric', 5, 2)->nullable()->after('midterm_grade');
            }
            
            if (!Schema::hasColumn('grades', 'grade_letter')) {
                $table->string('grade_letter', 2)->nullable()->after('final_grade_numeric');
            }
            
            if (!Schema::hasColumn('grades', 'is_passed')) {
                $table->boolean('is_passed')->default(false)->after('grade_letter');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            if (Schema::hasColumn('grades', 'midterm_grade')) {
                $table->dropColumn('midterm_grade');
            }
            if (Schema::hasColumn('grades', 'final_grade_numeric')) {
                $table->dropColumn('final_grade_numeric');
            }
            if (Schema::hasColumn('grades', 'grade_letter')) {
                $table->dropColumn('grade_letter');
            }
            if (Schema::hasColumn('grades', 'is_passed')) {
                $table->dropColumn('is_passed');
            }
        });
    }
};
