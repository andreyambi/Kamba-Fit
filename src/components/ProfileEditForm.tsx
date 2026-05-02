/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ANGOLA_PROVINCES } from '../constants';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Save, X } from 'lucide-react';

interface ProfileEditFormProps {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onCancel: () => void;
}

export default function ProfileEditForm({ profile, onSave, onCancel }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });

  const goals = [
    { id: 'mass', label: 'Ganho', sub: 'Massa' },
    { id: 'loss', label: 'Perda', sub: 'Peso' },
  ];

  const DAYS = [
    { label: 'S', value: 1 },
    { label: 'T', value: 2 },
    { label: 'Q', value: 3 },
    { label: 'Q', value: 4 },
    { label: 'S', value: 5 },
    { label: 'S', value: 6 },
    { label: 'D', value: 0 },
  ];

  const toggleDay = (day: number) => {
    const current = formData.trainingDays || [];
    const updated = current.includes(day) 
      ? current.filter(d => d !== day)
      : [...current, day].sort();
    
    setFormData({ 
      ...formData, 
      trainingDays: updated,
      daysPerWeek: updated.length 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((formData.trainingDays?.length || 0) === 0) {
      alert("Por favor, selecione pelo menos um dia de treino.");
      return;
    }
    onSave(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black uppercase text-text-main">Editar <span className="text-accent">Informação</span></h2>
        <button onClick={onCancel} className="p-2 hover:bg-surface rounded-full text-text-muted">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="dark-card space-y-5 border-border-subtle shadow-2xl">
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              required
              value={formData.name}
              placeholder="Nome Completo"
              className="w-full bg-background border border-border-subtle rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-accent transition-colors font-bold text-text-main"
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              required
              type="email"
              value={formData.email}
              placeholder="Email"
              className="w-full bg-background border border-border-subtle rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-accent transition-colors font-bold text-text-main"
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              required
              type="tel"
              value={formData.phone}
              placeholder="Telefone (+244)"
              className="w-full bg-background border border-border-subtle rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-accent transition-colors font-bold text-text-main"
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <select 
              className="w-full bg-background border border-border-subtle rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-accent transition-colors font-bold appearance-none text-text-main"
              value={formData.province}
              onChange={e => setFormData({ ...formData, province: e.target.value })}
            >
              {ANGOLA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="pt-2">
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 px-2">Objetivo Principal</label>
            <div className="grid grid-cols-2 gap-2">
              {goals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal: g.id as any })}
                  className={`py-3 rounded-xl border transition-all ${
                    formData.goal === g.id 
                      ? 'bg-accent/10 border-accent text-accent' 
                      : 'bg-surface border-border-subtle text-text-muted'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase">{g.label} {g.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 px-2">Dias de Treino</label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((day) => {
                const isSelected = formData.trainingDays?.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`h-10 rounded-xl border text-[10px] font-black transition-all ${
                      isSelected 
                        ? 'bg-accent text-black border-accent' 
                        : 'bg-surface border-border-subtle text-text-muted opacity-40'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[8px] text-text-muted uppercase font-black mt-2 text-center opacity-40">Toca para definir treino ou descanso</p>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-4 rounded-2xl bg-surface border border-border-subtle font-black uppercase tracking-widest text-xs hover:bg-surface-hover text-text-main transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="flex-1 px-6 py-4 gold-gradient text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
          >
            <Save size={18} /> Guardar Alterações
          </button>
        </div>
      </form>
    </motion.div>
  );
}
