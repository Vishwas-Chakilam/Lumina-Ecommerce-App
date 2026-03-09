import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      onNavigate('home');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center animate-fade-in-up">
        <div className="relative hidden md:block animate-fade-in">
          <div className="absolute -inset-8 bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-sky-500/20 blur-3xl" />
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.9)] overflow-hidden">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-300/80 mb-3">
              Lumina Market
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Welcome back to a brighter way to shop.
            </h1>
            <p className="text-sm text-slate-300/90 mb-6 max-w-sm">
              Sign in to track your orders, manage your wishlist, and pick up exactly where you left
              off.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-200/80">
              <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 backdrop-blur">
                <p className="font-semibold">Fast delivery</p>
                <p className="text-[11px] text-slate-300/80">Doorstep delivery on every order.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 backdrop-blur">
                <p className="font-semibold">Secure payments</p>
                <p className="text-[11px] text-slate-300/80">Protected by modern encryption.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 backdrop-blur">
                <p className="font-semibold">Smart wishlist</p>
                <p className="text-[11px] text-slate-300/80">Save products for later.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 backdrop-blur">
                <p className="font-semibold">Order history</p>
                <p className="text-[11px] text-slate-300/80">Keep every purchase in view.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="relative bg-slate-950/90 border border-emerald-500/20 rounded-3xl p-7 shadow-[0_18px_60px_rgba(16,185,129,0.35)] backdrop-blur">
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-300/80">
                Sign in
              </p>
              <h2 className="text-2xl font-semibold text-white mt-1">Welcome back</h2>
              <p className="text-xs text-slate-300/90 mt-1.5">
                Use your email and password to access your Lumina account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-100 px-3 py-2.5 rounded-2xl text-xs">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-medium text-slate-200">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-slate-200"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[11px] text-emerald-300 hover:text-emerald-200"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(16,185,129,0.65)] hover:bg-emerald-400 disabled:bg-emerald-900/60 disabled:text-emerald-200 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Signing you in...' : 'Sign in to Lumina'}</span>
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-300/90">
              <p>
                New to Lumina?{' '}
                <button
                  onClick={() => onNavigate('signup')}
                  className="font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  Create an account
                </button>
              </p>
              <button
                onClick={() => onNavigate('home')}
                className="mt-3 text-[11px] text-slate-400 hover:text-slate-200"
              >
                Or continue browsing as guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
