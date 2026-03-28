<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Annonce;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\ParentEleve;
use App\Models\Professeur;
use App\Models\Reclamation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SecretaireController extends Controller
{
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'etudiants' => Etudiant::count(),
                'classes' => Classe::count(),
                'absences_aujourdhui' => Absence::whereDate('date_abs', now()->toDateString())->count(),
                'reclamations_en_attente' => Reclamation::where('statut', 'en_attente')->count(),
            ],
        ]);
    }

    public function listStudents(Request $request): JsonResponse
    {
        $query = Etudiant::with(['user', 'classe', 'parentEleve.user'])
            ->join('users', 'etudiants.id_etudiant', '=', 'users.id')
            ->select('etudiants.*')
            ->orderBy('users.nom')
            ->orderBy('users.prenom');

        if ($request->filled('q')) {
            $term = trim((string) $request->query('q'));
            $query->where(function ($inner) use ($term) {
                $inner->whereHas('user', function ($q) use ($term) {
                    $q->where('nom', 'like', "%{$term}%")
                      ->orWhere('prenom', 'like', "%{$term}%")
                      ->orWhere('email', 'like', "%{$term}%");
                })->orWhere('etudiants.matricule', 'like', "%{$term}%");
            });
        }

        $students = $query->get()->map(function ($etudiant) {
            return [
                'id_etudiant' => $etudiant->id_etudiant,
                'matricule' => $etudiant->matricule,
                'nom' => $etudiant->user->nom ?? '',
                'prenom' => $etudiant->user->prenom ?? '',
                'name' => $etudiant->user->name ?? '',
                'email' => $etudiant->user->email ?? '',
                'date_naissance' => $etudiant->date_naissance,
                'genre' => $etudiant->genre,
                'adresse' => $etudiant->adresse,
                'id_classe' => $etudiant->id_classe,
                'classe' => $etudiant->classe ? trim($etudiant->classe->nom . ' - ' . $etudiant->classe->niveau) : null,
                'parent_email' => $etudiant->parentEleve->user->email ?? '',
                'parent_phone' => $etudiant->parentEleve->telephone ?? '',
                'country_code' => $etudiant->parentEleve->country_code ?? '+212',
            ];
        });

        return response()->json([
            'students' => $students,
        ]);
    }

    public function createStudent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'date_naissance' => ['required', 'date'],
            'genre' => ['required', 'in:M,F,A'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'adresse' => ['required', 'string', 'max:500'],
            'id_classe' => ['nullable', 'integer', 'exists:classes,id_classe'],
            'parent_email' => ['nullable', 'email', 'max:255'],
            'parent_phone' => ['required', 'string', 'max:20'],
            'country_code' => ['required', 'string', 'max:5'],
        ]);

        $student = DB::transaction(function () use ($validated) {
            $fallbackParentEmail = 'parent_' . preg_replace('/\D+/', '', (string) $validated['parent_phone']) . '@linkedu.local';
            $parentEmail = $validated['parent_email'] ?? $fallbackParentEmail;

            $parentUser = User::firstOrCreate(
                ['email' => $parentEmail],
                [
                    'name' => 'Parent ' . $validated['nom'],
                    'nom' => $validated['nom'],
                    'prenom' => 'Parent',
                    'password' => Hash::make('Parent@2026'),
                    'role' => 'parent_eleve',
                ]
            );

            $parentEleve = ParentEleve::firstOrCreate(
                ['id_parent' => $parentUser->id],
                [
                    'telephone' => $validated['parent_phone'],
                    'country_code' => $validated['country_code'] ?? '+212',
                ]
            );

            $user = User::create([
                'name' => trim($validated['prenom'] . ' ' . $validated['nom']),
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
                'password' => Hash::make('Etudiant@2026'),
                'role' => 'etudiant',
            ]);

            Etudiant::create([
                'id_etudiant' => $user->id,
                'matricule' => 'STU-' . now()->format('YmdHis'),
                'id_classe' => $validated['id_classe'] ?? null,
                'id_parent' => $parentEleve->id_parent,
                'date_naissance' => $validated['date_naissance'],
                'genre' => $validated['genre'],
                'adresse' => $validated['adresse'],
            ]);

            return $user;
        });

        return response()->json([
            'message' => 'Etudiant cree avec succes.',
            'student' => $student,
        ], 201);
    }

    public function updateStudent(Request $request, int $id): JsonResponse
    {
        $etudiant = Etudiant::with('user', 'parentEleve.user')->findOrFail($id);

        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'date_naissance' => ['required', 'date'],
            'genre' => ['required', 'in:M,F,A'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $etudiant->id_etudiant],
            'adresse' => ['required', 'string', 'max:500'],
            'id_classe' => ['nullable', 'integer', 'exists:classes,id_classe'],
            'parent_email' => ['nullable', 'email', 'max:255'],
            'parent_phone' => ['required', 'string', 'max:20'],
            'country_code' => ['required', 'string', 'max:5'],
        ]);

        DB::transaction(function () use ($etudiant, $validated) {
            // Update parent logic if necessary
            $fallbackParentEmail = $etudiant->parentEleve?->user?->email
                ?? ('parent_' . preg_replace('/\D+/', '', (string) $validated['parent_phone']) . '@linkedu.local');
            $parentEmail = $validated['parent_email'] ?? $fallbackParentEmail;

            $parentUser = User::firstOrCreate(
                ['email' => $parentEmail],
                [
                    'name' => 'Parent ' . $validated['nom'],
                    'nom' => $validated['nom'],
                    'prenom' => 'Parent',
                    'password' => Hash::make('Parent@2026'),
                    'role' => 'parent_eleve',
                ]
            );

            $parentEleve = ParentEleve::updateOrCreate(
                ['id_parent' => $parentUser->id],
                [
                    'telephone' => $validated['parent_phone'],
                    'country_code' => $validated['country_code'] ?? '+212',
                ]
            );

            $etudiant->update([
                'id_classe' => $validated['id_classe'] ?? null,
                'id_parent' => $parentEleve->id_parent,
                'date_naissance' => $validated['date_naissance'],
                'genre' => $validated['genre'],
                'adresse' => $validated['adresse'],
            ]);

            $etudiant->user->update([
                'name' => trim($validated['prenom'] . ' ' . $validated['nom']),
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
            ]);
        });

        return response()->json(['message' => 'Etudiant mis a jour avec succes.']);
    }

    public function deleteStudent(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Etudiant supprime avec succes.']);
    }

    public function listClasses(): JsonResponse
    {
        $classes = DB::table('classes')
            ->leftJoin('etudiants', 'classes.id_classe', '=', 'etudiants.id_classe')
            ->select(
                'classes.id_classe',
                'classes.nom',
                'classes.niveau',
                DB::raw('COUNT(etudiants.id_etudiant) as total_etudiants')
            )
            ->groupBy('classes.id_classe', 'classes.nom', 'classes.niveau')
            ->orderBy('classes.niveau')
            ->orderBy('classes.nom')
            ->get();

        return response()->json(['classes' => $classes]);
    }

    public function createClasse(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'niveau' => ['required', 'string', 'max:255'],
        ]);

        $classe = Classe::create($validated);

        return response()->json([
            'message' => 'Classe creee avec succes.',
            'classe' => $classe,
        ], 201);
    }

    public function updateClasse(Request $request, int $id): JsonResponse
    {
        $classe = Classe::findOrFail($id);
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'niveau' => ['required', 'string', 'max:255'],
        ]);

        $classe->update($validated);

        return response()->json(['message' => 'Classe mise a jour avec succes.']);
    }

    public function deleteClasse(int $id): JsonResponse
    {
        $classe = Classe::findOrFail($id);
        $classe->delete();

        return response()->json(['message' => 'Classe supprimee avec succes.']);
    }

    public function listAbsences(Request $request): JsonResponse
    {
        $query = DB::table('absences')
            ->join('etudiants', 'absences.id_etudiant', '=', 'etudiants.id_etudiant')
            ->join('users as etu_users', 'etudiants.id_etudiant', '=', 'etu_users.id')
            ->leftJoin('classes', 'etudiants.id_classe', '=', 'classes.id_classe')
            ->join('professeurs', 'absences.id_professeur', '=', 'professeurs.id_professeur')
            ->join('users as prof_users', 'professeurs.id_professeur', '=', 'prof_users.id')
            ->select(
                'absences.id_absence',
                'absences.date_abs',
                'absences.motif',
                'absences.id_etudiant',
                'absences.id_professeur',
                'etu_users.nom as etu_nom',
                'etu_users.prenom as etu_prenom',
                'classes.nom as classe_nom',
                'classes.niveau as classe_niveau',
                'prof_users.nom as prof_nom',
                'prof_users.prenom as prof_prenom'
            )
            ->orderByDesc('absences.date_abs');

        if ($request->filled('id_classe')) {
            $query->where('classes.id_classe', (int) $request->query('id_classe'));
        }

        return response()->json(['absences' => $query->get()]);
    }

    public function createAbsence(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date_abs' => ['required', 'date'],
            'motif' => ['nullable', 'string'],
            'id_etudiant' => ['required', 'integer', 'exists:etudiants,id_etudiant'],
            'id_professeur' => ['nullable', 'integer', 'exists:professeurs,id_professeur'],
        ]);

        $profId = $validated['id_professeur'] ?? Professeur::query()->value('id_professeur');
        if (! $profId) {
            return response()->json([
                'message' => 'Aucun professeur disponible pour rattacher cette absence.',
            ], 422);
        }

        $absence = Absence::create([
            'date_abs' => $validated['date_abs'],
            'motif' => $validated['motif'] ?? null,
            'id_etudiant' => $validated['id_etudiant'],
            'id_professeur' => $profId,
        ]);

        return response()->json([
            'message' => 'Absence ajoutee avec succes.',
            'absence' => $absence,
        ], 201);
    }

    public function updateAbsence(Request $request, int $id): JsonResponse
    {
        $absence = Absence::findOrFail($id);

        $validated = $request->validate([
            'date_abs' => ['required', 'date'],
            'motif' => ['nullable', 'string'],
            'id_professeur' => ['nullable', 'integer', 'exists:professeurs,id_professeur'],
        ]);

        $absence->update([
            'date_abs' => $validated['date_abs'],
            'motif' => $validated['motif'] ?? null,
            'id_professeur' => $validated['id_professeur'] ?? $absence->id_professeur,
        ]);

        return response()->json(['message' => 'Absence mise a jour avec succes.']);
    }

    public function deleteAbsence(int $id): JsonResponse
    {
        $absence = Absence::findOrFail($id);
        $absence->delete();

        return response()->json(['message' => 'Absence supprimee avec succes.']);
    }

    public function listAnnonces(): JsonResponse
    {
        $annonces = DB::table('annonces')
            ->join('professeurs', 'annonces.id_professeur', '=', 'professeurs.id_professeur')
            ->join('users', 'professeurs.id_professeur', '=', 'users.id')
            ->select(
                'annonces.id_annonce',
                'annonces.titre',
                'annonces.contenu',
                'annonces.date_publication',
                'annonces.created_at',
                'users.nom as auteur_nom',
                'users.prenom as auteur_prenom'
            )
            ->orderByDesc('annonces.created_at')
            ->get();

        return response()->json(['annonces' => $annonces]);
    }

    public function createAnnonce(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'contenu' => ['required', 'string'],
            'id_professeur' => ['nullable', 'integer', 'exists:professeurs,id_professeur'],
        ]);

        $profId = $validated['id_professeur'] ?? Professeur::query()->value('id_professeur');
        if (! $profId) {
            return response()->json([
                'message' => 'Aucun professeur disponible pour publier cette annonce.',
            ], 422);
        }

        $annonce = Annonce::create([
            'titre' => $validated['titre'],
            'contenu' => $validated['contenu'],
            'date_publication' => now(),
            'id_professeur' => $profId,
        ]);

        return response()->json([
            'message' => 'Annonce publiee avec succes.',
            'annonce' => $annonce,
        ], 201);
    }

    public function listReclamations(): JsonResponse
    {
        $reclamations = DB::table('reclamations')
            ->join('parents', 'reclamations.id_parent', '=', 'parents.id_parent')
            ->join('users', 'parents.id_parent', '=', 'users.id')
            ->select(
                'reclamations.id_reclamation',
                'reclamations.sujet',
                'reclamations.message',
                'reclamations.statut',
                'reclamations.date_soumission',
                'users.nom as parent_nom',
                'users.prenom as parent_prenom',
                'users.email as parent_email'
            )
            ->orderByDesc('reclamations.date_soumission')
            ->get();

        return response()->json(['reclamations' => $reclamations]);
    }

    public function updateReclamationStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'statut' => ['required', 'in:en_attente,en_cours,resolue,rejetee'],
        ]);

        $reclamation = Reclamation::findOrFail($id);
        $reclamation->update(['statut' => $validated['statut']]);

        return response()->json(['message' => 'Statut de reclamation mis a jour avec succes.']);
    }
}
