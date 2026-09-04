'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/api-client';

export default function AuthLoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'TRAVELER' | 'PROVIDER'>('TRAVELER');
  const [email, setEmail] = useState('traveler@experienceplatform.in');
  const [password, setPassword] = useState('Traveler123!');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function switchRole(newRole: 'TRAVELER' | 'PROVIDER') {
    setRole(newRole);
    setError(null);
    setSuccess(null);
    if (newRole === 'TRAVELER') {
      setEmail('traveler@experienceplatform.in');
      setPassword('Traveler123!');
      setRequiresMfa(false);
    } else {
      setEmail('provider@experienceplatform.in');
      setPassword('Provider123!');
      setRequiresMfa(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          mfaCode: mfaCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.requiresMfa) {
          setRequiresMfa(true);
          setError('6-Digit MFA code required for this account.');
          setIsLoading(false);
          return;
        }
        throw new Error(data.message || 'Login failed.');
      }

      // Save tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userRole', data.user?.role || role);

      setSuccess(`Signed in as ${data.user?.name || email}! Redirecting...`);
      setTimeout(() => {
        if (data.user?.role === 'PROVIDER') {
          router.push('/provider/portal');
        } else {
          router.push('/trip');
        }
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-100">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center mx-auto mb-3 shadow-md shadow-orange-500/30">
            LX
          </div>
          <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in to your experience account</p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => switchRole('TRAVELER')}
            className={`py-2 rounded-lg transition ${role === 'TRAVELER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Traveler
          </button>
          <button
            type="button"
            onClick={() => switchRole('PROVIDER')}
            className={`py-2 rounded-lg transition ${role === 'PROVIDER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Provider
          </button>
        </div>

        {/* Quick Demo Info Box */}
        <div className="mb-4 p-3 bg-orange-50/70 border border-orange-100 rounded-xl text-xs text-orange-900">
          <p className="font-semibold mb-1">💡 Pre-filled Demo Credentials:</p>
          <p>Email: <span className="font-mono font-medium">{email}</span></p>
          <p>Password: <span className="font-mono font-medium">{password}</span></p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-orange-500"
            />
          </div>

          {requiresMfa && (
            <div className="bg-orange-50/70 border border-orange-200 p-3 rounded-xl">
              <label className="block text-xs font-bold text-orange-950 mb-1">
                🛡️ 6-Digit Authenticator (MFA) Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                className="w-full text-sm font-mono tracking-widest text-center border border-orange-300 rounded-lg p-2 focus:outline-none focus:border-orange-600 bg-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Protected by Argon2 & Short-Lived JWT Rotation
        </p>
      </div>
    </div>
  );
}
