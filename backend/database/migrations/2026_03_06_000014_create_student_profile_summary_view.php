<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('DROP VIEW IF EXISTS student_profile_summary');
        DB::statement(<<<'SQL'
        CREATE VIEW student_profile_summary AS
        SELECT 
            s.student_id,
            s.student_number,
            CONCAT(s.first_name, ' ', s.last_name) AS full_name,
            s.email,
            s.student_identification AS student_status,
            sp.program_name,
            sp.year_level,
            COUNT(DISTINCT scs.class_id) AS enrolled_classes,
            COUNT(DISTINCT CASE WHEN scs.enrollment_status = 'Enrolled' THEN scs.class_id END) AS current_classes,
            COUNT(DISTINCT CASE WHEN scs.enrollment_status = 'Completed' THEN scs.class_id END) AS completed_classes,
            COUNT(DISTINCT sv.violation_id) AS total_violations,
            COUNT(DISTINCT CASE WHEN sv.status = 'Pending' THEN sv.violation_id END) AS pending_violations
        FROM student s
        LEFT JOIN student_program sp ON s.student_id = sp.student_id
        LEFT JOIN student_class_status scs ON s.student_id = scs.student_id
        LEFT JOIN student_violations sv ON s.student_id = sv.student_id
        GROUP BY s.student_id, s.student_number, s.first_name, s.last_name, s.email, s.student_identification, sp.program_name, sp.year_level
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS student_profile_summary');
    }
};
