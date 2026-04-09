<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Student;
use App\Models\StudentViolations;

echo "=== VIOLATION DATA CHECK ===\n";
echo "Total violations in DB: " . StudentViolations::count() . "\n\n";

$students = Student::all();
foreach ($students as $student) {
    $violationCount = $student->violations()->count();
    echo "Student {$student->first_name} {$student->last_name}: $violationCount violations\n";
    
    if ($violationCount > 0) {
        foreach ($student->violations as $v) {
            echo "  - {$v->violation_type} ({$v->status}) on {$v->violation_date}\n";
        }
    }
}

echo "\n=== SAMPLE STUDENT FULL PROFILE ===\n";
$student = Student::with([
    'violations',
    'academic_history',
    'non_academic_history',
    'skills',
    'affiliations'
])->first();

if ($student) {
    echo "Student: {$student->first_name} {$student->last_name}\n";
    echo "Violations loaded: " . $student->violations->count() . "\n";
    echo "Academic History loaded: " . $student->academic_history->count() . "\n";
    echo "Non-Academic History loaded: " . $student->non_academic_history->count() . "\n";
    echo "Skills loaded: " . $student->skills->count() . "\n";
    echo "Affiliations loaded: " . $student->affiliations->count() . "\n";
}
