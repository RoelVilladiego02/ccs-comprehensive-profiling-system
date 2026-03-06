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
        DB::statement('DROP VIEW IF EXISTS student_violation_summary');
        DB::statement(<<<'SQL'
        CREATE VIEW student_violation_summary AS
        SELECT 
            s.student_id,
            s.student_number,
            CONCAT(s.first_name, ' ', s.last_name) AS full_name,
            sv.violation_id,
            sv.violation_date,
            sv.violation_type,
            sv.offense_level,
            sv.status,
            sv.penalty,
            sv.action_taken
        FROM student s
        JOIN student_violations sv ON s.student_id = sv.student_id
        ORDER BY sv.violation_date DESC
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS student_violation_summary');
    }
};
