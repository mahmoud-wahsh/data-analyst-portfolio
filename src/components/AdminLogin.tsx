import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail, ArrowLeft, AlertCircle, Loader2, UserPlus, ShieldAlert } from 'lucide-react';
import { auth } from '../firebase';

interface AdminLoginProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

const FIRST_ADMIN_STORAGE_KEY = 'portfolio_first_admin_initialized';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBack, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingFirstAdmin, setIsCreatingFirstAdmin] = useState(false);
  
  // Track whether the first admin has already been created
  const [firstAdminExists, setFirstAdminExists] = useState<boolean>(() => {
    return localStorage.getItem(FIRST_ADMIN_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    // If first admin exists, ensure mode is strictly login
    if (firstAdminExists) {
      setIsCreatingFirstAdmin(false);
    }
  }, [firstAdminExists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isCreatingFirstAdmin) {
        // Enforce that first admin can only be created if not yet initialized
        if (firstAdminExists) {
          setError('First admin account has already been created. Registration is permanently disabled.');
          setIsCreatingFirstAdmin(false);
          setIsLoading(false);
          return;
        }

        // Create the first admin account
        await createUserWithEmailAndPassword(auth, email, password);

        // Permanently lock further admin registrations
        localStorage.setItem(FIRST_ADMIN_STORAGE_KEY, 'true');
        setFirstAdminExists(true);
        setIsCreatingFirstAdmin(false);

        // Redirect to protected /admin route
        onLoginSuccess();
      } else {
        // Standard Admin Login
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess();
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        // If the email already exists in Firebase, admin has already been set up
        localStorage.setItem(FIRST_ADMIN_STORAGE_KEY, 'true');
        setFirstAdminExists(true);
        setIsCreatingFirstAdmin(false);
        setError('This email is already registered. Please log in with your password.');
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setError('Invalid email or password.');
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/operation-not-allowed') {
        setError(
          'Email/Password sign-in is not enabled in your Firebase Console yet. Please enable it under Authentication > Sign-in method > Email/Password, then try again.'
        );
      } else if (code === 'auth/too-many-requests') {
        setError('Access temporarily disabled due to many failed attempts. Try again later.');
      } else {
        setError(err?.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      {/* Back to Portfolio button */}
      <div className="w-full max-w-md mb-6">
        <button
          id="back-to-portfolio-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </button>
      </div>

      {/* Admin Auth Card */}
      <div className="w-full max-w-md bg-slate-900/85 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400">
            {isCreatingFirstAdmin ? <UserPlus className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isCreatingFirstAdmin ? 'Create First Admin' : 'Admin Login'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isCreatingFirstAdmin
                ? 'One-time initial administrator setup'
                : 'Please sign in to access /admin'}
            </p>
          </div>
        </div>

        {/* Notice if first admin has been created */}
        {firstAdminExists && !isCreatingFirstAdmin && (
          <div className="mb-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Admin account initialized. New registrations are closed.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              id="auth-error-alert"
              className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs sm:text-sm text-red-300"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id={isCreatingFirstAdmin ? 'create-first-admin-btn' : 'admin-login-btn'}
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-white text-slate-950 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>{isCreatingFirstAdmin ? 'Creating Admin...' : 'Logging in...'}</span>
              </>
            ) : (
              <span>{isCreatingFirstAdmin ? 'Create First Admin' : 'Login'}</span>
            )}
          </button>
        </form>

        {/* Toggle between Login and Create First Admin (ONLY if first admin not created) */}
        {!firstAdminExists ? (
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            {isCreatingFirstAdmin ? (
              <button
                id="toggle-to-login-btn"
                type="button"
                onClick={() => {
                  setIsCreatingFirstAdmin(false);
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Already have an admin account? <span className="underline">Back to Login</span>
              </button>
            ) : (
              <button
                id="toggle-create-first-admin-btn"
                type="button"
                onClick={() => {
                  setIsCreatingFirstAdmin(true);
                  setError(null);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
              >
                Setup: Create First Admin
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
            <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Public account creation is disabled</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
