<?php

require 'vendor/autoload.php';
require 'bootstrap/app.php';

$app = require 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Http\Kernel::class);

$user = \App\Models\User::where('email', 'admin@ccs.edu')->first();

if ($user) {
    echo "Admin user found: " . $user->name . PHP_EOL;
    echo "Is active: " . ($user->is_active ? "Yes" : "No") . PHP_EOL;
    echo "Has roles: " . count($user->roles) . PHP_EOL;
    foreach ($user->roles as $role) {
        echo "  - " . $role->role_name . PHP_EOL;
    }
} else {
    echo "Admin user NOT found" . PHP_EOL;
    echo "Total users: " . \App\Models\User::count() . PHP_EOL;
    $allUsers = \App\Models\User::all();
    foreach ($allUsers as $u) {
        echo "  - " . $u->email . " (active: " . ($u->is_active ? "Yes" : "No") . ")" . PHP_EOL;
    }
}
