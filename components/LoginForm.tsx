
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import Logo from './Logo.tsx';
import { sendResetEmail } from '../services/emailService.ts';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onPasswordChange: (userId: string, newPass: string, role: string) => void;
  authorizedUsers: User[];
  onBack?: () => void;
  availableRoles: string[];
}

type LoginView = 'login' | 'forgot' | 'force_change' | 'reset_flow';

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onPasswordChange, authorizedUsers, onBack, availableRoles }) => {
  const [view, setView] = useState<LoginView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<string>(UserRole.STUDENT);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith('@asmedu.org');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.toLowerCase().trim();

    if (!validateEmail(normalizedEmail)) {
      setError('Invalid domain. Please use your official @asmedu.org ID.');
      return;
    }

    if (authorizedUsers.length === 0 && normalizedEmail !== 'admin@asmedu.org') {
      setError('System is still synchronizing the campus directory. Please wait a moment.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Emergency Admin Check
      if (normalizedEmail === 'admin@asmedu.org' && password === 'admin123') {
        onLogin({
          id: 'admin001',
          name: 'Principal Admin',
          email: 'admin@asmedu.org',
          role: UserRole.ADMIN,
          department: 'Administration'
        });
        setIsLoading(false);
        return;
      }

      const foundUser = authorizedUsers.find(u => u.email.toLowerCase() === normalizedEmail);

      if (!foundUser) {
        setError('No active record found. Please contact IT Cell for registration.');
        setIsLoading(false);
        return;
      }

      const userPassword = foundUser.password || 'asm@123';

      if (password !== userPassword) {
        setError('Incorrect security key. Try again or reset.');
        setIsLoading(false);
        return;
      }

      if (foundUser.role !== role) {
        setError(`Access Denied: Your account is registered as ${foundUser.role.toUpperCase()}.`);
        setIsLoading(false);
        return;
      }

      if (password === 'asm@123') {
        setPendingUser(foundUser);
        setView('force_change');
        setIsLoading(false);
        return;
      }

      onLogin(foundUser);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#71bf44]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#1a73b8]/10 rounded-full blur-[100px]"></div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl p-10 md:p-14 max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-500 border border-slate-100">
        {onBack && view === 'login' && (
          <button onClick={onBack} className="absolute top-10 left-10 text-slate-300 hover:text-[#1a73b8] transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}

        <div className="text-center mb-10">
          <Logo size="lg" className="mb-6" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portal Access</h1>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.25em] mt-2">ASM Technical Campus Redressal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3 animate-in slide-in-from-top-2">
            <div className="bg-rose-100 p-1 rounded-lg shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
              </svg>
            </div>
            <p className="text-[11px] font-bold text-rose-600 leading-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Profile</label>
            <div className="relative">
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#1a73b8]/5 focus:bg-white transition-all outline-none text-sm font-medium appearance-none">
                {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="id@asmedu.org" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#1a73b8]/5 focus:bg-white transition-all outline-none text-sm font-medium" />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
            <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#1a73b8]/5 focus:bg-white transition-all outline-none text-sm font-medium" />
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-[#1a73b8] text-white py-5 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#1a5da1] shadow-xl transition-all disabled:opacity-50">
            {isLoading ? 'Authenticating...' : 'Enter Secure Portal'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-50 text-center">
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em]">Authorized Campus Governance Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
