<?php

use App\Models\User;
use Illuminate\Database\Capsule\Manager as DB;

// Bootstrap Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';

// Get the application instance
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');

// Get a student
$student = User::where('role', 'student')->first();

echo "=== DEBUGGING MY COURSES ===\n\n";

if (!$student) {
    echo "❌ No student user found in database!\n";
    exit;
}

echo "✓ Student Found: " . $student->name . " (ID: " . $student->id . ")\n";

// Check if courses relationship exists
$courses = $student->courses;
echo "✓ Courses count: " . count($courses) . "\n";

if (count($courses) == 0) {
    echo "\n⚠️  No courses assigned to this student!\n";
    echo "\nChecking database tables...\n";
    
    // Check course_student relationship table
    $relationshipCount = DB::table('course_student')
        ->where('user_id', $student->id)
        ->count();
    
    echo "- course_student table entries for this student: " . $relationshipCount . "\n";
    
    // Check if courses table has any data
    $totalCourses = DB::table('courses')->count();
    echo "- Total courses in database: " . $totalCourses . "\n";
    
} else {
    echo "\n✓ Courses found:\n";
    foreach ($courses as $course) {
        echo "  - " . $course->name . " (ID: " . $course->id . ")\n";
    }
}

