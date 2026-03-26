<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminLoginController;
use App\Http\Controllers\DirecteurController;
use App\Http\Controllers\DirecteurLoginController;

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

Route::post('/admin/login', [AdminLoginController::class, 'login']);
Route::post('/admin/logout', [AdminLoginController::class, 'logout'])->middleware('auth:sanctum');

Route::post('/directeur/login', [DirecteurLoginController::class, 'login']);
Route::post('/directeur/logout', [DirecteurLoginController::class, 'logout'])->middleware('auth:sanctum', 'role:directeur');

Route::middleware(['auth:sanctum', 'role:directeur'])->group(function () {
    Route::get('/directeur/dashboard', [DirecteurController::class, 'dashboard']);
});

