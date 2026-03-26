<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Resource;
use App\Models\Announcement;
use App\Models\Classe;
use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Http\Request;

class ProfessorController extends Controller
{
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
        // MOCK data to return to React Eleves page
        $students = [
            ['id' => 1, 'firstName' => 'Ayoub', 'lastName' => 'Karim', 'class' => 'Master 2 - IA', 'avatar' => 'https://i.pravatar.cc/150?u=1', 'email' => 'ayoub@linkedu.ma', 'phone' => '+212 600-000001', 'rank' => 1, 'average' => 18.5],
            ['id' => 2, 'firstName' => 'Zineb', 'lastName' => 'Benjelloun', 'class' => 'Master 2 - IA', 'avatar' => 'https://i.pravatar.cc/150?u=2', 'email' => 'zineb@linkedu.ma', 'phone' => '+212 600-000002', 'rank' => 2, 'average' => 17.8]
        ];

        return response()->json(['students' => $students]);
    }

    /**
     * Announcements
     */
    public function getAnnouncements()
    {
        $announcements = [
            ['id' => 1, 'title' => 'Réunion du corps professoral', 'content' => 'Une réunion...', 'author' => 'Directeur', 'date' => 'Aujourd\'hui, 10:30', 'read' => false],
            ['id' => 2, 'title' => 'Maintenance de la plateforme', 'content' => 'Mise à jour...', 'author' => 'Service IT', 'date' => 'Hier, 14:15', 'read' => true],
        ];

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
