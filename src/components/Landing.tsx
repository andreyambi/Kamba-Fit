/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  Dumbbell, 
  Star, 
  LayoutList, 
  Utensils, 
  TrendingUp, 
  CheckCircle2, 
  Instagram, 
  Youtube, 
  MessageSquare,
  Mail,
  ArrowRight
} from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function Landing({ onLogin, onRegister }: LandingProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-text-main selection:bg-accent/30 overflow-x-hidden font-sans">
      {/* Top Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center font-black text-black text-sm">K</div>
            <span className="text-lg sm:text-xl font-bold tracking-tighter uppercase text-text-main">Kamba <span className="text-accent">Fit</span></span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-text-muted">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-accent transition-colors">Início</button>
            <button onClick={() => scrollTo('recursos')} className="hover:text-accent transition-colors">Recursos</button>
            <button onClick={() => scrollTo('como-funciona')} className="hover:text-accent transition-colors">Como Funciona</button>
            <button onClick={() => scrollTo('sobre')} className="hover:text-accent transition-colors">Sobre</button>
            <button onClick={() => scrollTo('contato')} className="hover:text-accent transition-colors">Contato</button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={onLogin}
              className="px-4 sm:px-6 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest border border-border-subtle rounded-xl hover:bg-text-main hover:text-background transition-all"
            >
              Entrar
            </button>
            <button 
              onClick={onRegister}
              className="px-4 sm:px-6 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest gold-gradient text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/10"
            >
              Criar Conta
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Overlay - Adjusts based on theme */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070" 
            alt="Hero Athlete" 
            className="w-full h-full object-cover scale-110 lg:translate-x-20 opacity-40 dark:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black mb-6 leading-[1.1] tracking-tighter uppercase italic text-text-main">
              Constrói o teu corpo.<br/>
              <span className="text-transparent bg-clip-text gold-gradient">Transforma a tua vida.</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-muted mb-10 max-w-lg leading-relaxed font-medium">
              Kamba Fit cria planos de treino e nutrição 100% personalizados para te ajudar a ganhar massa muscular com consistência e inteligência.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={onRegister}
                className="px-8 py-4 gold-gradient text-black font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-accent/20"
              >
                Começar Agora <ArrowRight size={16} />
              </button>
              <button 
                onClick={onLogin}
                className="px-8 py-4 bg-transparent border border-border-subtle rounded-xl text-xs font-black uppercase tracking-widest hover:bg-text-main/5 transition-all text-text-main"
              >
                Entrar
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden bg-surface">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="UserAvatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-accent text-accent" />)}
                </div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">+500 utilizadores já estão a transformar o corpo</p>
              </div>
            </div>
          </motion.div>

          {/* Floating Progress Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="absolute top-0 right-0 w-[400px] bg-card backdrop-blur-2xl border border-border-subtle rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-text-main">O teu progresso</h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Peso Atual</p>
                    <p className="text-green-500 dark:text-green-400 text-[10px] font-black uppercase leading-none">+2.3 kg desde o início</p>
                  </div>
                  <p className="text-4xl font-black tabular-nums text-text-main">72.5 <span className="text-sm text-text-muted">kg</span></p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Consistência</p>
                    <p className="text-accent text-[10px] font-black">87%</p>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '87%' }}
                      transition={{ duration: 1, delay: 1 }}
                      className="h-full gold-gradient rounded-full" 
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Treinos esta semana</p>
                    <p className="text-lg font-black text-text-main">4 <span className="text-xs text-text-muted">/ 5</span></p>
                  </div>
                  <div className="flex gap-1 items-end h-8">
                    {[0.4, 0.7, 0.5, 0.9, 0.2].map((h, i) => (
                      <div key={i} className={`w-1.5 bg-accent rounded-full mb-1 transition-opacity ${i < 4 ? 'opacity-100' : 'opacity-30'}`} style={{ height: `${h * 100}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-32 px-6 bg-background relative">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-black uppercase italic mb-4 tracking-tighter text-text-main">Como funciona</h2>
          <p className="text-text-muted text-sm font-medium mb-20 uppercase tracking-widest">3 passos simples para alcançar os teus objetivos</p>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-1/4 left-0 right-0 h-px bg-border-subtle hidden lg:block z-0" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              {[
                { 
                  n: "1", 
                  title: "Insere os teus dados", 
                  desc: "Diz-nos o teu objetivo, experiência, peso e altura para começarmos.",
                  icon: <LayoutList size={24} />
                },
                { 
                  n: "2", 
                  title: "Recebe o teu plano", 
                  desc: "Geramos um plano de treino e nutrição personalizado para ti.",
                  icon: <Dumbbell size={24} />
                },
                { 
                  n: "3", 
                  title: "Acompanha o progresso", 
                  desc: "Regista teus treinos, peso e medidas e vê a tua evolução.",
                  icon: <TrendingUp size={24} />
                }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-12 h-12 gold-gradient flex items-center justify-center rounded-full text-black font-black text-lg mb-8 shadow-lg shadow-accent/20">
                    {step.n}
                  </div>
                  <div className="w-16 h-16 bg-surface border border-border-subtle rounded-2xl flex items-center justify-center mb-6 text-accent">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-black uppercase italic mb-3 tracking-tight text-text-main">{step.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="py-32 px-6 bg-surface/30 border-y border-border-subtle">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black uppercase italic text-center mb-20 tracking-tighter text-text-main">Tudo o que precisas para evoluir</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: "Planos de Treino Personalizados", 
                desc: "Treinos ajustados ao teu nível e objetivo. Mais ganhos, menos adivinhação.", 
                icon: <Dumbbell size={28} /> 
              },
              { 
                title: "Nutrição Inteligente", 
                desc: "Cálculo automático de calorias e macros. Receitas simples e práticas para o teu dia a dia.", 
                icon: <Utensils size={28} /> 
              },
              { 
                title: "Acompanhamento Completo", 
                desc: "Regista teu peso, treinos e medidas e acompanha teus resultados de forma visual.", 
                icon: <TrendingUp size={28} /> 
              },
              { 
                title: "Simples e Eficiente", 
                desc: "Interface limpa e fácil de usar. Foca no que importa: resultados.", 
                icon: <CheckCircle2 size={28} /> 
              }
            ].map((f, i) => (
              <div key={i} className="group bg-card border border-border-subtle p-8 rounded-[32px] hover:border-accent/50 transition-all shadow-sm">
                <div className="text-accent mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-lg font-black uppercase italic mb-3 leading-tight tracking-tight text-text-main">{f.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-20 bg-card border border-border-subtle rounded-[32px] p-8 sm:p-12 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 shadow-lg">
            <div className="text-accent">
              <MessageSquare size={48} className="fill-accent opacity-20" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xl sm:text-2xl font-black italic tracking-tight mb-6 leading-relaxed text-text-main">
                "Incrível! Em poucas semanas já vi mudanças no meu corpo. O plano é simples de seguir e realmente funciona."
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface">
                  <img src="https://i.pravatar.cc/100?img=12" alt="Testimonial User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black uppercase italic text-text-main">João C.</p>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Utilizador Kamba Fit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="gold-gradient p-8 sm:p-16 rounded-[40px] flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl shadow-accent/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10 text-center lg:text-left">
              <div className="flex items-center gap-4 justify-center lg:justify-start mb-6">
                <div className="w-12 h-12 bg-black text-accent rounded-2xl flex items-center justify-center">
                  <Zap size={24} className="fill-accent" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-black uppercase italic tracking-tighter leading-tight">
                  Pronto para começar a tua transformação?
                </h2>
              </div>
              <p className="text-black/60 font-bold uppercase text-[10px] sm:text-xs tracking-widest">Junta-te a centenas de pessoas que já estão a mudar de vida.</p>
            </div>
            <button 
              onClick={onRegister}
              className="relative z-10 px-10 py-5 bg-black text-white font-black uppercase italic tracking-widest text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Começar Agora <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-background py-20 px-6 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center font-black text-black text-sm">K</div>
              <span className="text-lg font-bold tracking-tighter uppercase text-text-main">Kamba <span className="text-accent">Fit</span></span>
            </div>
            <p className="text-text-muted text-xs leading-relaxed max-w-xs">
              A tua plataforma inteligente para treino, nutrição e progresso. Ganha músculo com consistência.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-accent">Navegação</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-text-muted">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-accent transition-colors">Início</button></li>
              <li><button onClick={() => scrollTo('recursos')} className="hover:text-accent transition-colors">Recursos</button></li>
              <li><button onClick={() => scrollTo('como-funciona')} className="hover:text-accent transition-colors">Como Funciona</button></li>
              <li><button onClick={() => scrollTo('sobre')} className="hover:text-accent transition-colors">Sobre</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-accent">Suporte</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-text-muted">
              <li><a href="#" className="hover:text-accent transition-colors text-left block">Contato</a></li>
              <li><a href="#" className="hover:text-accent transition-colors text-left block">Perguntas Frequentes</a></li>
              <li><a href="#" className="hover:text-accent transition-colors text-left block">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-accent transition-colors text-left block">Privacidade</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-accent">Siga-nos</h4>
            <div className="flex gap-4">
              {[
                { icon: <Instagram size={18} />, href: "#" },
                { icon: <Youtube size={18} />, href: "#" },
                { icon: <Mail size={18} />, href: "#" },
                { icon: <MessageSquare size={18} />, href: "#" }
              ].map((s, i) => (
                <a key={i} href={s.href} className="w-10 h-10 bg-surface border border-border-subtle rounded-full flex items-center justify-center hover:bg-accent hover:text-black transition-all text-text-main">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 border-t border-border-subtle text-center">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Kamba Fit. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
