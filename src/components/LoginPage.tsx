import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, Mail, Phone, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onRegisterClick: () => void;
  onLoginSuccess: () => void;
}

export default function LoginPage({ onRegisterClick, onLoginSuccess }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier) {
      setError('Insira o seu email ou telefone');
      return;
    }

    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    const result = await login(identifier, password);
    
    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.message || 'Credenciais inválidas ou utilizador não encontrado');
    }
    setIsLoading(false);
  };

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier) {
      setError('Insira o seu email ou telefone para recuperar');
      return;
    }
    
    setIsLoading(true);
    // Simulate recovery
    setTimeout(() => {
      setRecoverySent(true);
      setIsLoading(false);
      setError('');
    }, 1500);
  };

  if (isRecovering) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black mb-2 italic uppercase">RECUPERAR <span className="text-accent">ACESSO</span></h1>
            <p className="text-text-muted">Enviaremos instruções para o seu contacto.</p>
          </div>

          <div className="dark-card p-8 border-border-subtle shadow-2xl">
            {!recoverySent ? (
              <form onSubmit={handleRecover} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Email ou Telefone</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-background border border-border-subtle rounded-xl px-5 py-4 pl-12 outline-none focus:border-accent transition-all text-text-main"
                      placeholder="exemplo@email.com"
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50">
                      <Mail size={18} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gold-gradient text-black font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/10 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'ENVIAR INSTRUÇÕES'}
                </button>

                <button 
                  type="button"
                  onClick={() => setIsRecovering(false)}
                  className="w-full text-xs font-bold text-text-muted hover:text-white transition-colors"
                >
                  Voltar ao Login
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center mx-auto text-black mb-4">
                  <Mail size={32} />
                </div>
                <h3 className="text-xl font-bold italic">INSTRUÇÕES ENVIADAS!</h3>
                <p className="text-sm text-text-muted">
                  Verifique o seu email ou SMS para as instruções de recuperação de palavra-passe.
                </p>
                <button 
                  onClick={() => setIsRecovering(false)}
                  className="gold-gradient text-black font-black px-8 py-3 rounded-xl uppercase text-xs"
                >
                  Voltar ao Login
                </button>
              </div>
            )}
          </div>
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
          <div className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full mb-4">
            <span className="text-accent text-xs font-black uppercase tracking-widest">Acesso de Elite</span>
          </div>
          <h1 className="text-4xl font-black mb-2 italic">KAMBA <span className="text-accent">FIT</span></h1>
          <p className="text-text-muted">Bem-vindo à sua central de performance.</p>
        </div>

        <div className="dark-card p-8 border-border-subtle shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Email ou Telefone</label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-xl px-5 py-4 pl-12 outline-none focus:border-accent transition-all text-text-main"
                  placeholder="exemplo@email.com"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50">
                  {identifier.includes('@') ? <Mail size={18} /> : <Phone size={18} />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Palavra-passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-xl px-5 py-4 pl-12 pr-12 outline-none focus:border-accent transition-all text-text-main"
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
              className="w-full gold-gradient text-black font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/10 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'INICIAR SESSÃO'}
            </button>

            <div className="flex items-center justify-between text-xs font-bold">
              <button 
                type="button" 
                onClick={() => setIsRecovering(true)}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                Esqueci a senha
              </button>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="accent-accent" />
                <label htmlFor="remember" className="text-text-muted cursor-pointer">Manter sessão</label>
              </div>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-text-muted text-sm font-medium">
          Não tem conta? {' '}
          <button 
            onClick={onRegisterClick}
            className="text-accent font-black hover:underline"
          >
            CRIAR AGORA
          </button>
        </p>
      </motion.div>
    </div>
  );
}
