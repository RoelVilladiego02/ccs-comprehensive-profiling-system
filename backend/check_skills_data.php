<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Skills;

// Check skills distribution
echo "=== SKILLS DISTRIBUTION ===\n";
$categories = Skills::distinct()->pluck('skill_category');
echo "Total categories: " . count($categories) . "\n";
echo "Categories: " . $categories->implode(', ') . "\n\n";

foreach ($categories as $category) {
    $count = Skills::where('skill_category', $category)->count();
    $uniqueNames = Skills::where('skill_category', $category)->distinct()->pluck('skill_name')->count();
    echo "[$category]: $count records, $uniqueNames unique skill names\n";
}

echo "\n=== SAMPLE SKILLS PER CATEGORY ===\n";
foreach ($categories->take(3) as $category) {
    $skills = Skills::where('skill_category', $category)
        ->distinct('skill_name')
        ->pluck('skill_name')
        ->take(5);
    echo "[$category]: " . $skills->implode(', ') . "\n";
}

echo "\n=== TOTAL STUDENTS ===\n";
echo "Total student records: " . \App\Models\Student::count() . "\n";

echo "\n=== SKILLS PER STUDENT (first 5 students) ===\n";
\App\Models\Student::take(5)->each(function($student) {
    $categories = $student->skills->pluck('skill_category')->unique();
    $count = $student->skills->count();
    echo "Student {$student->student_id}: $count skills in categories: " . $categories->implode(', ') . "\n";
});
