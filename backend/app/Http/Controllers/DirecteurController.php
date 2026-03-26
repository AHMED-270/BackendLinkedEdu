<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DirecteurController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $stats = [
            'classes' => DB::table('classes')->count(),
            'professeurs' => DB::table('professeurs')->count(),
            'etudiants' => DB::table('etudiants')->count(),
            'devoirs' => DB::table('devoirs')->count(),
            'annonces' => DB::table('annonces')->count(),
        ];

        $latestDevoirs = DB::table('devoirs')
            ->select('id_devoir', 'titre', 'date_limite', 'created_at')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return response()->json([
            'message' => 'Dashboard directeur',
            'stats' => $stats,
            'latest_devoirs' => $latestDevoirs,
        ]);
    }
}
