/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

interface SignupProps {
  onNext: (data: { name: string; email: string; phone: string }) => void;
  onBack: () => void;
}

export default function Signup({ onNext, onBack }: SignupProps) {
  const [data, setData] = useState({ name: '', email: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.name && data.email && data.phone) {
      onNext(data);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <button onClick={onBack} className="text-accent text-sm font-bold uppercase mb-4 opacity-60 hover:opacity-100">← Voltar</button>
        <h2 className="text-4xl font-black mb-2">CRIA A TUA <span className="text-accent">CONTA</span></h2>
        <p className="text-text-muted">Inicia a tua transformação elite hoje.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="dark-card space-y-5 shadow-2xl border-white/10">
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              required
              placeholder="Nome Completo"
              className="w-full bg-background border border-white/5 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-accent transition-colors"
              onChange={e => setData({ ...data, name: e.target.value })}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              required
              type="email"
              placeholder="Email"
              className="w-full bg-background border border-white/5 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-accent transition-colors"
              onChange={e => setData({ ...data, email: e.target.value })}
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              required
              type="tel"
              placeholder="Telefone (+244)"
              className="w-full bg-background border border-white/5 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-accent transition-colors"
              onChange={e => setData({ ...data, phone: e.target.value })}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              required
              type="password"
              placeholder="Palavra-passe"
              className="w-full bg-background border border-white/5 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full gold-gradient text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
        >
          CONTINUAR <ArrowRight size={20} />
        </button>

        <p className="text-center text-xs text-text-muted pt-2 text-[10px] uppercase font-bold tracking-widest leading-loose">
          Ao clicar em continuar, concordas com os nossos <br />
          <span className="text-accent underline cursor-pointer">Termos de Serviço</span> e <span className="text-accent underline cursor-pointer">Política de Privacidade</span>.
        </p>
      </form>
    </div>
  );
}
