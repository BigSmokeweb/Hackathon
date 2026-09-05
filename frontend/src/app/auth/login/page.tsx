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
    <div className="min-h-screen bg-[#F7F4EA] text-[#3E4541] pt-28 pb-20 flex items-center justify-center px-4 selection:bg-[#4FA3D1]/30 selection:text-[#3E4541]">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-[#D8D4C8] shadow-lg">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#F7F4EA] text-[#3E4541] border border-[#D8D4C8] font-extrabold flex items-center justify-center mx-auto mb-3 shadow-sm tracking-tighter">
            LX
          </div>
          <h1 className="font-manifold text-2xl tracking-wide uppercase text-[#3E4541] font-bold">Access Portal</h1>
          <p className="text-xs font-mono text-[#3E4541]/70 mt-1 uppercase tracking-wider">
            Sign in to your experience credentials
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-1 bg-[#F7F4EA] border border-[#D8D4C8] p-1 rounded-xl mb-6 text-xs font-mono uppercase tracking-wider">
          <button
            type="button"
            onClick={() => switchRole('TRAVELER')}
            className={`py-2 rounded-lg transition ${role === 'TRAVELER' ? 'bg-[#347F8C] text-[#F7F4EA] font-bold shadow-sm' : 'text-[#3E4541]/70 hover:text-[#3E4541]'}`}
          >
            Traveler
          </button>
          <button
            type="button"
            onClick={() => switchRole('PROVIDER')}
            className={`py-2 rounded-lg transition ${role === 'PROVIDER' ? 'bg-[#347F8C] text-[#F7F4EA] font-bold shadow-sm' : 'text-[#3E4541]/70 hover:text-[#3E4541]'}`}
          >
            Host Guild
          </button>
        </div>

        {/* Quick Demo Info Box */}
        <div className="mb-5 p-3.5 bg-[#F7F4EA] border border-[#D8D4C8] rounded-xl text-xs font-mono text-[#3E4541]">
          <p className="font-bold text-[#347F8C] mb-1">Demo Credentials:</p>
          <p className="text-[11px] text-[#3E4541]/70">Email: <span className="text-[#3E4541] font-semibold">{email}</span></p>
          <p className="text-[11px] text-[#3E4541]/70">Key: <span className="text-[#3E4541] font-semibold">{password}</span></p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-mono text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-[#8FAF82]/20 border border-[#8FAF82]/40 rounded-xl text-xs font-mono text-[#347F8C] font-semibold">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#3E4541]/70 mb-1.5 font-semibold">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full text-xs font-mono bg-[#F7F4EA]/50 border border-[#D8D4C8] rounded-xl p-3 text-[#3E4541] placeholder-[#3E4541]/40 focus:outline-none focus:border-[#347F8C] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#3E4541]/70 mb-1.5 font-semibold">
              Access Secret
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs font-mono bg-[#F7F4EA]/50 border border-[#D8D4C8] rounded-xl p-3 text-[#3E4541] placeholder-[#3E4541]/40 focus:outline-none focus:border-[#347F8C] transition"
            />
          </div>

          {requiresMfa && (
            <div className="bg-[#4FA3D1]/10 border border-[#4FA3D1]/30 p-3 rounded-xl">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#347F8C] mb-1 font-semibold">
                6-Digit Authenticator (MFA) Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                className="w-full text-xs font-mono tracking-widest text-center border border-[#347F8C]/40 rounded-xl p-2.5 focus:outline-none focus:border-[#347F8C] bg-white text-[#3E4541]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#347F8C] hover:bg-[#2A6772] text-[#F7F4EA] font-mono font-bold uppercase tracking-wider py-3 rounded-xl text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              'Authenticate'
            )}
          </button>
        </form>

        <p className="text-center text-[10px] font-mono text-[#3E4541]/50 mt-6 uppercase tracking-wider">
          Protected by Argon2 & Rotational JWT
        </p>
      </div>
    </div>
  );
}
