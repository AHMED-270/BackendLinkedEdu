<?php

return [
    // Ensure sanctum routes are included
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    
    'allowed_origins' => [ '*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // ✅ MUST be true when Axios has withCredentials = true
    'supports_credentials' => true,
];