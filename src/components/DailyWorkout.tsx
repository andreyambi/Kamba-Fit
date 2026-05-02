/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dumbbell, CheckCircle2, Circle, Info, X, PlayCircle, ArrowRight } from 'lucide-react';
import { WorkoutDay, Exercise } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DailyWorkoutProps {
  workout: WorkoutDay | null;
  completedExercises?: { exerciseName: string; date: string }[];
  onToggleExercise: (name: string) => void;
}

export default function DailyWorkout({ workout, completedExercises = [], onToggleExercise }: DailyWorkoutProps) {
  const [infoExercise, setInfoExercise] = useState<Exercise | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const currentCompleted = completedExercises
    .filter(e => e.date === today)
    .map(e => e.exerciseName);

  if (!workout) {
    return (
      <div className="dark-card text-center py-12">
        <Dumbbell className="mx-auto text-text-muted mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Dia de Descanso</h2>
        <p className="text-text-muted">Aproveita para recuperar e bater os teus macros!</p>
      </div>
    );
  }

  const progress = (currentCompleted.length / workout.exercises.length) * 100;

  return (
    <div className="dark-card">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Dumbbell className="text-accent" size={24} />
          <div>
            <h2 className="text-xl font-bold">Treino de Hoje</h2>
            <p className="text-xs text-accent uppercase tracking-wider font-semibold">{workout.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{Math.round(progress)}% Concluído</p>
          <div className="w-24 h-1.5 bg-surface rounded-full mt-1">
            <div className="h-full gold-gradient rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {workout.exercises.map((ex, idx) => {
          const isCompleted = currentCompleted.includes(ex.name);
          return (
            <div 
               key={idx}
               className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                isCompleted 
                  ? 'bg-accent/10 border-accent/30 opacity-70 shadow-inner' 
                  : 'bg-surface border-border-subtle hover:border-accent/30'
              }`}
            >
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => onToggleExercise(ex.name)}
              >
                {isCompleted ? (
                  <CheckCircle2 className="text-accent" size={24} />
                ) : (
                  <Circle className="text-text-muted/20" size={24} />
                )}
                <div>
                  <h3 className={`font-bold transition-all ${isCompleted ? 'line-through text-text-muted' : ''}`}>
                    {ex.name}
                  </h3>
                  <div className="flex gap-4 text-xs text-text-muted mt-1 uppercase">
                    <span>{ex.sets} Séries</span>
                    <span>{ex.reps} Reps</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setInfoExercise(ex);
                }}
                className="p-2 mr-2 text-accent hover:bg-accent/10 rounded-full transition-colors flex items-center justify-center border border-accent/10"
                title="Informações do Exercício"
              >
                <span className="font-black italic text-sm">!</span>
              </button>
            </div>
          );
        })}
      </div>

      {progress === 100 && (
        <div className="mt-8 text-center animate-bounce">
          <p className="text-accent font-bold">Excelente trabalho! Treino finalizado. 🔥</p>
        </div>
      )}

      {/* Exercise Info Modal */}
      <AnimatePresence>
        {infoExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background/90 backdrop-blur-md"
            onClick={() => setInfoExercise(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card border border-white/10 rounded-[32px] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border-subtle flex items-center justify-between gold-gradient text-black">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Info size={14} className="opacity-70" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Instruções</p>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight leading-tight">{infoExercise.name}</h3>
                </div>
                <button 
                  onClick={() => setInfoExercise(null)}
                  className="p-2 hover:bg-black/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Execução</h4>
                    <div className="text-sm leading-relaxed text-text-main/90 italic">
                      {infoExercise.description || "Nenhuma instrução específica fornecida para este exercício. Segue a forma padrão de execução focando na conexão mente-músculo."}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface p-3 rounded-xl border border-border-subtle">
                      <p className="text-[8px] font-bold text-text-muted uppercase mb-1">Séries</p>
                      <p className="text-lg font-black">{infoExercise.sets}</p>
                    </div>
                    <div className="bg-surface p-3 rounded-xl border border-border-subtle">
                      <p className="text-[8px] font-bold text-text-muted uppercase mb-1">Reps</p>
                      <p className="text-lg font-black">{infoExercise.reps}</p>
                    </div>
                  </div>

                  {infoExercise.videoUrl && (
                    <a 
                      href={infoExercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full bg-accent/10 border border-accent/20 p-4 rounded-2xl group hover:bg-accent hover:text-black transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle className="group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-tight">Ver Demonstração</p>
                          <p className="text-[9px] opacity-70">Link Externo</p>
                        </div>
                      </div>
                      <ArrowRight size={16} />
                    </a>
                  )}
                  
                  <p className="text-[9px] text-center text-text-muted font-medium opacity-50 px-4">
                    Kamba Fit Elite: A técnica correta é mais importante do que a carga utilizada.
                  </p>
                </div>
              </div>
              
              <div className="p-6 border-t border-border-subtle">
                <button 
                  onClick={() => setInfoExercise(null)}
                  className="w-full bg-accent text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-accent/20"
                >
                  Entendido!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
