/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Utensils, Sparkles, Loader2, Trash2, Info, Edit3, Check, X } from 'lucide-react';
import { Meal } from '../types';
import { analyzeMeal } from '../services/aiNutrition';

interface MealLoggerProps {
  onAddMeal: (meal: Omit<Meal, 'id' | 'timestamp'>) => void;
  onDeleteMeal: (id: string) => void;
  onUpdateMeal: (meal: Meal) => void;
  meals: Meal[];
}

export default function MealLogger({ onAddMeal, onDeleteMeal, onUpdateMeal, meals }: MealLoggerProps) {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Meal | null>(null);
  
  // Long press logic
  const [pressingId, setPressingId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = (meal: Meal) => {
    setPressingId(meal.id);
    timerRef.current = setTimeout(() => {
      handleStartEdit(meal);
      setPressingId(null);
    }, 600);
  };

  const cancelPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPressingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const nutrients = await analyzeMeal(description);
      
      onAddMeal({
        name: description,
        ...nutrients
      });
      
      setDescription('');
    } catch (error) {
      console.error("Meal analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartEdit = (meal: Meal) => {
    setEditingId(meal.id);
    setEditForm({ ...meal });
  };

  const handleSaveEdit = () => {
    if (editForm) {
      onUpdateMeal(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  return (
    <div className="dark-card h-full">
      <div className="flex items-center gap-2 mb-6">
        <Utensils className="text-accent" size={24} />
        <h2 className="text-xl font-bold uppercase tracking-tight">Refeições de Hoje</h2>
      </div>

      <div className="mb-6 p-3 bg-accent/5 border border-accent/10 rounded-xl flex items-start gap-4">
        <Info className="text-accent shrink-0 mt-0.5" size={16} />
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted font-bold uppercase leading-relaxed">
            Dica: Quantidades melhoram o cálculo (ex: "200g de peixe e 2 batatas").
          </p>
          <p className="text-[9px] text-accent/60 font-black uppercase tracking-widest">
            Segura numa refeição para editar ou apagar
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <input 
            placeholder="O que comeste?" 
            value={description}
            disabled={isAnalyzing}
            className="w-full bg-background border border-border-subtle rounded-2xl pl-12 pr-14 py-4 outline-none focus:border-accent transition-all font-medium placeholder:text-text-muted/50 text-text-main"
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {isAnalyzing ? (
              <Loader2 className="animate-spin text-accent" size={20} />
            ) : (
              <Sparkles className="text-accent" size={20} />
            )}
          </div>
          <button 
            type="submit"
            disabled={!description.trim() || isAnalyzing}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-black p-2 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg"
          >
            {isAnalyzing ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <PlusCircle size={24} />
            )}
          </button>
        </div>
      </form>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar text-text-main">
        {meals.length === 0 ? (
          <p className="text-center py-8 text-text-muted text-xs font-bold uppercase tracking-widest opacity-50">Nenhuma refeição registada</p>
        ) : (
          meals.map((meal) => (
            <div 
              key={meal.id} 
              onMouseDown={() => startPress(meal)}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={() => startPress(meal)}
              onTouchEnd={cancelPress}
              className={`p-3 bg-surface rounded-2xl border transition-all select-none cursor-pointer ${
                editingId === meal.id ? 'border-accent ring-1 ring-accent/20' : 
                pressingId === meal.id ? 'border-accent/50 scale-[0.98] bg-surface-hover' : 'border-border-subtle hover:border-accent/20'
              }`}
            >
              {editingId === meal.id && editForm ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-accent">Modo Edição</span>
                    <button onClick={() => onDeleteMeal(meal.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input 
                    className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent text-text-main"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  />
                  <div className="grid grid-cols-4 gap-2 text-text-main">
                    <NutritionInput label="Kcal" value={editForm.calories} onChange={v => setEditForm({...editForm, calories: v})} />
                    <NutritionInput label="Prot" value={editForm.protein} onChange={v => setEditForm({...editForm, protein: v})} />
                    <NutritionInput label="Carb" value={editForm.carbs} onChange={v => setEditForm({...editForm, carbs: v})} />
                    <NutritionInput label="Gord" value={editForm.fat} onChange={v => setEditForm({...editForm, fat: v})} />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 hover:bg-surface rounded-xl text-xs font-black uppercase text-text-muted transition-colors">
                      Cancelar
                    </button>
                    <button onClick={handleSaveEdit} className="px-6 py-2 bg-accent text-black rounded-xl hover:scale-105 transition-all text-xs font-black uppercase tracking-widest">
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="truncate pr-4 flex-1">
                    <p className="text-sm font-bold truncate group-hover:text-accent transition-colors">{meal.name}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span className="text-[10px] text-text-muted font-bold uppercase">{meal.calories} kcal</span>
                      <span className="text-[10px] text-accent/80 font-bold uppercase">P: {meal.protein}g</span>
                      <span className="text-[10px] text-blue-400/80 font-bold uppercase">C: {meal.carbs}g</span>
                      <span className="text-[10px] text-yellow-400/80 font-bold uppercase">G: {meal.fat}g</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/20 group-hover:bg-accent transition-colors" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function NutritionInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-black uppercase text-text-muted px-1">{label}</p>
      <input 
        type="number"
        className="w-full bg-background border border-border-subtle rounded-lg px-2 py-2 text-xs font-bold outline-none focus:border-accent text-center text-text-main"
        value={value}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
      />
    </div>
  );
}
