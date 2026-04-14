<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\EmploiDuTemps;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmploiDuTempsController extends Controller
{
    public function lookups()
    {
        $classes = Classe::query()
            ->select('id_classe', 'nom', 'niveau')
            ->orderBy('nom')
            ->get();

        $assignments = DB::table('enseigner')
            ->join('matieres', 'enseigner.id_matiere', '=', 'matieres.id_matiere')
            ->leftJoin('professeurs', 'enseigner.id_professeur', '=', 'professeurs.id_professeur')
            ->leftJoin('users as prof_users', 'professeurs.id_professeur', '=', 'prof_users.id')
            ->select(
                'enseigner.id_classe',
                'enseigner.id_matiere',
                'enseigner.id_professeur',
                'matieres.nom as matiere_nom',
                'prof_users.nom as professeur_nom',
                'prof_users.prenom as professeur_prenom'
            )
            ->orderBy('matieres.nom')
            ->get();

        $matieresByClass = [];
        $matiereSeenByClass = [];
        $professeurByClassMatiere = [];

        foreach ($assignments as $assignment) {
            $classKey = (string) $assignment->id_classe;
            $matiereKey = (string) $assignment->id_matiere;

            if (! isset($matieresByClass[$classKey])) {
                $matieresByClass[$classKey] = [];
                $matiereSeenByClass[$classKey] = [];
            }

            if (! isset($matiereSeenByClass[$classKey][$matiereKey])) {
                $matieresByClass[$classKey][] = [
                    'id_matiere' => (int) $assignment->id_matiere,
                    'nom' => (string) $assignment->matiere_nom,
                ];
                $matiereSeenByClass[$classKey][$matiereKey] = true;
            }

            $professeurByClassMatiere[$classKey . '-' . $matiereKey] = [
                'id_professeur' => $assignment->id_professeur ? (int) $assignment->id_professeur : null,
                'nom_complet' => trim(((string) ($assignment->professeur_prenom ?? '')) . ' ' . ((string) ($assignment->professeur_nom ?? ''))),
            ];
        }

        return response()->json([
            'classes' => $classes,
            'matieres_by_class' => $matieresByClass,
            'professeur_by_class_matiere' => $professeurByClassMatiere,
        ]);
    }

    public function index()
    {
        $emplois = EmploiDuTemps::with(['classe', 'matiere', 'professeur'])
            ->orderBy('jour')
            ->orderBy('heure_debut')
            ->get();

        return response()->json($emplois);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'jour' => 'required|string|max:50',
            'heure_debut' => 'required|date_format:H:i',
            'duree_heures' => 'nullable|integer|in:1,2',
            'heure_fin' => 'nullable|date_format:H:i',
            'salle' => 'nullable|string|max:50',
            'couleur' => 'nullable|string|max:20',
            'statut' => 'nullable|string|max:50',
            'id_classe' => 'required|integer|exists:classes,id_classe',
            'id_matiere' => 'required|integer|exists:matieres,id_matiere',
            'id_professeur' => 'nullable|integer|exists:professeurs,id_professeur',
        ]);

        $resolvedProfesseurId = $this->resolveAssignedProfessorId((int) $validated['id_classe'], (int) $validated['id_matiere']);
        if (! $resolvedProfesseurId) {
            return response()->json([
                'message' => 'Aucun professeur assigne a cette classe et matiere.',
            ], 422);
        }

        $durationHours = isset($validated['duree_heures']) ? (int) $validated['duree_heures'] : 1;
        $validated['id_professeur'] = $resolvedProfesseurId;
        $validated['heure_fin'] = $this->resolveEndTime($validated['heure_debut'], $durationHours);

        if ($this->hasTimeConflict((int) $validated['id_classe'], $validated['jour'], $validated['heure_debut'], $validated['heure_fin'])) {
            return response()->json([
                'message' => 'Ce creneau est deja occupe pour ce jour.',
            ], 422);
        }

        unset($validated['duree_heures']);

        $emploi = EmploiDuTemps::create($validated);
        return response()->json($emploi->load(['classe', 'matiere', 'professeur']), 201);
    }

    public function update(Request $request, $id)
    {
        $emploi = EmploiDuTemps::findOrFail($id);
        
        $validated = $request->validate([
            'jour' => 'required|string|max:50',
            'heure_debut' => 'required|date_format:H:i',
            'duree_heures' => 'nullable|integer|in:1,2',
            'heure_fin' => 'nullable|date_format:H:i',
            'salle' => 'nullable|string|max:50',
            'couleur' => 'nullable|string|max:20',
            'statut' => 'nullable|string|max:50',
            'id_classe' => 'required|integer|exists:classes,id_classe',
            'id_matiere' => 'required|integer|exists:matieres,id_matiere',
            'id_professeur' => 'nullable|integer|exists:professeurs,id_professeur',
        ]);

        $resolvedProfesseurId = $this->resolveAssignedProfessorId((int) $validated['id_classe'], (int) $validated['id_matiere']);
        if (! $resolvedProfesseurId) {
            return response()->json([
                'message' => 'Aucun professeur assigne a cette classe et matiere.',
            ], 422);
        }

        $durationHours = isset($validated['duree_heures']) ? (int) $validated['duree_heures'] : 1;
        $validated['id_professeur'] = $resolvedProfesseurId;
        $validated['heure_fin'] = $this->resolveEndTime($validated['heure_debut'], $durationHours);

        if ($this->hasTimeConflict((int) $validated['id_classe'], $validated['jour'], $validated['heure_debut'], $validated['heure_fin'], (int) $emploi->id_edt)) {
            return response()->json([
                'message' => 'Ce creneau est deja occupe pour ce jour.',
            ], 422);
        }

        unset($validated['duree_heures']);

        $emploi->update($validated);
        return response()->json($emploi->load(['classe', 'matiere', 'professeur']));
    }

    public function destroy($id)
    {
        EmploiDuTemps::destroy($id);
        return response()->json(null, 204);
    }

    private function resolveAssignedProfessorId(int $classId, int $matiereId): ?int
    {
        $professeurId = DB::table('enseigner')
            ->where('id_classe', $classId)
            ->where('id_matiere', $matiereId)
            ->value('id_professeur');

        return $professeurId ? (int) $professeurId : null;
    }

    private function resolveEndTime(string $startTime, int $durationHours = 1): string
    {
        $date = \DateTime::createFromFormat('H:i', $startTime);

        if (! $date) {
            return $startTime;
        }

        $safeDuration = max(1, min(2, $durationHours));
        $date->modify('+' . $safeDuration . ' hour');
        return $date->format('H:i');
    }

    private function hasTimeConflict(int $classId, string $jour, string $startTime, string $endTime, ?int $ignoreId = null): bool
    {
        $newStart = \DateTime::createFromFormat('H:i', $startTime);
        $newEnd = \DateTime::createFromFormat('H:i', $endTime);

        if (! $newStart || ! $newEnd) {
            return false;
        }

        $query = EmploiDuTemps::query()
            ->where('id_classe', $classId)
            ->where('jour', $jour);
        if ($ignoreId !== null) {
            $query->where('id_edt', '!=', $ignoreId);
        }

        $existingSlots = $query->get(['heure_debut', 'heure_fin']);

        foreach ($existingSlots as $slot) {
            $existingStartValue = substr((string) $slot->heure_debut, 0, 5);
            $existingEndValue = $slot->heure_fin
                ? substr((string) $slot->heure_fin, 0, 5)
                : $this->resolveEndTime($existingStartValue, 1);

            $existingStart = \DateTime::createFromFormat('H:i', $existingStartValue);
            $existingEnd = \DateTime::createFromFormat('H:i', $existingEndValue);

            if (! $existingStart || ! $existingEnd) {
                continue;
            }

            if ($newStart < $existingEnd && $newEnd > $existingStart) {
                return true;
            }
        }

        return false;
    }
}