<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PaiementsDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! Schema::hasTable('paiements') || ! Schema::hasTable('etudiants')) {
            return;
        }

        $studentIds = DB::table('etudiants')
            ->orderBy('id_etudiant')
            ->limit(60)
            ->pluck('id_etudiant')
            ->all();

        if (empty($studentIds)) {
            return;
        }

        $year = (int) now()->format('Y');
        $month = (int) now()->format('n');
        $now = now();
        $hasReste = Schema::hasColumn('paiements', 'reste');

        foreach ($studentIds as $index => $studentId) {
            $amount = 500;
            $isPaid = $index % 3 !== 0;
            $status = $isPaid ? 'paye' : 'non_paye';

            $payload = [
                'montant' => $amount,
                'type' => 'mensuel',
                'statut' => $status,
                'date_paiement' => $isPaid ? $now->toDateString() : null,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if ($hasReste) {
                $payload['reste'] = $isPaid ? 0 : $amount;
            }

            DB::table('paiements')->updateOrInsert(
                [
                    'id_etudiant' => (int) $studentId,
                    'mois' => $month,
                    'annee' => $year,
                ],
                $payload
            );
        }
    }
}
