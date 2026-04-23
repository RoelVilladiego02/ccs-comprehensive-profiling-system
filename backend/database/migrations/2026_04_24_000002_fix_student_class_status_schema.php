<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Fixes:
     * 1. Rename status_id to enrollment_id (matches model primaryKey)
     * 2. Add final_grade column (referenced in model fillable)
     */
    public function up(): void
    {
        Schema::table('student_class_status', function (Blueprint $table) {
            // Rename status_id to enrollment_id
            $table->renameColumn('status_id', 'enrollment_id');
            
            // Add final_grade column if it doesn't exist
            if (!Schema::hasColumn('student_class_status', 'final_grade')) {
                $table->decimal('final_grade', 5, 2)->nullable()->after('completion_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_class_status', function (Blueprint $table) {
            // Rename back to status_id
            $table->renameColumn('enrollment_id', 'status_id');
            
            // Drop final_grade column
            if (Schema::hasColumn('student_class_status', 'final_grade')) {
                $table->dropColumn('final_grade');
            }
        });
    }
};
