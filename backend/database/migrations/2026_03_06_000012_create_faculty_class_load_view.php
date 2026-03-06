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
        DB::statement('DROP VIEW IF EXISTS faculty_class_load');
        DB::statement(<<<'SQL'
        CREATE VIEW faculty_class_load AS
        SELECT 
            f.faculty_id,
            CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
            c.class_id,
            co.course_code,
            co.course_title,
            c.section,
            c.academic_year,
            c.semester,
            c.schedule_day,
            c.schedule_time,
            c.room,
            c.enrolled_students,
            c.max_students
        FROM faculty f
        JOIN class c ON f.faculty_id = c.faculty_id
        JOIN course co ON c.course_id = co.course_id
        ORDER BY f.last_name ASC, c.academic_year ASC, c.semester ASC
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS faculty_class_load');
    }
};
