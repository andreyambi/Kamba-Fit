import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  User as UserIcon, 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  Search, 
  ArrowLeft,
  Activity,
  Flame,
  Utensils,
  Target,
  TrendingUp,
  Dumbbell,
  MessageSquare,
  ChevronRight,
  LogOut,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateTargets, generateWorkoutPlan, getWorkoutForDay } from '../utils/fitness';

type AdminTab = 'details' | 'training' | 'nutrition' | 'chat';

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedUserState, setSelectedUserState] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('details');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDayToEdit, setSelectedDayToEdit] = useState<number | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<{label: string, exercises: any[]} | null>(null);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('kamba_fit_users') || '[]');
    setUsers(storedUsers);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      // Use uid for state lookup
      const userState = localStorage.getItem(`kamba_fit_state_${selectedUser.uid}`);
      
      if (userState) {
        setSelectedUserState(JSON.parse(userState));
      } else {
        // Fallback to legacy keys if uid state not found yet
        const legacyState = localStorage.getItem(`kamba_fit_state_${selectedUser.email}`) || 
                           localStorage.getItem(`kamba_fit_state_${selectedUser.phone}`);
        if (legacyState) {
          setSelectedUserState(JSON.parse(legacyState));
        } else {
          setSelectedUserState(null);
        }
      }
    } else {
      setSelectedUserState(null);
    }
  }, [selectedUser]);

  const isSameUser = (u1: any, u2: any) => {
    if (!u1 || !u2) return false;
    if (u1.uid && u2.uid) return u1.uid === u2.uid;
    // Fallback for identification during migration
    return (u1.email === u2.email && u1.email) || (u1.phone === u2.phone && u1.phone);
  };

  const handleToggleBlock = (uid: string, email: string, phone: string, currentlyBlocked: boolean) => {
    // Robust identification using UID primarily, with fallbacks
    if (!uid && !email && !phone) return;
    
    if (uid === currentUser?.uid || (email && email === currentUser?.email)) {
      alert("Não podes bloquear-te a ti mesmo.");
      return;
    }

    const action = currentlyBlocked ? "desbloquear" : "bloquear";
    if (confirm(`Tens a certeza que desejas ${action} este utilizador?`)) {
      const storedUsers = JSON.parse(localStorage.getItem('kamba_fit_users') || '[]');
      
      let found = false;
      const updatedUsers = storedUsers.map((u: any) => {
        const matches = (uid && u.uid === uid) || (email && u.email === email) || (phone && u.phone === phone);
        if (matches) {
          found = true;
          return { ...u, isBlocked: !currentlyBlocked };
        }
        return u;
      });
      
      if (!found) return;
      
      localStorage.setItem('kamba_fit_users', JSON.stringify(updatedUsers));
      
      // Update local states immediately
      setUsers([...updatedUsers]);
      const latestUser = updatedUsers.find((u: any) => 
        (uid && u.uid === uid) || (email && u.email === email) || (phone && u.phone === phone)
      );
      
      if (latestUser) {
        setSelectedUser({ ...latestUser });
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  );

  const userTargets = useMemo(() => {
    if (!selectedUserState?.profile) return null;
    return calculateTargets(selectedUserState.profile, selectedUserState.caloriesAdjustment);
  }, [selectedUserState]);

  const userWorkoutPlan = useMemo(() => {
    if (!selectedUserState?.profile) return null;
    return generateWorkoutPlan(selectedUserState.profile);
  }, [selectedUserState]);

  const todayWorkout = useMemo(() => {
    if (!selectedUserState?.profile || !userWorkoutPlan) return null;
    const dayOfWeek = new Date().getDay();
    return getWorkoutForDay(selectedUserState.profile, userWorkoutPlan, dayOfWeek);
  }, [selectedUserState, userWorkoutPlan]);

  const handleUpdateProfile = (field: string, value: any) => {
    if (!selectedUser) return;
    
    const storedUsers = JSON.parse(localStorage.getItem('kamba_fit_users') || '[]');
    const updatedUsers = storedUsers.map((u: any) => {
      if (u.uid === selectedUser.uid) {
        return { ...u, [field]: value };
      }
      return u;
    });
    
    localStorage.setItem('kamba_fit_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    // Also update the fitness state if it exists
    const userStateKey = `kamba_fit_state_${selectedUser.uid}`;
    const userState = JSON.parse(localStorage.getItem(userStateKey) || 'null');
    if (userState && userState.profile) {
      userState.profile = { ...userState.profile, [field]: value };
      localStorage.setItem(userStateKey, JSON.stringify(userState));
      setSelectedUserState({ ...userState });
    }
    
    setSelectedUser({ ...selectedUser, [field]: value });
  };

  const handleUpdateWorkoutOverride = () => {
    if (!selectedUser || selectedDayToEdit === null || !editingWorkout) return;

    // Try multiple keys for compatibility (UID is primary)
    const uidKey = `kamba_fit_state_${selectedUser.uid}`;
    const emailKey = selectedUser.email ? `kamba_fit_state_${selectedUser.email}` : null;
    const phoneKey = selectedUser.phone ? `kamba_fit_state_${selectedUser.phone}` : null;
    
    let userState = null;
    let activeKey = uidKey;

    const storedUidState = localStorage.getItem(uidKey);
    if (storedUidState) {
      userState = JSON.parse(storedUidState);
    } else if (emailKey && localStorage.getItem(emailKey)) {
      userState = JSON.parse(localStorage.getItem(emailKey)!);
      activeKey = emailKey;
    } else if (phoneKey && localStorage.getItem(phoneKey)) {
      userState = JSON.parse(localStorage.getItem(phoneKey)!);
      activeKey = phoneKey;
    }

    // If no state exists, we create a basic structure using the user data
    if (!userState) {
      userState = {
        profile: { ...selectedUser },
        meals: [],
        weightHistory: [],
        caloriesAdjustment: 0,
        completedExercises: []
      };
      // When creating fresh, always use UID key
      activeKey = uidKey;
    }
    
    if (userState.profile) {
      const overrides = userState.profile.workoutOverrides || {};
      const newWorkout = {
        id: `override_${selectedDayToEdit}`,
        label: editingWorkout.label,
        exercises: editingWorkout.exercises.map((ex: any) => ({
          ...ex,
          description: ex.description || "",
          videoUrl: ex.videoUrl || ""
        }))
      };
      
      overrides[selectedDayToEdit] = newWorkout;
      
      userState.profile.workoutOverrides = overrides;
      
      // 1. Save to the fitness state key
      localStorage.setItem(activeKey, JSON.stringify(userState));
      
      // 2. IMPORTANT: Sync with kamba_fit_users master record
      const storedUsers = JSON.parse(localStorage.getItem('kamba_fit_users') || '[]');
      const updatedUsers = storedUsers.map((u: any) => {
        if (u.uid === selectedUser.uid) {
          return { ...u, workoutOverrides: overrides };
        }
        return u;
      });
      localStorage.setItem('kamba_fit_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);

      // 3. If acting as or in same tab, force migration to UID key
      if (activeKey !== uidKey) {
        localStorage.setItem(uidKey, JSON.stringify(userState));
      }

      setSelectedUserState({ ...userState });
      setSelectedUser({ ...selectedUser, workoutOverrides: overrides });
      setSelectedDayToEdit(null);
      setEditingWorkout(null);
      alert("Plano diário guardado com sucesso!");
    } else {
      alert("Erro: Perfil do utilizador não encontrado no estado.");
    }
  };

  const handleRemoveExercise = (index: number) => {
    if (!editingWorkout) return;
    const updatedExercises = [...editingWorkout.exercises];
    updatedExercises.splice(index, 1);
    setEditingWorkout({ ...editingWorkout, exercises: updatedExercises });
  };

  const handleAddExercise = () => {
    if (!editingWorkout) return;
    setEditingWorkout({
      ...editingWorkout,
      exercises: [...editingWorkout.exercises, { name: 'Novo Exercício', sets: 3, reps: '10' }]
    });
  };

  const handleExerciseChange = (index: number, field: string, value: any) => {
    if (!editingWorkout) return;
    const updatedExercises = [...editingWorkout.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setEditingWorkout({ ...editingWorkout, exercises: updatedExercises });
  };

  const startEditingDay = (dayIndex: number) => {
    if (!selectedUserState?.profile) return;
    
    const currentWorkout = getWorkoutForDay(selectedUserState.profile, userWorkoutPlan || [], dayIndex);
    setSelectedDayToEdit(dayIndex);
    setEditingWorkout({
      label: currentWorkout?.label || 'Novo Treino',
      exercises: currentWorkout?.exercises ? [...currentWorkout.exercises] : []
    });
  };

  const refreshData = () => {
    if (!selectedUser) return;
    setIsRefreshing(true);
    
    // 1. Recarrega a lista do storage
    const storedUsers = JSON.parse(localStorage.getItem('kamba_fit_users') || '[]');
    setUsers(storedUsers);

    // 2. Atualiza os dados do utilizador selecionado
    const latestUserData = storedUsers.find((u: any) => u.uid === selectedUser.uid);

    if (latestUserData) {
      setSelectedUser({ ...latestUserData });
    }

    // 3. Recarrega o estado de fitness
    const userState = localStorage.getItem(`kamba_fit_state_${selectedUser.uid}`) || 
                      localStorage.getItem(`kamba_fit_state_${selectedUser.email}`) || 
                      localStorage.getItem(`kamba_fit_state_${selectedUser.phone}`);
    if (userState) {
      setSelectedUserState(JSON.parse(userState));
    } else {
      setSelectedUserState(null);
    }
    
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="min-h-screen bg-background text-text-main font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center font-black text-black shadow-lg">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter leading-none">KAMBA <span className="text-accent">ADMIN</span></h1>
            <p className="text-[10px] text-accent font-bold uppercase tracking-widest mt-1">Controlo Total do Sistema</p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border-subtle hover:bg-red-500/10 hover:border-red-500/50 text-text-muted hover:text-red-500 transition-all group"
        >
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Sair</span>
          <LogOut size={18} />
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* USER LIST */}
          <div className="xl:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Users size={20} className="text-accent" /> Clientes
                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">
                  {users.length}
                </span>
              </h2>
              
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text"
                  placeholder="Procurar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-surface border border-border-subtle rounded-xl pl-9 pr-4 py-1.5 text-xs focus:border-accent outline-none w-40 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
              {filteredUsers.map((user) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={user.uid || user.email || user.phone}
                  className={`dark-card flex items-center justify-between group p-3 border transition-all cursor-pointer ${
                    isSameUser(selectedUser, user) ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(255,184,0,0.1)]' : 'border-border-subtle hover:border-text-muted/30'
                  }`}
                  onClick={() => { setSelectedUser(user); setActiveAdminTab('details'); }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      user.role === 'admin' ? 'gold-gradient text-black' : 'bg-surface border border-border-subtle'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                        <div className="overflow-hidden">
                          <h3 className={`font-black text-xs transition-colors flex items-center gap-2 truncate ${
                            user.isBlocked ? 'text-red-500 opacity-60' : 'group-hover:text-accent'
                          }`}>
                            {user.name}
                            {user.role === 'admin' && <Shield size={10} className="text-accent" />}
                            {user.isBlocked && <span className="text-[8px] bg-red-500 text-white px-1 rounded">B</span>}
                          </h3>
                          <div className="flex flex-col">
                            <p className="text-[9px] text-accent font-mono truncate opacity-70 leading-tight">ID: {user.uid}</p>
                            <p className="text-[10px] text-text-muted truncate leading-tight mt-0.5">{user.email || user.phone}</p>
                          </div>
                        </div>
                  </div>
                  <ChevronRight size={14} className={`text-text-muted transition-transform ${isSameUser(selectedUser, user) ? 'rotate-90 text-accent' : ''}`} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* VISION AREA */}
          <div className="xl:col-span-8">
            <AnimatePresence mode="wait">
              {selectedUser ? (
                <motion.div 
                  key={selectedUser.uid || selectedUser.email || selectedUser.phone}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="gold-border p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl ${
                        selectedUser.role === 'admin' ? 'gold-gradient text-black' : 'bg-surface border border-border-subtle'
                      }`}>
                        {selectedUser.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tighter uppercase">{selectedUser.name}</h2>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] text-text-muted font-bold">
                          <span className="flex items-center gap-1 text-accent font-mono">UID: {selectedUser.uid}</span>
                          <span className="flex items-center gap-1"><Mail size={10} /> {selectedUser.email || 'N/A'}</span>
                          <span className="flex items-center gap-1"><Phone size={10} /> {selectedUser.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {selectedUser.role !== 'admin' && (
                        <button 
                          onClick={() => handleToggleBlock(selectedUser.uid, selectedUser.email, selectedUser.phone, !!selectedUser.isBlocked)} 
                          className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
                            selectedUser.isBlocked 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white' 
                              : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          {selectedUser.isBlocked ? 'Ativar Conta' : 'Bloquear Conta'}
                        </button>
                      )}
                      <button 
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className={`p-2 bg-surface border border-border-subtle rounded-xl text-text-muted hover:text-accent transition-all ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
                        title="Atualizar Dados"
                      >
                        <Activity size={16} className={isRefreshing ? 'animate-pulse text-accent' : ''} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 p-1 bg-surface border border-border-subtle rounded-2xl">
                    {(['details', 'training', 'nutrition', 'chat'] as AdminTab[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveAdminTab(tab)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeAdminTab === tab ? 'bg-accent text-black shadow-lg' : 'text-text-muted hover:text-white'
                        }`}
                      >
                        {tab === 'details' ? 'Visão Geral' : tab === 'training' ? 'Treino' : tab === 'nutrition' ? 'Nutrição' : 'Chat'}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[400px]">
                    {activeAdminTab === 'details' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="dark-card p-6">
                          <h3 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2 underline decoration-accent">Metas e Perfil</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center bg-surface p-3 rounded-xl">
                              <span className="text-[10px] font-bold text-text-muted uppercase">Objetivo</span>
                              <span className="text-sm font-black capitalize">{selectedUserState?.profile?.goal?.replace('_', ' ') || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface p-3 rounded-xl">
                              <span className="text-[10px] font-bold text-text-muted uppercase">Nível</span>
                              <span className="text-sm font-black capitalize">{selectedUserState?.profile?.level || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface p-3 rounded-xl">
                              <span className="text-[10px] font-bold text-text-muted uppercase">Calorias/Dia</span>
                              <span className="text-sm font-black text-accent">{userTargets?.calories || 'N/A'} kcal</span>
                            </div>
                          </div>
                        </div>
                        <div className="dark-card p-6">
                          <h3 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2 underline decoration-accent text-accent">Peso (Logs)</h3>
                          <div className="space-y-2">
                            {(selectedUserState?.weightHistory || []).slice(-5).reverse().map((log: any, i: number) => (
                              <div key={i} className="flex justify-between text-xs py-2 border-b border-border-subtle last:border-0 font-mono">
                                <span className="text-text-muted">{new Date(log.date).toLocaleDateString()}</span>
                                <span className="font-black">{log.weight} kg</span>
                              </div>
                            ))}
                            {(!selectedUserState?.weightHistory || selectedUserState.weightHistory.length === 0) && <p className="text-center text-[10px] py-4">Sem dados.</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeAdminTab === 'training' && (
                      <div className="space-y-6">
                        {/* ADMIN PLAN EDITOR */}
                        <div className="dark-card p-6 border-accent/30 bg-accent/5">
                          <h3 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Shield size={14} className="text-accent" /> Ajustar parâmetros do Plano
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-accent uppercase tracking-widest">Objetivo</label>
                              <select 
                                className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold focus:border-accent outline-none appearance-none"
                                value={selectedUser?.goal || 'mass'}
                                onChange={(e) => handleUpdateProfile('goal', e.target.value)}
                              >
                                <option value="mass">Ganho de Massa</option>
                                <option value="loss">Perda de Peso</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-accent uppercase tracking-widest">Nível</label>
                              <select 
                                className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold focus:border-accent outline-none appearance-none"
                                value={selectedUser?.level || 'beginner'}
                                onChange={(e) => handleUpdateProfile('level', e.target.value)}
                              >
                                <option value="beginner">Iniciante</option>
                                <option value="intermediate">Intermédio</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-accent uppercase tracking-widest">Dias / Semana</label>
                              <select 
                                className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold focus:border-accent outline-none appearance-none"
                                value={selectedUser?.daysPerWeek || 3}
                                onChange={(e) => handleUpdateProfile('daysPerWeek', parseInt(e.target.value))}
                              >
                                {[2, 3, 4, 5, 6, 7].map(n => (
                                  <option key={n} value={n}>{n} Dias</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <p className="mt-4 text-[9px] text-text-muted italic">Alterar estes valores irá regenerar automaticamente o plano de treino do utilizador.</p>
                        </div>

                        <div className="dark-card p-6 border-accent/20 bg-accent/5">
                          <h3 className="font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={14} className="text-accent" /> Treino Sugerido para Hoje
                          </h3>
                          {todayWorkout ? (
                            <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                <h4 className="text-xl font-black uppercase italic tracking-tighter">{todayWorkout.label}</h4>
                                <span className="text-[10px] font-bold text-text-muted">{todayWorkout.exercises.length} Exercícios</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {todayWorkout.exercises.map((ex, i) => (
                                  <div key={i} className="bg-surface/50 p-3 rounded-xl border border-border-subtle flex justify-between items-center text-[11px]">
                                    <span className="font-bold truncate mr-2">{ex.name}</span>
                                    <span className="text-text-muted font-mono whitespace-nowrap">{ex.sets}x{ex.reps}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-sm font-black text-text-muted">Hoje é Dia de Descanso 🧘</p>
                              <p className="text-[10px] text-text-muted mt-1 uppercase">O corpo precisa de recuperar</p>
                            </div>
                          )}
                        </div>

                        <div className="dark-card p-6">
                          <h3 className="font-black text-xs uppercase tracking-widest mb-4">Plano Semanal Gerado</h3>
                          <p className="text-[9px] text-text-muted mb-4 italic flex items-center gap-1">
                            <Shield size={10} className="text-accent" /> Clica num dia para personalizar o treino específico desse dia.
                          </p>
                          {userWorkoutPlan ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, i) => {
                                const dayIndex = i === 6 ? 0 : i + 1;
                                const workout = getWorkoutForDay(selectedUserState.profile, userWorkoutPlan, dayIndex);
                                const isOverridden = !!selectedUserState.profile.workoutOverrides?.[dayIndex];
                                
                                return (
                                  <div 
                                    key={day} 
                                    onClick={() => startEditingDay(dayIndex)}
                                    className={`p-3 bg-surface rounded-xl border transition-all cursor-pointer hover:border-accent ${
                                      isOverridden ? 'border-accent/40 bg-accent/5' : 'border-border-subtle'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <p className="text-[9px] font-bold text-text-muted uppercase">{day}</p>
                                      {isOverridden && <span className="text-[8px] bg-accent text-black px-1 rounded font-black">EDITADO</span>}
                                    </div>
                                    <p className="text-xs font-black truncate">{workout?.label || 'Descanso'}</p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : <p className="text-center py-10 text-xs">Plano indisponível.</p>}
                        </div>

                        {/* WORKOUT DAY EDITOR MODAL-LIKE OVERLAY */}
                        <AnimatePresence>
                          {selectedDayToEdit !== null && editingWorkout && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
                            >
                              <motion.div 
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-surface border border-border-subtle rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                              >
                                <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                                  <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Editar Treino: {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][selectedDayToEdit]}</h3>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Personalização de Rotina</p>
                                  </div>
                                  <button onClick={() => { setSelectedDayToEdit(null); setEditingWorkout(null); }} className="p-2 hover:bg-white/5 rounded-full">
                                    <ArrowLeft size={20} />
                                  </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-accent uppercase tracking-widest">Nome do Treino</label>
                                    <input 
                                      type="text"
                                      value={editingWorkout.label}
                                      onChange={(e) => setEditingWorkout({...editingWorkout, label: e.target.value})}
                                      className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold focus:border-accent outline-none"
                                      placeholder="Ex: Peito e Tríceps"
                                    />
                                  </div>

                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[10px] font-bold text-accent uppercase tracking-widest">Exercícios</label>
                                      <button 
                                        onClick={handleAddExercise}
                                        className="text-[9px] font-black uppercase text-accent hover:underline flex items-center gap-1"
                                      >
                                        <Dumbbell size={10} /> Adicionar Exercício
                                      </button>
                                    </div>

                                    {editingWorkout.exercises.length === 0 ? (
                                      <div className="text-center py-10 border border-dashed border-border-subtle rounded-2xl">
                                        <p className="text-xs text-text-muted">Nenhum exercício definido para este dia.</p>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        {editingWorkout.exercises.map((ex, idx) => (
                                          <div key={idx} className="bg-background border border-border-subtle rounded-2xl p-4 space-y-4">
                                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                              <div className="flex-1 space-y-1 w-full">
                                                <input 
                                                  type="text"
                                                  value={ex.name}
                                                  onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                                                  className="w-full bg-transparent border-none p-0 text-sm font-black focus:ring-0 outline-none placeholder:opacity-30"
                                                  placeholder="Nome do exercício"
                                                />
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 bg-surface border border-border-subtle rounded-lg px-2 py-1">
                                                  <span className="text-[8px] font-bold text-text-muted">SETS</span>
                                                  <input 
                                                    type="number"
                                                    value={ex.sets}
                                                    onChange={(e) => handleExerciseChange(idx, 'sets', parseInt(e.target.value))}
                                                    className="w-8 bg-transparent border-none p-0 text-[11px] font-bold text-center focus:ring-0 outline-none"
                                                  />
                                                </div>
                                                <span className="text-text-muted text-[10px]">x</span>
                                                <div className="flex items-center gap-1 bg-surface border border-border-subtle rounded-lg px-2 py-1">
                                                  <span className="text-[8px] font-bold text-text-muted">REPS</span>
                                                  <input 
                                                    type="text"
                                                    value={ex.reps}
                                                    onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                                                    className="w-12 bg-transparent border-none p-0 text-[11px] font-bold text-center focus:ring-0 outline-none"
                                                  />
                                                </div>
                                                <button 
                                                  onClick={() => handleRemoveExercise(idx)}
                                                  className="ml-2 text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                                >
                                                  <Trash2 size={14} />
                                                </button>
                                              </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-2">
                                              <div className="space-y-1">
                                                <label className="text-[8px] font-bold text-accent uppercase tracking-widest ml-1">Descrição/Instruções</label>
                                                <textarea 
                                                  value={ex.description || ""}
                                                  onChange={(e) => handleExerciseChange(idx, 'description', e.target.value)}
                                                  placeholder="Como executar este exercício corretamente..."
                                                  className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-[11px] text-text-main focus:border-accent outline-none min-h-[60px] resize-none"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label className="text-[8px] font-bold text-accent uppercase tracking-widest ml-1">Link de Vídeo (Opcional)</label>
                                                <input 
                                                  type="text"
                                                  value={ex.videoUrl || ""}
                                                  onChange={(e) => handleExerciseChange(idx, 'videoUrl', e.target.value)}
                                                  placeholder="https://youtube.com/..."
                                                  className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-[11px] text-text-main focus:border-accent outline-none"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="p-6 border-t border-border-subtle bg-surface flex gap-3">
                                  <button 
                                    onClick={() => { setSelectedDayToEdit(null); setEditingWorkout(null); }}
                                    className="flex-1 py-4 border border-border-subtle rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                                  >
                                    Cancelar
                                  </button>
                                  <button 
                                    onClick={handleUpdateWorkoutOverride}
                                    className="flex-[2] py-4 gold-gradient text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                  >
                                    Guardar Alterações
                                  </button>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="dark-card p-6">
                          <h3 className="font-black text-xs uppercase tracking-widest mb-4">Check-ins de Exercícios</h3>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {(selectedUserState?.completedExercises || []).slice().reverse().map((ex: any, i: number) => (
                              <div key={i} className="p-3 bg-surface rounded-xl border border-border-subtle flex justify-between text-[11px]">
                                <span className="font-bold">{ex.exerciseName}</span>
                                <span className="text-text-muted">{ex.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeAdminTab === 'nutrition' && (
                      <div className="dark-card p-6 min-h-[400px]">
                        <h3 className="font-black text-xs uppercase tracking-widest mb-6">Histórico de Refeições</h3>
                        <div className="space-y-3">
                          {(selectedUserState?.mealHistory || selectedUserState?.meals || []).slice().reverse().map((meal: any, i: number) => (
                            <div key={i} className="p-4 bg-surface rounded-2xl border border-border-subtle">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-black text-accent">{meal.name}</span>
                                <span className="text-[10px] font-mono">{new Date(meal.timestamp).toLocaleString()}</span>
                              </div>
                              <div className="flex gap-4 text-[10px] font-bold text-text-muted">
                                <span>{meal.calories} kcal</span>
                                <span>P: {meal.protein}g</span>
                                <span>C: {meal.carbs}g</span>
                                <span>G: {meal.fat}g</span>
                              </div>
                            </div>
                          ))}
                          {(!selectedUserState?.meals && !selectedUserState?.mealHistory) && <p className="text-center py-20 text-xs">Nenhuma refeiçãoregistada.</p>}
                        </div>
                      </div>
                    )}

                    {activeAdminTab === 'chat' && (
                      <div className="dark-card p-6 h-[500px] flex flex-col">
                        <h3 className="font-black text-xs uppercase tracking-widest mb-6">Logs de Conversa</h3>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                          {(selectedUserState?.chatHistory || []).map((msg: any, i: number) => (
                            <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] ${msg.isBot ? 'bg-surface border border-border-subtle' : 'gold-gradient text-black font-bold'}`}>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                          {(!selectedUserState?.chatHistory || selectedUserState.chatHistory.length === 0) && <p className="text-center py-20 text-xs">Sem histórico.</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-[500px] flex flex-col items-center justify-center text-center p-10 bg-surface/10 rounded-[32px] border border-dashed border-border-subtle">
                  <Activity size={48} className="text-accent mb-4 opacity-20" />
                  <h3 className="text-xl font-black text-text-muted uppercase">Monitorização Total</h3>
                  <p className="text-sm text-text-muted/60 mt-2">Escolhe um cliente para auditar treinos, dieta e conversas.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
