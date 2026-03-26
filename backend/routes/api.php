<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::any('/health', function (Request $request) {
    return response()->json([
        'status' => 'ok',
        'service' => 'LinkEdu API',
        'method' => $request->method(),
        'received' => $request->all(),
        'timestamp' => now()->toIso8601String(),
    ])->header('Access-Control-Allow-Origin', 'http://localhost:3000')
      ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      ->header('Access-Control-Allow-Headers', '*')
      ->header('Access-Control-Allow-Credentials', 'true');
});

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
