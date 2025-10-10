<?php

namespace Database\Seeders;

use App\Models\Family;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FamilySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $families = [
            [
                'id' => 1,
                'name' => 'Lácteos',
                'description' => 'Productos derivados de la leche como yogurt, mantequilla y quesos.',
            ],
            [
                'id' => 2,
                'name' => 'Bebidas',
                'description' => 'Bebidas gaseosas, jugos y aguas minerales.',
            ],
            [
                'id' => 3,
                'name' => 'Snacks',
                'description' => 'Aperitivos dulces y salados para picar.',
            ],
        ];

        foreach ($families as $family) {
            Family::updateOrCreate(
                ['id' => $family['id']],
                $family
            );
        }
    }
}
