<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    /**
     * Allowed origins. Add any preview/staging URLs here or via FRONTEND_URL.
     */
    private function getAllowedOrigins(): array
    {
        $origins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'https://ccs-comprehensive-profiling-system.vercel.app',
        ];

        $envUrl = env('FRONTEND_URL', '');
        if ($envUrl !== '') {
            $origins[] = rtrim($envUrl, '/');
        }

        return array_values(array_filter(array_unique($origins)));
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $allowedOrigins = $this->getAllowedOrigins();
        $origin         = $request->header('Origin', '');
        $originAllowed  = $origin !== '' && in_array($origin, $allowedOrigins, true);

        // Resolve the value to send for Access-Control-Allow-Origin.
        // We never use '*' because we always send credentials.
        $allowOriginValue = $originAllowed ? $origin : 'null';

        // Common CORS headers shared by preflight and actual responses.
        $corsHeaders = [
            'Access-Control-Allow-Methods'  => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers'  => 'Content-Type, Accept, Authorization, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN',
            'Access-Control-Allow-Credentials' => 'true',
        ];

        // Handle preflight (OPTIONS) — respond immediately with 204, no body.
        if ($request->isMethod('OPTIONS')) {
            return response('', 204)
                ->withHeaders(array_merge($corsHeaders, [
                    'Access-Control-Allow-Origin' => $allowOriginValue,
                    'Access-Control-Max-Age'      => '86400', // cache preflight 24 h
                ]));
        }

        // Pass request through the rest of the middleware stack.
        $response = $next($request);

        // Attach CORS headers to every actual response.
        $response->headers->set('Access-Control-Allow-Origin', $allowOriginValue);
        foreach ($corsHeaders as $header => $value) {
            $response->headers->set($header, $value);
        }
        $response->headers->set('Access-Control-Expose-Headers', 'Content-Length, X-RateLimit-Limit, X-RateLimit-Remaining');

        return $response;
    }
}