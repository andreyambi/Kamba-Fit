/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Landing from './components/Landing';
import ProfileForm from './components/ProfileForm';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProfile, FitnessState, WeightLog, Meal, ChatMessage } from './types';
import { loadState, saveState, initialState } from './services/storage';
import { useCallback, useEffect } from 'react';

function AppContent() {
  const { isAuthenticated, currentUser, updateLocalProfile, logout } = useAuth();
  const [view, setView] = useState<'landing' | 'login' | 'register'>('landing');
  const [state, setState] = useState<FitnessState>(initialState);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kamba_fit_theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('kamba_fit_theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const userIdentifier = currentUser?.uid || currentUser?.email || currentUser?.phone;

  // Load user specific state on login
  useEffect(() => {
    if (isAuthenticated && userIdentifier) {
      const savedState = loadState(userIdentifier);
      setState(savedState);
    } else if (!isAuthenticated) {
      setState(initialState);
    }
  }, [isAuthenticated, userIdentifier]);

  // Persistence for authenticated users
  useEffect(() => {
    if (isAuthenticated && userIdentifier) {
      saveState(state, userIdentifier);
    }
  }, [state, isAuthenticated, userIdentifier]);

  // Sync state with currentUser profile updates
  useEffect(() => {
    if (isAuthenticated && currentUser?.onboardingCompleted) {
      setState(prev => ({
        ...prev,
        profile: currentUser as UserProfile
      }));
    }
  }, [currentUser, isAuthenticated]);

  const handleProfileComplete = (profile: UserProfile) => {
    const updatedState = {
      ...state,
      profile,
      weightHistory: [{ date: new Date().toISOString(), weight: profile.weight }],
      lastAdjustmentDate: new Date().toISOString()
    };
    setState(updatedState);
    updateLocalProfile(profile);
  };

  const handleUpdateProfile = useCallback((updatedProfile: UserProfile) => {
    setState(prev => ({ ...prev, profile: updatedProfile }));
    updateLocalProfile(updatedProfile);
  }, [updateLocalProfile]);

  const handleToggleExercise = useCallback((exerciseName: string) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const completed = prev.completedExercises || [];
      const exists = completed.find(e => e.exerciseName === exerciseName && e.date === today);
      
      if (exists) {
        return {
          ...prev,
          completedExercises: completed.filter(e => !(e.exerciseName === exerciseName && e.date === today))
        };
      } else {
        return {
          ...prev,
          completedExercises: [...completed, { exerciseName, date: today }]
        };
      }
    });
  }, []);

  const handleAddMeal = useCallback((mealData: Omit<Meal, 'id' | 'timestamp'>) => {
    const newMeal: Meal = {
      ...mealData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setState(prev => ({
      ...prev,
      meals: [newMeal, ...prev.meals],
      mealHistory: [newMeal, ...(prev.mealHistory || [])]
    }));
  }, []);

  const handleDeleteMeal = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      meals: prev.meals.filter(meal => meal.id !== id),
      mealHistory: (prev.mealHistory || []).filter(meal => meal.id !== id)
    }));
  }, []);

  const handleUpdateMeal = useCallback((updatedMeal: Meal) => {
    setState(prev => ({
      ...prev,
      meals: prev.meals.map(meal => meal.id === updatedMeal.id ? updatedMeal : meal),
      mealHistory: (prev.mealHistory || []).map(meal => meal.id === updatedMeal.id ? updatedMeal : meal)
    }));
  }, []);

  const handleLogWeight = useCallback((weight: number) => {
    const newLog: WeightLog = {
      date: new Date().toISOString(),
      weight
    };
    setState(prev => ({
      ...prev,
      weightHistory: [...prev.weightHistory, newLog]
    }));
  }, []);
  
  const handleUpdateChatHistory = useCallback((messages: ChatMessage[]) => {
    setState(prev => ({
      ...prev,
      chatHistory: messages
    }));
  }, []);

  const dispatch = React.useMemo(() => ({
    addMeal: handleAddMeal,
    logWeight: handleLogWeight,
    logout: logout,
    updateProfile: handleUpdateProfile,
    updateChatHistory: handleUpdateChatHistory,
    deleteMeal: handleDeleteMeal,
    updateMeal: handleUpdateMeal,
    toggleExercise: handleToggleExercise
  }), [handleAddMeal, handleLogWeight, logout, handleUpdateProfile, handleUpdateChatHistory, handleDeleteMeal, handleUpdateMeal, handleToggleExercise]);

  // Update last login and check for day change
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.lastLoginDate && new Date(state.lastLoginDate).toDateString() !== today) {
      // It's a new day! Reset counters
      setState(prev => ({
        ...prev,
        meals: [],
        lastLoginDate: new Date().toISOString()
      }));
    } else if (!state.lastLoginDate) {
      setState(prev => ({
        ...prev,
        lastLoginDate: new Date().toISOString()
      }));
    }
  }, [state.lastLoginDate]);

  const fullDispatch = React.useMemo(() => ({
    ...dispatch,
    toggleTheme
  }), [dispatch, toggleTheme]);

  if (isAuthenticated) {
    if (currentUser?.role === 'admin') {
      return <AdminDashboard />;
    }
    
    if (!currentUser?.onboardingCompleted) {
      return (
        <div className="min-h-screen bg-background">
          <ProfileForm 
            initialData={{ name: currentUser.name || '' }} 
            onComplete={handleProfileComplete} 
          />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background text-text-main">
        <Dashboard 
          state={state} 
          dispatch={fullDispatch}
          theme={theme}
        />
      </div>
    );
  }

  if (view === 'login') return <LoginPage onRegisterClick={() => setView('register')} onLoginSuccess={() => {}} />;
  if (view === 'register') return <RegisterPage onLoginClick={() => setView('login')} />;

  return <Landing onLogin={() => setView('login')} onRegister={() => setView('register')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

