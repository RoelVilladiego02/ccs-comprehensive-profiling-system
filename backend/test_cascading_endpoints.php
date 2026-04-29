<?php
/**
 * Test script to verify cascading dropdown endpoints
 * Run: php test_cascading_endpoints.php
 */

// Load Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\StudentService;

$studentService = app(StudentService::class);

echo "========================================\n";
echo "Testing Cascading Dropdown Endpoints\n";
echo "========================================\n\n";

// Test 1: Get skills by category
echo "1. Skills by Category:\n";
echo "-------------------\n";
$skillsByCategory = $studentService->getSkillsByCategory();
echo json_encode($skillsByCategory, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
echo "\n\n";

// Test 2: Get affiliations by type
echo "2. Affiliations by Type:\n";
echo "------------------------\n";
$affiliationsByType = $studentService->getAffiliationsByType();
echo json_encode($affiliationsByType, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
echo "\n\n";

echo "========================================\n";
echo "Test Complete\n";
echo "========================================\n";
