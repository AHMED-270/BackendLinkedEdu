<?php

return [
    // Ensure sanctum routes are included
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'register', 'logout', 'forgot-password', 'reset-password'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // ✅ MUST be true when Axios has withCredentials = true
    'supports_credentials' => true,
];