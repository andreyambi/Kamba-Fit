/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { FitnessState, Meal, UserProfile, ChatMessage } from '../types';
import { calculateTargets, generateWorkoutPlan, getDailyWorkout, getWorkoutForDay } from '../utils/fitness';
import NutritionCard from './NutritionCard';
import MealLogger from './MealLogger';
import DailyWorkout from './DailyWorkout';
import ProgressTracker from './ProgressTracker';
import ChatAssistant from './ChatAssistant';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  Home, 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  MessageSquare,
  LayoutDashboard,
  User,
  Settings,
  X,
  Sun,
  Moon,
  Info,
  PlayCircle,
  ArrowRight
} from 'lucide-react';
import ProfileView from './ProfileView';

interface DashboardProps {
  state: FitnessState;
  dispatch: {
    addMeal: (meal: Omit<Meal, 'id' | 'timestamp'>) => void;
    deleteMeal: (id: string) => void;
    updateMeal: (meal: Meal) => void;
    logWeight: (weight: number) => void;
    toggleExercise: (exerciseName: string) => void;
    updateChatHistory: (messages: ChatMessage[]) => void;
    logout: () => void;
    updateProfile: (profile: UserProfile) => void;
    toggleTheme: () => void;
  };
  theme: 'light' | 'dark';
}

type TabType = 'home' | 'workout' | 'nutrition' | 'progress' | 'chat' | 'profile_view';

