<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfessorController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Auth Check (Frontend check)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Professor Module Routes
Route::prefix('professeur')->group(function () {
    // Note: Dans une application réelle, on protège ces routes avec middleware('auth:sanctum') et un check de rôle 

    // Dashboard
    Route::get('/dashboard', [ProfessorController::class, 'getDashboard']);

    // Devoirs et Ressources
    Route::get('/publications', [ProfessorController::class, 'getDevoirsEtRessources']);
    Route::post('/devoirs', [ProfessorController::class, 'publishDevoir']);
    Route::post('/ressources', [ProfessorController::class, 'publishRessource']);

    // Élèves, Appel et Notes
    Route::get('/classes/{class_id}/eleves', [ProfessorController::class, 'getStudents']);
    Route::get('/eleves', [ProfessorController::class, 'getStudents']); // All classes

    // Annonces
    Route::get('/annonces', [ProfessorController::class, 'getAnnouncements']);

    // Réclamations
    Route::post('/reclamations', [ProfessorController::class, 'submitComplaint']);
});
