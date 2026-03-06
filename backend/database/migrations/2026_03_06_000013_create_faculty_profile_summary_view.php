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
        DB::statement('DROP VIEW IF EXISTS faculty_profile_summary');
        DB::statement(<<<'SQL'
        CREATE VIEW faculty_profile_summary AS
        SELECT 
            f.faculty_id,
            f.faculty_number,
            CONCAT(f.first_name, ' ', f.last_name) AS full_name,
            f.email,
            f.employment_status,
            f.department,
            COUNT(DISTINCT fs.specialization_id) AS specializations_count
        FROM faculty f
        LEFT JOIN faculty_specialization fs ON f.faculty_id = fs.faculty_id
        GROUP BY f.faculty_id, f.faculty_number, f.first_name, f.last_name, f.email, f.employment_status, f.department
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS faculty_profile_summary');
    }
};
