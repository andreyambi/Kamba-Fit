/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target } from 'lucide-react';

interface NutritionCardProps {
  targets: { calories: number; protein: number; carbs: number; fat: number };
  current: { calories: number; protein: number; carbs: number; fat: number };
}

export default function NutritionCard({ targets, current }: NutritionCardProps) {
  const stats = [
    { label: 'Calorias', icon: null, current: current.calories, target: targets.calories, unit: 'kcal' },
    { label: 'Proteína', icon: null, current: current.protein, target: targets.protein, unit: 'g' },
    { label: 'Carbos', icon: null, current: current.carbs, target: targets.carbs, unit: 'g' },
    { label: 'Gordura', icon: null, current: current.fat, target: targets.fat, unit: 'g' },
  ];

  return (
    <div className="dark-card h-full">
      <div className="flex items-center gap-2 mb-6">
        <Target className="text-accent" size={24} />
        <h2 className="text-xl font-bold">Meta Nutricional</h2>
      </div>
      
      <div className="space-y-6">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm text-text-muted">{stat.label}</span>
              <span className="text-sm">
                <span className="font-bold">{stat.current}</span> / {stat.target} {stat.unit}
              </span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div 
                className="h-full gold-gradient transition-all duration-500" 
                style={{ width: `${Math.min(100, (stat.current / stat.target) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-accent/5 rounded-xl border border-accent/10">
        <p className="text-xs text-accent/80 text-center italic">
          "A consistência na dieta é 70% do resultado. Não falte às tuas refeições!"
        </p>
      </div>
    </div>
  );
}
