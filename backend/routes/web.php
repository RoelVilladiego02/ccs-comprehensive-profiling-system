<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// CSRF Cookie endpoint for SPA authentication
Route::post('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie sent']);
});
