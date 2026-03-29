<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\Professeur;
use App\Models\Reclamation;

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
            'absence_rate' => '2.5%', 
            'performance' => '13.8/20', 
            'reclamations' => DB::table('reclamations')->whereIn('statut', ['Nouveau', 'En cours', 'nouveau', 'en cours'])->count(),
            'dossiers_attente' => DB::table('etudiants')->whereNull('id_classe')->count()
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

    public function getProfessors(): JsonResponse
    {
        $professeurs = Professeur::with(['user', 'classes'])->get()->map(function ($prof) {
            return [
                'id' => $prof->id_professeur,
                'name' => $prof->user ? $prof->user->name : 'Inconnu',
                'email' => $prof->user ? $prof->user->email : 'Inconnu',
                'avatar' => 'https://i.pravatar.cc/150?u=' . $prof->id_professeur,
                'subject' => strtoupper($prof->specialite),
                'classes' => $prof->classes->pluck('nom'),
                'status' => 'Actif',
                'progress' => rand(50, 100),
                'lastActivityDate' => $prof->updated_at ? $prof->updated_at->diffForHumans() : 'Récemment',
                'lastActivityDesc' => 'Actif',
            ];
        });

        return response()->json($professeurs);
    }

    public function getReclamations(): JsonResponse
    {
        $reclamations = Reclamation::with(['parentEleve.user'])->orderByDesc('created_at')->get()->map(function ($rec) {
            $userName = $rec->parentEleve && $rec->parentEleve->user ? $rec->parentEleve->user->name : 'Parent Inconnu';
            $typeClass = 'badge-nouveau';
            if (strtolower($rec->statut) == 'en cours') $typeClass = 'badge-encours';
            else if (strtolower($rec->statut) == 'résolu' || strtolower($rec->statut) == 'resolu') $typeClass = 'badge-resolu';

            return [
                'id' => $rec->id_reclamation,
                'type' => $rec->statut ?: 'Nouveau',
                'typeClass' => $typeClass,
                'date' => $rec->created_at ? $rec->created_at->format('d M Y • H:i') : $rec->date_soumission,
                'name' => $userName . ' (Parent)',
                'subject' => $rec->sujet,
                'logo' => strtoupper(substr($userName, 0, 1)),
                'message' => $rec->message
            ];
        });

        return response()->json($reclamations);
    }

    public function getProfile(\Illuminate\Http\Request $request): JsonResponse
    {
        $user = $request->user()->load('directeur');
        return response()->json([
            'nom' => $user->name,
            'email' => $user->email,
            'telephone' => $user->directeur ? $user->directeur->telephone : '',
            'etablissement' => 'Lycée Excellence',
            'adresse' => 'Quartier Administratif, Rabat'
        ]);
    }

    public function updateProfile(\Illuminate\Http\Request $request): JsonResponse
    {
        $user = $request->user();
        $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'telephone' => 'nullable|string|max:20'
        ]);

        // Update User
        $user->name = $request->nom;
        $user->email = $request->email;
        $user->save();

        // Update Directeur details
        if ($user->directeur) {
            $user->directeur->telephone = $request->telephone;
            $user->directeur->save();
        } else {
            // Create directeur profile if missing
            \App\Models\Directeur::create([
                'id_directeur' => $user->id,
                'telephone' => $request->telephone
            ]);
            $user->load('directeur');
        }

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'profile' => [
                'nom' => $user->name,
                'email' => $user->email,
                'telephone' => $user->directeur ? $user->directeur->telephone : '',
                'etablissement' => 'Lycée Excellence',
                'adresse' => 'Quartier Administratif, Rabat'
            ]
        ]);
    }

    public function updatePassword(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'actuel' => 'required|string',
            'nouveau' => 'required|string|min:6',
        ]);

        $user = $request->user();

        if (!\Illuminate\Support\Facades\Hash::check($request->actuel, $user->password)) {
            return response()->json(['message' => 'Le mot de passe actuel est incorrect'], 400);
        }

        $user->password = \Illuminate\Support\Facades\Hash::make($request->nouveau);
        $user->save();

        return response()->json(['message' => 'Mot de passe mis à jour avec succès']);
    }
}