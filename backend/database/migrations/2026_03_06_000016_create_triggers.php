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
        // Trigger for updating class completion date
        DB::statement(<<<'SQL'
        CREATE TRIGGER update_class_completion_date 
        BEFORE UPDATE ON student_class_status 
        FOR EACH ROW 
        BEGIN
            IF NEW.enrollment_status = 'Completed' AND OLD.enrollment_status != 'Completed' THEN
                SET NEW.completion_date = CURDATE();
            END IF;
        END
        SQL);

        // Trigger for deleting class enrollment
        DB::statement(<<<'SQL'
        CREATE TRIGGER update_class_enrollment_delete 
        AFTER DELETE ON student_class_status 
        FOR EACH ROW 
        BEGIN
            IF OLD.enrollment_status = 'Enrolled' THEN
                UPDATE class 
                SET enrolled_students = enrolled_students - 1 
                WHERE class_id = OLD.class_id;
            END IF;
        END
        SQL);

        // Trigger for inserting class enrollment
        DB::statement(<<<'SQL'
        CREATE TRIGGER update_class_enrollment_insert 
        AFTER INSERT ON student_class_status 
        FOR EACH ROW 
        BEGIN
            IF NEW.enrollment_status = 'Enrolled' THEN
                UPDATE class 
                SET enrolled_students = enrolled_students + 1 
                WHERE class_id = NEW.class_id;
            END IF;
        END
        SQL);

        // Trigger for updating class enrollment
        DB::statement(<<<'SQL'
        CREATE TRIGGER update_class_enrollment_update 
        AFTER UPDATE ON student_class_status 
        FOR EACH ROW 
        BEGIN
            IF NEW.enrollment_status = 'Enrolled' AND OLD.enrollment_status != 'Enrolled' THEN
                UPDATE class 
                SET enrolled_students = enrolled_students + 1 
                WHERE class_id = NEW.class_id;
            END IF;
            
            IF OLD.enrollment_status = 'Enrolled' AND NEW.enrollment_status != 'Enrolled' THEN
                UPDATE class 
                SET enrolled_students = enrolled_students - 1 
                WHERE class_id = NEW.class_id;
            END IF;
        END
        SQL);

        // Trigger for updating violation resolution
        DB::statement(<<<'SQL'
        CREATE TRIGGER update_violation_resolution 
        BEFORE UPDATE ON student_violations 
        FOR EACH ROW 
        BEGIN
            IF NEW.status = 'Resolved' AND OLD.status != 'Resolved' THEN
                SET NEW.resolution_date = CURDATE();
            END IF;
        END
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TRIGGER IF EXISTS update_class_completion_date');
        DB::statement('DROP TRIGGER IF EXISTS update_class_enrollment_delete');
        DB::statement('DROP TRIGGER IF EXISTS update_class_enrollment_insert');
        DB::statement('DROP TRIGGER IF EXISTS update_class_enrollment_update');
        DB::statement('DROP TRIGGER IF EXISTS update_violation_resolution');
    }
};
