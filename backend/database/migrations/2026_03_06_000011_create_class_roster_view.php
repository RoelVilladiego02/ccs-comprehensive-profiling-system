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
        DB::statement('DROP VIEW IF EXISTS class_roster');
        DB::statement(<<<'SQL'
        CREATE VIEW class_roster AS
        SELECT 
            c.class_id,
            co.course_code,
            co.course_title,
            c.section,
            c.academic_year,
            c.semester,
            s.student_id,
            s.student_number,
            CONCAT(s.first_name, ' ', s.last_name) AS student_name,
            scs.enrollment_status,
            scs.enrollment_date
        FROM class c
        JOIN course co ON c.course_id = co.course_id
        JOIN student_class_status scs ON c.class_id = scs.class_id
        JOIN student s ON scs.student_id = s.student_id
        ORDER BY c.class_id ASC, s.last_name ASC
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS class_roster');
    }
};
