import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addAddress, saveUserProfile } from '../api';
import { useToast } from '../components/ToastProvider';

interface SignupProps {
  onNavigate: (page: string) => void;
}

export default function Signup({ onNavigate }: SignupProps) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [country, setCountry] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!name.trim() || !mobile.trim() || !country.trim() || !addressLine.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the terms and conditions to create an account.');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError, user } = await signUp(email, password);
      if (signUpError) {
        if ((signUpError as any).code === 'EMAIL_EXISTS') {
          showToast({
            variant: 'info',
            title: 'Account already exists',
            message: 'If you already signed up, please check your email (if confirmation is required) and then sign in.'
          });
          onNavigate('login');
          return;
        }
        throw signUpError;
      }

      if (user) {
        await saveUserProfile(user.id, {
          name: name.trim(),
          mobile: mobile.trim(),
          country: country.trim()
        });

        await addAddress(user.id, {
          line1: addressLine.trim(),
          country: country.trim(),
          label: 'Home'
        });
      }

      showToast({
        variant: 'success',
        title: 'Account created',
        message: 'Your Lumina account is ready. Please sign in to start shopping.'
      });
      onNavigate('login');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center animate-fade-in-up">
        <div className="relative hidden md:block animate-fade-in">
          <div className="absolute -inset-8 bg-gradient-to-br from-emerald-500/40 via-cyan-400/30 to-indigo-500/20 blur-3xl" />
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.9)] overflow-hidden">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-300/80 mb-3">
              Join Lumina
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Your next favourite product is a sign‑up away.
            </h1>
            <p className="text-sm text-slate-300/90 mb-6 max-w-sm">
              Create a free account to unlock curated recommendations, fast checkout and a smarter
              shopping experience.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-200/80">
              <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 backdrop-blur">
                <p className="font-semibold">Personalized feed</p>
                <p className="text-[11px] text-slate-300/80">Discover products picked for you.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 backdrop-blur">
                <p className="font-semibold">Saved addresses</p>
                <p className="text-[11px] text-slate-300/80">Checkout in just a few taps.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 backdrop-blur">
                <p className="font-semibold">Secure account</p>
                <p className="text-[11px] text-slate-300/80">Your data, protected by design.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 backdrop-blur">
                <p className="font-semibold">Easy returns</p>
                <p className="text-[11px] text-slate-300/80">Hassle‑free order management.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="relative bg-slate-950/90 border border-emerald-500/20 rounded-3xl p-7 shadow-[0_18px_60px_rgba(16,185,129,0.35)] backdrop-blur">
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-300/80">
                Create account
              </p>
              <h2 className="text-2xl font-semibold text-white mt-1">Start your Lumina journey</h2>
              <p className="text-xs text-slate-300/90 mt-1.5">
                A few quick details so we can personalize your experience and ship orders
                seamlessly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-100 px-3 py-2.5 rounded-2xl text-xs">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-medium text-slate-200">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="mobile" className="block text-xs font-medium text-slate-200">
                    Mobile number
                  </label>
                  <input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="country" className="block text-xs font-medium text-slate-200">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                    placeholder="India"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-medium text-slate-200">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="address" className="block text-xs font-medium text-slate-200">
                  Delivery address
                </label>
                <textarea
                  id="address"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  required
                  rows={3}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                  placeholder="Street, city, state, ZIP"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-medium text-slate-200">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium text-slate-200"
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-2xl bg-slate-900/70 border border-slate-700 px-3 py-2.5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500/60"
                />
                <label htmlFor="terms" className="text-xs text-slate-200">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('terms')}
                    className="font-semibold text-emerald-300 hover:text-emerald-200"
                  >
                    terms & conditions
                  </button>{' '}
                  and understand how Lumina uses my data.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(16,185,129,0.65)] hover:bg-emerald-400 disabled:bg-emerald-900/60 disabled:text-emerald-200 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating your account...' : 'Create my Lumina account'}</span>
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-300/90">
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => onNavigate('login')}
                  className="font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  Sign in instead
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
