import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, Mail, Phone, Lock, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface RegisterPageProps {
  onLoginClick: () => void;
}

export default function RegisterPage({ onLoginClick }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.identifier || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As palavras-passe não coincidem');
      return;
    }

    setIsLoading(true);
    
    const userData = {
      name: formData.name,
      email: formData.identifier.includes('@') ? formData.identifier : '',
      phone: !formData.identifier.includes('@') ? formData.identifier : '',
      password: formData.password,
      onboardingCompleted: false,
      createdAt: new Date().toISOString()
    };

    const result = await register(userData);
    
    if (result) {
      setSuccess(true);
      setTimeout(() => {
        onLoginClick();
      }, 2000);
    } else {
      setError('Utilizador já existe com este email ou telefone');
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle2 color="black" size={40} />
          </div>
          <h1 className="text-3xl font-black mb-2">CONTA <span className="text-accent">CRIADA</span>!</h1>
          <p className="text-text-muted">A preparar o seu ambiente de treino...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2 italic">KAMBA <span className="text-accent">FIT</span></h1>
          <p className="text-text-muted font-bold tracking-tight uppercase text-xs">Junte-se à elite do fitness angolano.</p>
        </div>

        <div className="dark-card p-8 border-border-subtle shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Nome Completo</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-border-subtle rounded-xl px-5 py-4 pl-12 outline-none focus:border-accent transition-all text-text-main"
                  placeholder="Seu nome"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50">
                  <User size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Email ou Telefone</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  className="w-full bg-background border border-border-subtle rounded-xl px-5 py-4 pl-12 outline-none focus:border-accent transition-all text-text-main"
                  placeholder="exemplo@email.com ou 9..."
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50">
                  {formData.identifier.includes('@') ? <Mail size={18} /> : <Phone size={18} />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Palavra-passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-background border border-border-subtle rounded-xl px-5 py-4 pl-12 outline-none focus:border-accent transition-all text-text-main"
                  placeholder="••••••••"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50">
                  <Lock size={18} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/50 hover:text-text-main"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Confirmar Senha</label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-background border border-border-subtle rounded-xl px-5 py-4 pl-12 outline-none focus:border-accent transition-all text-text-main"
                  placeholder="••••••••"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-text-main">
                  <Lock size={18} />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-text-main text-background font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'CRIAR CONTA'}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-text-muted text-sm font-medium">
          Já faz parte da elite? {' '}
          <button 
            onClick={onLoginClick}
            className="text-accent font-black hover:underline"
          >
            FAZER LOGIN
          </button>
        </p>
      </motion.div>
    </div>
  );
}
