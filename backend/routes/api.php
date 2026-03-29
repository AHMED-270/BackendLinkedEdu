<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminLoginController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\DirecteurLoginController;
use App\Http\Controllers\DirecteurController;
use App\Http\Controllers\AnnonceController;
use App\Http\Controllers\EmploiDuTempsController;

Route::any('/health', function (Request $request) {
    return response()->json([
        'status' => 'ok',
    ]);
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
    Route::get('/directeur/professeurs', [DirecteurController::class, 'getProfessors']);
    Route::get('/directeur/reclamations', [DirecteurController::class, 'getReclamations']);
    Route::get('/directeur/profile', [DirecteurController::class, 'getProfile']);
    Route::put('/directeur/profile', [DirecteurController::class, 'updateProfile']);
    Route::put('/directeur/password', [DirecteurController::class, 'updatePassword']);
    Route::get('/annonces', [AnnonceController::class, 'index']);
    Route::post('/annonces', [AnnonceController::class, 'store']);
    Route::put('/annonces/{id}', [AnnonceController::class, 'update']);
    Route::delete('/annonces/{id}', [AnnonceController::class, 'destroy']);
    Route::get('/emplois/lookups', [EmploiDuTempsController::class, 'lookups']);
    Route::get('/emplois', [EmploiDuTempsController::class, 'index']);
    Route::post('/emplois', [EmploiDuTempsController::class, 'store']);
    Route::put('/emplois/{id}', [EmploiDuTempsController::class, 'update']);
    Route::delete('/emplois/{id}', [EmploiDuTempsController::class, 'destroy']);     
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/admin/dashboard-stats', [AdminDashboardController::class, 'getStats']);
    Route::put('/admin/profile', [AdminDashboardController::class, 'updateProfile']);
    Route::get('/admin/users', [AdminDashboardController::class, 'getUsers']);  
    Route::post('/admin/users', [AdminDashboardController::class, 'createUser']);
    Route::put('/admin/users/{id}', [AdminDashboardController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [AdminDashboardController::class, 'deleteUser']);
    Route::get('/admin/classes', [AdminDashboardController::class, 'getClasses']);
    Route::post('/admin/classes', [AdminDashboardController::class, 'createClass']);
    Route::put('/admin/classes/{id}', [AdminDashboardController::class, 'updateClass']);
    Route::delete('/admin/classes/{id}', [AdminDashboardController::class, 'deleteClass']);
    Route::get('/admin/matieres', [AdminDashboardController::class, 'getMatieres']);
    Route::post('/admin/matieres', [AdminDashboardController::class, 'createMatiere']);
    Route::put('/admin/matieres/{id}', [AdminDashboardController::class, 'updateMatiere']);
    Route::delete('/admin/matieres/{id}', [AdminDashboardController::class, 'deleteMatiere']);
    Route::post('/admin/reports/generate', [AdminDashboardController::class, 'generateReport']);
});
