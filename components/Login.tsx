import React, { useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';
import { Lock, User as UserIcon, ArrowRight, Phone } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for better UX feel
    setTimeout(() => {
      // Pass the identifier (email or phone) and password
      const user = db.login(identifier, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Identifiants invalides. Pour un membre, utilisez votre numéro de téléphone.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
       const user = db.loginWithGoogle('cheikh.fall@gmail.com');
       if (user) {
         onLogin(user);
       } else {
         setError("Erreur de connexion Google.");
         setIsLoading(false);
       }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-[#13395F] dark:to-slate-900 animate-gradient-x relative overflow-hidden transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-[100px]"></div>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-white/10 relative z-10 transition-all duration-300">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 mb-4 border border-primary/10 dark:border-blue-500/20 transition-transform duration-500 hover:scale-110 hover:rotate-3">
             <Lock size={28} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">Cahier Hainou nahim</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Connectez-vous pour accéder au Dahira</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center flex items-center justify-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Numéro de téléphone (ou Email)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone size={18} className="text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-blue-400 transition-all duration-300 group-focus-within:scale-110" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-blue-500/50 focus:border-primary dark:focus:border-blue-500 transition-all duration-200 focus:scale-[1.02] transform origin-left"
                placeholder="Ex: 77 000 00 00"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Mot de passe</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-blue-400 transition-all duration-300 group-focus-within:scale-110" />
              </div>
              <input
                type="password"
                // Password is required for admins, but for members using phone we might treat it as OTP/Code. 
                // For UI we keep it required to avoid confusion, but backend logic handles it.
                required 
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-blue-500/50 focus:border-primary dark:focus:border-blue-500 transition-all duration-200 focus:scale-[1.02] transform origin-left"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-right italic">
                Membres : utilisez n'importe quel code si vous n'avez pas de mot de passe défini.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full group flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-900/10 dark:shadow-blue-900/20 text-sm font-bold text-white bg-primary hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-primary transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2 active:scale-[0.98] transform"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                Se connecter
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        
        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">OU</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center py-3.5 px-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-[0.98] transform"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
             <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
             <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
             <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
        </button>

        <div className="mt-8 text-center">
           <div className="text-xs text-slate-500">
            <span className="opacity-50">Accès Admin :</span> <br/>
            gueyemodougningue@gmail.com / Passer123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;