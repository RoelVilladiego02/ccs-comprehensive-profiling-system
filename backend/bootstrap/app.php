<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // CORS must run FIRST — before any other middleware including Sanctum
        $middleware->prepend(\App\Http\Middleware\HandleCors::class);

        // NOTE: EnsureFrontendRequestsAreStateful is intentionally REMOVED.
        // That middleware enforces cookie/session-based CSRF which cannot work
        // cross-domain (Vercel → Railway). We use Sanctum token auth instead,
        // which requires only the Authorization: Bearer header — no CSRF cookie.

        $middleware->alias([
            'role'        => \App\Http\Middleware\CheckRole::class,
            'permission'  => \App\Http\Middleware\CheckPermission::class,
            'active.user' => \App\Http\Middleware\EnsureUserIsActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();