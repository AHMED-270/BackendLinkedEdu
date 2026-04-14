<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SidebarClassesSeeder extends Seeder
{
    public function run(): void
    {
        if (! Schema::hasTable('classes')) {
            return;
        }

        $now = now();

        $classes = [
            ['nom' => '6A', 'niveau' => 'College'],
            ['nom' => '6B', 'niveau' => 'College'],
            ['nom' => '5A', 'niveau' => 'College'],
            ['nom' => '4A', 'niveau' => 'College'],
            ['nom' => 'TC Sciences 1', 'niveau' => 'Lycee'],
            ['nom' => '1ere Bac SM', 'niveau' => 'Lycee'],
            ['nom' => '2eme Bac PC', 'niveau' => 'Lycee'],
            ['nom' => 'CM2 A', 'niveau' => 'Primaire'],
        ];

        foreach ($classes as $classe) {
            DB::table('classes')->updateOrInsert(
                [
                    'nom' => $classe['nom'],
                    'niveau' => $classe['niveau'],
                ],
                [
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
