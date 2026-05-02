/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Camera, Mail, Phone, MapPin, Calendar, Activity, LogOut, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';
import ProfileEditForm from './ProfileEditForm';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onLogout: () => void;
}

export default function ProfileView({ profile, onUpdate, onLogout }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ProfileEditForm 
        profile={profile}
        onSave={(updated) => {
          onUpdate(updated);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const infoItems = [
    { icon: Mail, label: 'Email', value: profile.email },
    { icon: Phone, label: 'Telefone', value: profile.phone },
    { icon: MapPin, label: 'Província', value: profile.province },
    { icon: Calendar, label: 'Ano de Nasc.', value: profile.birthYear },
    { icon: Activity, label: 'Nível', value: profile.level === 'beginner' ? 'Iniciante' : 'Intermédio' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="dark-card overflow-hidden">
        {/* Header/Cover */}
        <div className="h-32 gold-gradient -mx-6 -mt-6 mb-16 relative">
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-background bg-card flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-10 pt-2">
          <h2 className="text-3xl font-black uppercase tracking-tight">{profile.name}</h2>
          <p className="text-accent text-xs font-bold uppercase tracking-widest mt-1">Utilizador Elite Kamba Fit</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="space-y-4">
            {infoItems.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border-subtle">
                <item.icon className="text-accent" size={18} />
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">{item.label}</p>
                  <p className="text-sm font-bold text-text-main">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {infoItems.slice(3).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border-subtle">
                <item.icon className="text-accent" size={18} />
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">{item.label}</p>
                  <p className="text-sm font-bold text-text-main">{item.value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border-subtle">
              <Activity className="text-accent" size={18} />
              <div>
                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Frequência</p>
                <p className="text-sm font-bold text-text-main">{profile.daysPerWeek} dias / semana</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border-subtle">
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-surface border border-border-subtle font-black uppercase tracking-widest text-xs hover:bg-surface-hover transition-colors"
          >
            <Edit3 size={16} /> Editar Perfil
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={16} /> Terminar Sessão
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.3em]">Membro desde {new Date().getFullYear()}</p>
      </div>
    </motion.div>
  );
}
