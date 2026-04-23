<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| NOTE: The /sanctum/csrf-cookie route is intentionally NOT defined here.
|
| That route only matters for Sanctum's stateful (cookie/session) SPA auth,
| which cannot work cross-domain (Vercel → Railway) due to browser cookie
| restrictions. This project uses Sanctum token auth for the API instead.
|
| Defining a fake /sanctum/csrf-cookie here that just returns JSON would
| shadow Sanctum's real implementation and break any future same-domain
| usage. Leave it out entirely.
|
*/

Route::get('/', function () {
    return response()->json([
        'service' => config('app.name'),
        'status'  => 'running',
    ]);
});