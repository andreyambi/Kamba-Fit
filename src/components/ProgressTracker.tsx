/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingUp, Plus, Calendar, Utensils, Search, Activity, Dumbbell, CheckCircle2 } from 'lucide-react';
import { WeightLog, Meal, CompletedExercise, WorkoutDay } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressTrackerProps {
  history: WeightLog[];
  mealHistory: Meal[];
  completedExercises: CompletedExercise[];
  todayWorkout: WorkoutDay | null;
  profileWeight: number;
  onLogWeight: (weight: number) => void;
}

export default function ProgressTracker({ history, mealHistory, completedExercises, todayWorkout, profileWeight, onLogWeight }: ProgressTrackerProps) {
  const [newWeight, setNewWeight] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'weight' | 'meals' | 'workout'>('weight');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeight) {
      onLogWeight(parseFloat(newWeight));
      setNewWeight('');
    }
  };

  const sortedWeightHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const initialWeight = history[0]?.weight || profileWeight;
  const currentWeight = sortedWeightHistory[0]?.weight || profileWeight;
  const diff = currentWeight - initialWeight;

  const sortedMealHistory = [...mealHistory].sort((a, b) => b.timestamp - a.timestamp);

  // Prepare chart data
  const chartData = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => ({
      date: new Date(log.date).toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit' }),
      peso: log.weight
    }));

  // Workout Summary
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCompleted = completedExercises.filter(e => e.date === todayStr);
  const totalCompleted = completedExercises.length;
  
  // Group by date to see consistency
  const workoutDays = new Set(completedExercises.map(e => e.date)).size;

  const renderWorkoutTab = () => {
    const todayTotal = todayWorkout?.exercises.length || 0;
    const todayDone = todayCompleted.length;
    const todayProgress = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="dark-card">
          <div className="flex items-center gap-2 mb-6">
            <Dumbbell className="text-accent" size={24} />
            <h2 className="text-xl font-bold uppercase tracking-tight">Evolução de Treino</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface p-4 rounded-2xl border border-border-subtle text-center">
              <p className="text-[10px] text-text-muted mb-1 uppercase font-black tracking-widest">Treino Atual</p>
              <p className="text-2xl font-black text-accent">{todayProgress}%</p>
              <p className="text-[10px] text-text-muted/60 mt-1 uppercase font-bold">{todayDone} de {todayTotal} feitos</p>
            </div>
            <div className="bg-surface p-4 rounded-2xl border border-border-subtle text-center">
              <p className="text-[10px] text-text-muted mb-1 uppercase font-black tracking-widest">Treinos Totais</p>
              <p className="text-2xl font-black text-text-main">{workoutDays}</p>
              <p className="text-[10px] text-text-muted/60 mt-1 uppercase font-bold">Dias ativos no plano</p>
            </div>
            <div className="bg-surface p-4 rounded-2xl border border-border-subtle text-center">
              <p className="text-[10px] text-text-muted mb-1 uppercase font-black tracking-widest">Exercícios</p>
              <p className="text-2xl font-black text-text-main">{totalCompleted}</p>
              <p className="text-[10px] text-text-muted/60 mt-1 uppercase font-bold">Total concluído</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Progresso do Dia</h3>
            {todayWorkout ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-surface p-4 rounded-2xl border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-text-main">{todayWorkout.label}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase">{todayDone} / {todayTotal} Exercícios</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-accent">{todayProgress}%</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-surface rounded-2xl border border-dashed border-border-subtle">
                <p className="text-sm text-text-muted font-bold">Hoje é dia de descanso ou sem treino ativo.</p>
              </div>
            )}
          </div>
        </div>

        <div className="dark-card">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-accent" size={24} />
            <h2 className="text-xl font-bold uppercase tracking-tight">Histórico de Atividade</h2>
          </div>
          <div className="space-y-2">
            {[...new Set(completedExercises.map(e => e.date))]
              .sort((a,b) => b.localeCompare(a))
              .slice(0, 7)
              .map(date => {
                const count = completedExercises.filter(e => e.date === date).length;
                return (
                  <div key={date} className="flex justify-between items-center p-4 bg-surface rounded-xl border border-border-subtle">
                    <span className="text-xs font-bold text-text-muted">{new Date(date).toLocaleDateString('pt-AO', { weekday: 'long', day: '2-digit', month: '2-digit' })}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-accent font-black text-xs uppercase">{count} exercícios</span>
                      <CheckCircle2 size={14} className="text-green-500" />
                    </div>
                  </div>
                );
              })
            }
            {workoutDays === 0 && (
              <div className="text-center py-12">
                <Dumbbell className="mx-auto text-white/10 mb-4" size={48} />
                <p className="text-xs text-text-muted font-black uppercase tracking-widest">Nenhum treino registado ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex gap-4 mb-2 overflow-x-auto pb-2 custom-scrollbar">
        <button 
          onClick={() => setActiveSubTab('weight')}
          className={`shrink-0 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'weight' ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'bg-white/5 text-text-muted border border-white/5 hover:bg-white/10'}`}
        >
          Peso
        </button>
        <button 
          onClick={() => setActiveSubTab('workout')}
          className={`shrink-0 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'workout' ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'bg-white/5 text-text-muted border border-white/5 hover:bg-white/10'}`}
        >
          Treino
        </button>
        <button 
          onClick={() => setActiveSubTab('meals')}
          className={`shrink-0 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'meals' ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'bg-white/5 text-text-muted border border-white/5 hover:bg-white/10'}`}
        >
          Refeições
        </button>
      </div>

      {activeSubTab === 'weight' && (
        <div className="space-y-6">
          <div className="dark-card">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-accent" size={24} />
              <h2 className="text-xl font-bold uppercase tracking-tight">Evolução de Peso</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface p-4 rounded-2xl border border-border-subtle text-center">
                <p className="text-[10px] text-text-muted mb-1 uppercase font-black">Atual</p>
                <p className="text-2xl font-black">{currentWeight} <span className="text-sm font-normal">kg</span></p>
              </div>
              <div className="bg-surface p-4 rounded-2xl border border-border-subtle text-center">
                <p className="text-[10px] text-text-muted mb-1 uppercase font-black">Variação</p>
                <p className={`text-2xl font-black ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)} <span className="text-sm font-normal">kg</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-8 max-w-full">
              <input 
                type="number"
                step="0.1"
                placeholder="Novo peso..."
                value={newWeight}
                className="flex-1 min-w-0 bg-background border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-accent font-bold placeholder:text-text-muted/30"
                onChange={(e) => setNewWeight(e.target.value)}
              />
              <button 
                type="submit" 
                className="shrink-0 bg-accent text-black px-6 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg text-xs font-black uppercase tracking-widest"
              >
                Lançar
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Histórico Recente</h3>
              <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {sortedWeightHistory.slice(0, 10).map((log, idx) => (
                   <div key={idx} className="flex justify-between items-center py-4 border-b border-border-subtle last:border-0">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar size={14} className="text-accent" />
                      <span className="font-medium text-text-muted">{new Date(log.date).toLocaleDateString('pt-AO')}</span>
                    </div>
                    <span className="font-black text-accent">{log.weight} kg</span>
                  </div>
                ))}
                {sortedWeightHistory.length === 0 && <p className="text-sm text-text-muted text-center py-8">Sem registos ainda.</p>}
              </div>
            </div>
          </div>

          {chartData.length > 1 && (
            <div className="dark-card h-[400px]">
              <div className="flex items-center gap-2 mb-8">
                <Activity className="text-accent" size={24} />
                <h2 className="text-xl font-bold uppercase tracking-tight">Gráfico de Progresso</h2>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--text-muted)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '16px',
                        fontSize: '12px',
                        color: 'var(--text-main)'
                      }}
                      itemStyle={{ color: '#C9A227' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="peso" 
                      stroke="#C9A227" 
                      strokeWidth={3}
                      dot={{ fill: '#C9A227', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, stroke: '#C9A227', strokeWidth: 2, fill: '#000' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-center text-[10px] text-text-muted font-black uppercase tracking-widest">
                Continua focado para veres a curva a descer (ou subir)!
              </p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'workout' && renderWorkoutTab()}

      {activeSubTab === 'meals' && (
        <div className="dark-card">
          <div className="flex items-center gap-2 mb-6">
            <Utensils className="text-accent" size={24} />
            <h2 className="text-xl font-bold uppercase tracking-tight">Planilha de Nutrição</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4">Data</th>
                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4">Refeição</th>
                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4">Kcal</th>
                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4">P (g)</th>
                </tr>
              </thead>
              <tbody>
                {sortedMealHistory.map((meal) => (
                  <tr key={meal.id} className="border-b border-border-subtle hover:bg-surface transition-colors">
                    <td className="py-4 text-xs font-bold text-text-muted px-4">
                      {new Date(meal.timestamp).toLocaleDateString('pt-AO')}
                    </td>
                    <td className="py-4 text-sm font-black px-4 truncate max-w-[150px] text-text-main">
                      {meal.name}
                    </td>
                    <td className="py-4 text-sm font-black text-accent px-4">
                      {meal.calories}
                    </td>
                    <td className="py-4 text-sm font-black text-accent/60 px-4">
                      {meal.protein}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedMealHistory.length === 0 && (
              <p className="text-center py-12 text-text-muted text-xs font-black uppercase tracking-widest">A aguardar o primeiro registo</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
