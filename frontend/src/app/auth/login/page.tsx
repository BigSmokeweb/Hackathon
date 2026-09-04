'use client';

import { useState } from 'react';

export default function AuthLoginPage() {
  const [role, setRole] = useState<'TRAVELER' | 'PROVIDER'>('TRAVELER');
  const [requiresMfa, setRequiresMfa] = useState(false);

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
            onClick={() => { setRole('TRAVELER'); setRequiresMfa(false); }}
            className={`py-2 rounded-lg transition ${role === 'TRAVELER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Traveler
          </button>
          <button
            onClick={() => { setRole('PROVIDER'); setRequiresMfa(true); }}
            className={`py-2 rounded-lg transition ${role === 'PROVIDER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Provider (MFA)
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@domain.com"
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-orange-500"
              defaultValue={role === 'PROVIDER' ? 'ahmedabad.heritage@experienceplatform.in' : ''}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-orange-500"
              defaultValue={role === 'PROVIDER' ? 'ProviderSecurePass123!' : ''}
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
                placeholder="123456"
                className="w-full text-sm font-mono tracking-widest text-center border border-orange-300 rounded-lg p-2 focus:outline-none focus:border-orange-600 bg-white"
              />
              <span className="block text-[11px] text-orange-800 mt-1">
                Mandatory 2FA enforcement for provider accounts
              </span>
            </div>
          )}

          <button
            type="button"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Protected by Argon2 & Short-Lived JWT Rotation
        </p>
      </div>
    </div>
  );
}
