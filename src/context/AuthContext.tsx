import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: any | null;
  login: (identifier: string, password: string) => Promise<{ success: boolean; blocked?: boolean; message?: string }>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateLocalProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('kamba_fit_session');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('kamba_fit_session'));

  const logout = React.useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('kamba_fit_session');
  }, []);

  useEffect(() => {
    // Migration: ensure all users have a unique numeric UID
    const users = JSON.parse(localStorage.getItem('kamba_fit_users') || '[]');
    let migrated = false;
    const newlyGenerated: string[] = [];
    
    const generateUniqueNumericUID = (existingUsers: any[], generatedThisSession: string[]) => {
      let uid = "";
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 100) {
        uid = Math.floor(100000 + Math.random() * 900000).toString();
        isUnique = !existingUsers.some(u => u.uid === uid) && !generatedThisSession.includes(uid);
        attempts++;
      }
      return uid;
    };

    const updatedUsers = users.map((u: any) => {
      // Check if UID is missing or not a 6-digit number
      if (!u.uid || typeof u.uid !== 'string' || u.uid.length !== 6 || isNaN(Number(u.uid))) {
        migrated = true;
        const newUid = generateUniqueNumericUID(users, newlyGenerated);
        newlyGenerated.push(newUid);
        return { ...u, uid: newUid };
      }
      return u;
    });

    if (migrated) {
      localStorage.setItem('kamba_fit_users', JSON.stringify(updatedUsers));
      
      // Update current session if needed
      const savedUser = localStorage.getItem('kamba_fit_session');
      if (savedUser) {
        try {
          const sessionUser = JSON.parse(savedUser);
          const updatedSessionUser = updatedUsers.find((u: any) => 
            (u.email && u.email === sessionUser.email) || (u.phone && u.phone === sessionUser.phone)
          );
          if (updatedSessionUser) {
            localStorage.setItem('kamba_fit_session', JSON.stringify(updatedSessionUser));
            setCurrentUser(updatedSessionUser);
          }
        } catch (e) {
          console.error("Migration session update failed", e);
        }
      }
    }

    const checkBlockedStatus = () => {
      const savedUser = localStorage.getItem('kamba_fit_session');
      if (savedUser) {
        try {
          const sessionUser = JSON.parse(savedUser);
          const currentUsers = JSON.parse(localStorage.getItem('kamba_fit_users') || '[]');
          
          const currentDbUser = currentUsers.find((u: any) => u.uid === sessionUser.uid);

          if (currentDbUser?.isBlocked) {
            logout();
            alert("A sua conta foi bloqueada. Por favor, contacte o suporte.");
          } else if (currentDbUser && JSON.stringify(currentDbUser) !== JSON.stringify(sessionUser)) {
            // Update local user state if changed externally (e.g. by admin)
            setCurrentUser(currentDbUser);
            localStorage.setItem('kamba_fit_session', JSON.stringify(currentDbUser));
          }
        } catch (e) {
          console.error("Error checking blocked status", e);
        }
      }
    };

    // Check on mount and periodically
    checkBlockedStatus();
    const interval = setInterval(checkBlockedStatus, 5000); // Check more frequently
    
    // Also listen to secondary storage events
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'kamba_fit_users') checkBlockedStatus();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [logout]);

  useEffect(() => {
    const savedUser = localStorage.getItem('kamba_fit_session');
    if (savedUser && !currentUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  const login = React.useCallback(async (identifier: string, password: string): Promise<{ success: boolean; blocked?: boolean; message?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = JSON.parse(localStorage.getItem('kamba_fit_users') || '[]');
    const normalizedId = identifier.trim().toLowerCase();
    
    const user = users.find((u: any) => 
      ((u.email || "").trim().toLowerCase() === normalizedId || (u.phone || "").trim() === normalizedId) && 
      u.password === password
    );

    if (user) {
      if (user.isBlocked) {
        return { success: false, blocked: true, message: "Esta conta foi bloqueada. Por favor, contacte o suporte para mais informações." };
      }
      const sessionUser = { ...user };
      delete sessionUser.password;
      setCurrentUser(sessionUser);
      setIsAuthenticated(true);
      localStorage.setItem('kamba_fit_session', JSON.stringify(sessionUser));
      return { success: true };
    }
    return { success: false, message: "Credenciais inválidas. Verifique o seu e-mail/telefone e palavra-passe." };
  }, []);

  const register = React.useCallback(async (userData: any): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = JSON.parse(localStorage.getItem('kamba_fit_users') || '[]');
    const exists = users.some((u: any) => u.email === userData.email || u.phone === userData.phone);

    if (exists) return false;

    const generateUniqueNumericUID = (existingUsers: any[]) => {
      let uid = "";
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 100) {
        uid = Math.floor(100000 + Math.random() * 900000).toString();
        isUnique = !existingUsers.some(u => u.uid === uid);
        attempts++;
      }
      return uid;
    };

    // First account created is admin, others are users
    const newUser = {
      ...userData,
      uid: generateUniqueNumericUID(users),
      role: users.length === 0 ? 'admin' : 'user'
    };

    users.push(newUser);
    localStorage.setItem('kamba_fit_users', JSON.stringify(users));
    return true;
  }, []);

  const updateLocalProfile = React.useCallback((profile: UserProfile) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const users = JSON.parse(localStorage.getItem('kamba_fit_users') || '[]');
      
      const updatedUsers = users.map((u: any) => {
        if (u.uid === prev.uid) {
          return { ...u, ...profile };
        }
        return u;
      });
      
      const updatedSession = { ...prev, ...profile };
      localStorage.setItem('kamba_fit_users', JSON.stringify(updatedUsers));
      localStorage.setItem('kamba_fit_session', JSON.stringify(updatedSession));
      return updatedSession;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, register, logout, updateLocalProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
