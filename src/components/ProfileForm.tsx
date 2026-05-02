/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ANGOLA_PROVINCES } from '../constants';
import { motion } from 'motion/react';

interface ProfileFormProps {
  initialData: Partial<UserProfile>;
  onComplete: (profile: UserProfile) => void;
}

export default function ProfileForm({ initialData, onComplete }: ProfileFormProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    ...initialData,
    sex: 'M',
    level: 'beginner',
    goal: 'mass',
    daysPerWeek: 3,
    trainingDays: [1, 3, 5],
    hasGymAccess: true,
    province: 'Luanda'
  });

  const DAYS = [
    { label: 'Seg', value: 1 },
    { label: 'Ter', value: 2 },
    { label: 'Qua', value: 3 },
    { label: 'Qui', value: 4 },
    { label: 'Sex', value: 5 },
    { label: 'Sáb', value: 6 },
    { label: 'Dom', value: 0 },
  ];

  const goals = [
    { id: 'mass', label: 'Ganhar Massa', sub: 'Hipertrofia Elite' },
    { id: 'loss', label: 'Perder Peso', sub: 'Definição Extrema' },
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
    if (formData.weight && formData.height && (formData.trainingDays?.length || 0) > 0) {
      onComplete({
        ...formData,
        onboardingCompleted: true,
      } as UserProfile);
    } else if ((formData.trainingDays?.length || 0) === 0) {
      alert("Por favor, selecione pelo menos um dia de treino.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-8">
        <p className="text-accent text-xs font-black uppercase tracking-[0.2em] mb-2">CONFIGURAÇÃO DE PERFIL BIOMÉTRICO</p>
        <h1 className="text-4xl font-black mb-2">ESTRATÉGIA DE <span className="text-accent">PERFORMANCE</span></h1>
        <p className="text-text-muted">Forneça dados precisos para o cálculo do seu perfil metabólico.</p>
      </div>

      <form onSubmit={handleSubmit} className="dark-card space-y-8 border-border-subtle shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Ano de Nascimento</label>
            <input 
              type="number" 
              required
              min="1950" 
              max="2015"
              className="w-full bg-background border border-border-subtle rounded-xl px-5 py-3 focus:border-accent outline-none text-lg font-bold text-text-main"
              onChange={(e) => setFormData({ ...formData, birthYear: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Sexo Biológico</label>
            <div className="flex gap-4">
              {['M', 'F'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({...formData, sex: s as 'M' | 'F'})}
                  className={`flex-1 py-3 rounded-xl border font-bold transition-all ${formData.sex === s ? 'bg-accent/10 border-accent text-accent' : 'bg-background border-border-subtle text-text-muted opacity-50'}`}
                >
                  {s === 'M' ? 'Masculino' : 'Feminino'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Peso Atual (kg)</label>
            <input 
              type="number" 
              required
              step="0.1"
              placeholder="Ex: 75.5"
              className="w-full bg-background border border-border-subtle rounded-xl px-5 py-3 focus:border-accent outline-none text-lg font-bold text-text-main"
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Altura (cm)</label>
            <input 
              type="number" 
              required
              placeholder="Ex: 180"
              className="w-full bg-background border border-border-subtle rounded-xl px-5 py-3 focus:border-accent outline-none text-lg font-bold text-text-main"
              onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Província de Angola</label>
            <select 
              className="w-full bg-background border border-border-subtle rounded-xl px-5 py-3 focus:border-accent outline-none font-bold text-text-main"
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            >
              {ANGOLA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Nível de Experiência</label>
            <select 
              className="w-full bg-background border border-border-subtle rounded-xl px-5 py-3 focus:border-accent outline-none font-bold text-text-main"
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
            >
              <option value="beginner">Iniciante (0-1 ano)</option>
              <option value="intermediate">Intermédio (1-3 anos)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Qual é o teu objetivo principal?</label>
            <div className="grid grid-cols-2 gap-4">
              {goals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal: g.id as any })}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    formData.goal === g.id 
                      ? 'bg-accent/10 border-accent' 
                      : 'bg-surface border-border-subtle opacity-50 hover:opacity-100'
                  }`}
                >
                  <p className={`font-black text-sm ${formData.goal === g.id ? 'text-accent' : 'text-text-main'}`}>{g.label}</p>
                  <p className="text-[8px] uppercase font-bold opacity-60">{g.sub}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Escolhe os teus Dias de Treino</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAYS.map((day) => {
                const isSelected = formData.trainingDays?.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`py-3 rounded-xl border text-xs font-black transition-all ${
                      isSelected 
                        ? 'bg-accent text-black border-accent shadow-lg shadow-accent/20' 
                        : 'bg-surface border-border-subtle text-text-muted opacity-40 hover:opacity-100 hover:border-text-muted/20'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[9px] text-text-muted uppercase font-bold mt-3 tracking-widest text-center opacity-60">
              Os dias não selecionados serão marcados como descanso.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Acesso a Equipamento Profissional?</label>
          <div className="grid grid-cols-2 gap-4">
             <button
                type="button"
                onClick={() => setFormData({...formData, hasGymAccess: true})}
                className={`py-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.hasGymAccess ? 'bg-accent/10 border-accent text-accent' : 'bg-background border-border-subtle opacity-50'}`}
             >
                <span className="font-black">SIM</span>
                <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">Tenho Ginásio</span>
             </button>
             <button
                type="button"
                onClick={() => setFormData({...formData, hasGymAccess: false})}
                className={`py-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${!formData.hasGymAccess ? 'bg-accent/10 border-accent text-accent' : 'bg-background border-border-subtle opacity-50'}`}
             >
                <span className="font-black">NÃO</span>
                <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">Peso Corporal</span>
             </button>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full gold-gradient text-black font-black py-5 rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl text-lg uppercase tracking-widest"
        >
          GERAR MEU PLANO ESTRATÉGICO
        </button>
      </form>
    </motion.div>
  );
}
