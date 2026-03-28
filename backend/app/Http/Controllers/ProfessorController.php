<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Resource;
use App\Models\Announcement;
use App\Models\Classe;
use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfessorController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (! $user || $user->role !== 'professeur') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user' => $user,
        ]);
    }

    /**
     * Get Professor Dashboard Data (Stats, Today's Schedule, upcoming events)
     */
    public function getDashboard(Request $request)
    {
        // For development/mock purposes, we will return static data matching our React model
        return response()->json([
            'stats' => [
                'total_eleves' => 84, // Example generated from DB
                'total_classes' => 3,
                'devoirs_actifs' => 12,
                'ressources_partagees' => 48
            ],
            'classes' => [
                ['id' => 1, 'name' => 'Master 2 - IA', 'present' => 32, 'total' => 35, 'progress' => 91, 'matiere' => 'Astrophysique'],
                ['id' => 2, 'name' => 'L3 - CS', 'present' => 28, 'total' => 30, 'progress' => 93, 'matiere' => 'Mathématiques'],
                ['id' => 3, 'name' => 'L1 - Science', 'present' => 25, 'total' => 38, 'progress' => 66, 'matiere' => 'Physique']
            ],
        ]);
    }

    /**
     * Assignments & Resources (GET and POST)
     */
    public function getDevoirsEtRessources(Request $request)
    {
        $recent_pubs = [
            ['id' => 1, 'title' => 'Théorie de la Relativité Générale', 'type' => 'Cours', 'published_at' => 'Il y a 2h', 'class' => 'Master 2 - IA', 'views' => 24, 'icon_color' => 'orange'],
            ['id' => 2, 'title' => 'TD n°4 : Spectroscopie Stellaire', 'type' => 'Devoir', 'published_at' => 'Échéance : 15 Oct.', 'class' => 'L3 - CS', 'views' => 12, 'icon_color' => 'blue'],
            ['id' => 3, 'title' => 'Webinaire : Carrières en Astro', 'type' => 'Vidéo', 'published_at' => 'Publié hier', 'class' => 'Tous', 'views' => 145, 'icon_color' => 'purple'],
        ];

        return response()->json([
            'publications' => $recent_pubs,
            'stats' => [
                'active_assignments' => 12,
                'shared_resources' => 48
            ]
        ]);
    }

    public function publishDevoir(Request $request)
    {
        // Validation would be exactly like this:
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'deadline' => 'required|date',
            'points' => 'required|numeric',
        ]);

        // Assignment::create($validated); ...

        return response()->json(['message' => 'Devoir publié avec succès', 'devoir' => $validated], 201);
    }
    
    public function publishRessource(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'file' => 'nullable|file|max:25600', // 25MB max
        ]);

        return response()->json(['message' => 'Ressource publiée avec succès', 'ressource' => $validated], 201);
    }

    /**
     * Get Students by Class
     */
    public function getStudents(Request $request, $class_id = null)
    {
        $user = $request->user();

        if (! $user || $user->role !== 'professeur') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignedClassIds = DB::table('classe_professeur_assignments')
            ->where('id_professeur', $user->id)
            ->pluck('id_classe');

        if ($assignedClassIds->isEmpty()) {
            return response()->json([
                'classes' => [],
                'students' => [],
            ]);
        }

        if ($class_id !== null && ! $assignedClassIds->contains((int) $class_id)) {
            return response()->json(['message' => 'Unauthorized class access'], 403);
        }

        $classIdsToUse = $class_id !== null
            ? collect([(int) $class_id])
            : $assignedClassIds;

        $classes = DB::table('classes')
            ->leftJoin('etudiants', 'classes.id_classe', '=', 'etudiants.id_classe')
            ->select(
                'classes.id_classe',
                'classes.nom',
                'classes.niveau',
                DB::raw('COUNT(DISTINCT etudiants.id_etudiant) as students_count')
            )
            ->whereIn('classes.id_classe', $classIdsToUse)
            ->groupBy('classes.id_classe', 'classes.nom', 'classes.niveau')
            ->orderBy('classes.niveau')
            ->orderBy('classes.nom')
            ->get()
            ->map(function ($classe) {
                return [
                    'id' => (int) $classe->id_classe,
                    'nom' => $classe->nom,
                    'niveau' => $classe->niveau,
                    'label' => trim($classe->nom . ' - ' . $classe->niveau),
                    'students_count' => (int) $classe->students_count,
                ];
            })
            ->values();

        $students = DB::table('etudiants')
            ->join('users', 'etudiants.id_etudiant', '=', 'users.id')
            ->join('classes', 'etudiants.id_classe', '=', 'classes.id_classe')
            ->leftJoin('parents', 'etudiants.id_parent', '=', 'parents.id_parent')
            ->select(
                'users.id',
                'users.name',
                'users.nom',
                'users.prenom',
                'users.email',
                'classes.id_classe',
                'classes.nom as classe_nom',
                'classes.niveau as classe_niveau',
                'etudiants.matricule',
                'parents.telephone as parent_phone'
            )
            ->whereIn('etudiants.id_classe', $classIdsToUse)
            ->orderBy('classes.niveau')
            ->orderBy('classes.nom')
            ->orderBy('users.name')
            ->get()
            ->map(function ($student) {
                $firstName = $student->prenom ?: $student->name;
                $lastName = $student->nom ?: '';

                return [
                    'id' => (int) $student->id,
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                    'classId' => (int) $student->id_classe,
                    'class' => trim($student->classe_nom . ' - ' . $student->classe_niveau),
                    'avatar' => null,
                    'email' => $student->email,
                    'phone' => $student->parent_phone,
                    'rank' => null,
                    'average' => null,
                    'matricule' => $student->matricule,
                ];
            })
            ->values();

        return response()->json([
            'classes' => $classes,
            'students' => $students,
        ]);
    }

    /**
     * Announcements
     */
    public function getAnnouncements()
    {
        $announcements = DB::table('annonces')
            ->join('users', 'annonces.id_user', '=', 'users.id')
            ->select(
                'annonces.id_annonce as id',
                'annonces.titre as title',
                'annonces.contenu as content',
                'users.nom as author',
                'annonces.date_publication as date'
            )
            ->orderByDesc('annonces.date_publication')
            ->get()
            ->map(function($a) {
                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'content' => $a->content,
                    'author' => $a->author,
                    'date' => $a->date ? \Carbon\Carbon::parse($a->date)->diffForHumans() : 'Date inconnue',
                    'read' => true // logic for read/unread could be added later
                ];
            });

        return response()->json(['announcements' => $announcements]);
    }

    /**
     * Submit Complaint
     */
    public function submitComplaint(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|string',
            'message' => 'required|string',
        ]);

        return response()->json(['message' => 'Réclamation enregistrée avec succès.', 'complaint' => $validated], 201);
    }
}
