<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Student;
use App\Models\AcademicHistory;
use App\Models\NonAcademicHistory;
use App\Models\Skills;
use App\Models\Affiliation;
use App\Models\StudentViolations;

echo "=== DATABASE SEEDING VERIFICATION ===\n";
echo "Students: " . Student::count() . "\n";
echo "Academic History: " . AcademicHistory::count() . "\n";
echo "Non-Academic History: " . NonAcademicHistory::count() . "\n";
echo "Skills: " . Skills::count() . "\n";
echo "Affiliations: " . Affiliation::count() . "\n";
echo "Violations: " . StudentViolations::count() . "\n";

echo "\n=== SAMPLE DATA FOR FIRST STUDENT ===\n";
$student = Student::first();
if ($student) {
    echo "Student: " . $student->first_name . " " . $student->last_name . "\n";
    echo "  Academic History: " . $student->academicHistory()->count() . " record(s)\n";
    echo "  Non-Academic History: " . $student->nonAcademicHistory()->count() . " record(s)\n";
    echo "  Skills: " . $student->skills()->count() . " record(s)\n";
    echo "  Affiliations: " . $student->affiliations()->count() . " record(s)\n";
    echo "  Violations: " . $student->violations()->count() . " record(s)\n";
}