export default function Dashboard({ state, dispatch, theme }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return (localStorage.getItem('kamba_fit_active_tab') as TabType) || 'home';
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('kamba_fit_active_tab', tab);
  };

  const [selectedDayWorkout, setSelectedDayWorkout] = useState<{ day: string, workout: any } | null>(null);
  const [infoExercise, setInfoExercise] = useState<any | null>(null);
  const { profile, meals, weightHistory, caloriesAdjustment } = state;
  const { logout } = useAuth();

  const targets = useMemo(() => {
    if (!profile) return null;
    return calculateTargets(profile, caloriesAdjustment);
  }, [profile, caloriesAdjustment]);

  const workoutPlan = useMemo(() => {
    if (!profile) return null;
    return generateWorkoutPlan(profile);
  }, [profile]);

  const todayWorkout = useMemo(() => {
    if (!profile || !workoutPlan) return null;
    return getDailyWorkout(profile, workoutPlan);
  }, [profile, workoutPlan]);

  if (!profile || !targets) return null;

  const todayMeals = meals.filter(m => {
    const d = new Date(m.timestamp);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const totals = todayMeals.reduce((acc, m) => ({
    calories: acc.calories + m.calories,
    protein: acc.protein + m.protein,
    carbs: acc.carbs + m.carbs,
    fat: acc.fat + m.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleLogout = () => {
    if (confirm('Deseja realmente sair da sua conta?')) {
      logout();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile_view':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
            <button 
              type="button"
              onClick={() => handleTabChange('home')}
              className="absolute right-0 top-0 p-2 hover:bg-surface rounded-full z-10"
            >
              <X size={24} />
            </button>
            <ProfileView 
              profile={profile}
              onUpdate={dispatch.updateProfile}
              onLogout={dispatch.logout}
            />
          </motion.div>
        );
      case 'home':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* The location tag is now part of the scrollable content */}
            <div className="flex justify-center mb-4 text-text-main">
              <div className="bg-card/50 backdrop-blur border border-border-subtle px-4 py-2 rounded-full text-[10px] uppercase font-bold text-accent tracking-[0.2em]">
                {profile.province}, Angola • {new Date().toLocaleDateString('pt-AO')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NutritionCard targets={targets} current={totals} />
              <div className="dark-card h-full flex flex-col justify-center text-center py-8">
                <h3 className="text-text-muted font-bold text-[10px] uppercase tracking-widest mb-4">Status de Peso</h3>
                <p className="text-4xl font-black text-accent">{profile.weight} <span className="text-sm text-text-muted tracking-normal">kg</span></p>
                <p className="text-[10px] text-text-muted mt-4 font-bold uppercase tracking-tight">Focado no teu plano de {profile.goal === 'mass' ? 'ganho' : 'perda'}</p>
              </div>
            </div>

            <div className="dark-card border-border-subtle overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Dumbbell size={80} />
              </div>
              <h3 className="text-accent font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={12} /> Teu Plano Semanal ({profile.daysPerWeek} dias de treino)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, i) => {
                  const dayOfWeek = i === 6 ? 0 : i + 1;
                  const isToday = new Date().getDay() === dayOfWeek;
                  const dayWorkout = getWorkoutForDay(profile, workoutPlan, dayOfWeek);
                  const isRest = !dayWorkout;

                  return (
                    <div 
                      key={day} 
                      onClick={() => !isRest && setSelectedDayWorkout({ day, workout: dayWorkout })}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isToday 
                          ? 'bg-accent text-black border-accent shadow-lg shadow-accent/20 scale-105 z-10' 
                          : 'bg-surface border-border-subtle opacity-80 hover:bg-surface-hover hover:opacity-100'
                      }`}
                    >
                      <p className={`text-[8px] font-black uppercase mb-1 ${isToday ? 'text-black/60' : 'text-text-muted'}`}>{day}</p>
                      <p className="text-[10px] font-black leading-tight uppercase truncate">
                        {isRest ? 'Descanso' : dayWorkout.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dark-card bg-accent/5 border-accent/20 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Dumbbell size={120} />
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <h3 className="text-accent font-black text-xs uppercase tracking-widest">Destaque do Dia</h3>
                </div>
                <div className="px-3 py-1 bg-accent text-black rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">Hoje</div>
              </div>
              <div className="md:flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">
                    {todayWorkout?.label || 'Dia de Descanso 🧘'}
                  </h2>
                  <p className="text-sm text-text-muted max-w-md">
                    {todayWorkout 
                      ? `Preparado para começar? Tens ${todayWorkout.exercises.length} exercícios focados no teu objetivo de ${profile.goal === 'mass' ? 'hipertrofia' : 'definição'}.`
                      : 'Aproveita para recuperar as energias. O descanso é essencial para o teu progresso no Kamba Fit!'
                    }
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleTabChange('workout')}
                  className="mt-6 md:mt-0 bg-text-main text-background px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-black transition-colors shadow-xl"
                >
                  Ir para o Treino →
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 'workout':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <DailyWorkout 
              workout={todayWorkout} 
              completedExercises={state.completedExercises}
              onToggleExercise={dispatch.toggleExercise}
            />
          </motion.div>
        );
      case 'nutrition':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NutritionCard targets={targets} current={totals} />
            <MealLogger 
              onAddMeal={dispatch.addMeal} 
              onDeleteMeal={dispatch.deleteMeal}
              onUpdateMeal={dispatch.updateMeal}
              meals={todayMeals} 
            />
          </motion.div>
        );
      case 'progress':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <ProgressTracker 
              history={weightHistory} 
              mealHistory={state.mealHistory || []} 
              completedExercises={state.completedExercises || []}
              todayWorkout={todayWorkout}
              profileWeight={profile.weight}
              onLogWeight={dispatch.logWeight} 
            />
          </motion.div>
        );
      case 'chat':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
            <ChatAssistant profile={profile} state={state} dispatch={dispatch} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Geral' },
    { id: 'workout', icon: Dumbbell, label: 'Treino' },
    { id: 'nutrition', icon: Utensils, label: 'Dieta' },
    { id: 'progress', icon: TrendingUp, label: 'Estatística' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top Header - Hidden in Chat for more space */}
      {activeTab !== 'chat' && (
        <>
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 h-20 flex items-center justify-between">
            <div 
              onClick={() => handleTabChange('profile_view')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center font-black text-black group-hover:scale-110 transition-transform shadow-lg relative">
                <User size={20} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-card rounded-full border border-accent flex items-center justify-center">
                  <Settings size={8} className="text-accent" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tighter leading-none group-hover:text-accent transition-colors">KAMBA <span className="text-accent">FIT</span></h1>
                <p className="text-[10px] text-accent font-bold uppercase tracking-widest mt-1">Elite Performance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={dispatch.toggleTheme}
                className="w-10 h-10 rounded-xl bg-card border border-black/5 dark:border-white/5 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 shadow-sm"
                title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              >
                {theme === 'dark' ? <Sun size={18} className="text-accent" /> : <Moon size={18} className="text-accent" />}
              </button>
              
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right mr-2">
                  <p className="text-[10px] text-text-muted font-bold uppercase">Utilizador Pro</p>
                  <p className="text-sm font-black text-accent">{profile.name.split(' ')[0]}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Bottom Header Spacing fix */}
          <div className="h-4" />
        </>
      )}

      {/* Workout Detail Modal */}
      <AnimatePresence>
        {selectedDayWorkout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background/90 backdrop-blur-sm"
            onClick={() => setSelectedDayWorkout(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card border border-white/10 rounded-[32px] w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border-subtle flex items-center justify-between gold-gradient text-black">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{selectedDayWorkout.day}</p>
                  <h3 className="text-xl font-black uppercase tracking-tight">{selectedDayWorkout.workout.label}</h3>
                </div>
                <button 
                  onClick={() => setSelectedDayWorkout(null)}
                  className="p-2 hover:bg-black/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                {selectedDayWorkout.workout.exercises.map((ex: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border-subtle">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-black text-xs">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-main uppercase">{ex.name}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5">{ex.sets} séries × {ex.reps}</p>
                    </div>
                    <button 
                      onClick={() => setInfoExercise(ex)}
                      className="p-2 text-accent hover:bg-accent/10 rounded-full transition-colors border border-accent/10"
                    >
                      <span className="font-black italic text-xs">!</span>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-border-subtle">
                <button 
                  onClick={() => setSelectedDayWorkout(null)}
                  className="w-full bg-accent text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={`max-w-7xl mx-auto transition-all ${activeTab === 'chat' ? 'px-0 h-[calc(100dvh-120px)]' : 'px-6 pt-4 md:pt-8'}`}>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {/* Modern High-End Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg">
        <div className="bg-card/80 backdrop-blur-2xl border border-border-subtle rounded-[32px] p-2 flex justify-between items-center shadow-2xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id as TabType)}
                className={`relative flex flex-col items-center justify-center flex-1 py-3 transition-all duration-300 ${
                  isActive ? 'text-accent' : 'text-text-muted opacity-50 hover:opacity-100'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-glow"
                    className="absolute -top-1 w-8 h-1 bg-accent rounded-full shadow-[0_0_10px_#D4AF37]"
                  />
                )}
                <Icon size={24} className={isActive ? 'scale-110' : ''} />
                <span className={`text-[10px] font-black uppercase tracking-tighter mt-1 ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      {/* Exercise Info Modal */}
      <AnimatePresence>
        {infoExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-background/90 backdrop-blur-md"
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
