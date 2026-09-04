'use client';

import { useState } from 'react';

export default function ProviderPortalPage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'kyc' | 'mfa'>('listings');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">Provider Control Center</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Host & Guide Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            ✓ Verified Account
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
            🛡️ MFA Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'listings'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Listed Experiences
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'kyc'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          KYC & Government Verification
        </button>
        <button
          onClick={() => setActiveTab('mfa')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'mfa'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security & 2FA Setup
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manage Your Experiences</h2>
              <p className="text-xs text-slate-500 mt-0.5">PostGIS spatial indexing and deterministic ranking active</p>
            </div>
            <button className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition">
              + Add New Experience
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Active Listings (3)</span>
              <span className="text-xs text-slate-400">Ahmedabad, Mumbai, Jaipur</span>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { title: 'Old Ahmedabad Heritage & Pol Food Trail', city: 'Ahmedabad', rating: 4.85, status: 'Active' },
                { title: 'Dawn at Sassoon Docks: Fisherfolk Culture', city: 'Mumbai', rating: 4.88, status: 'Active' },
                { title: 'Bagru Natural Indigo Block Printing Workshop', city: 'Jaipur', rating: 4.95, status: 'Active' },
              ].map((item, idx) => (
                <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">📍 {item.city} • ★ {item.rating} (Avg. Rating)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                      {item.status}
                    </span>
                    <button className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'kyc' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Provider KYC Verification</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            All documents are stored in an access-restricted private storage bucket using single-use signed URLs with 15-minute expiry.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
              <select className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-orange-500">
                <option value="GST_CERTIFICATE">GST Registration Certificate</option>
                <option value="BUSINESS_REGISTRATION">Shop & Establishment Act / MSME</option>
                <option value="GOVERNMENT_ID">Government Certified Guide License</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
              <p className="text-sm font-semibold text-slate-700">Upload PDF or high-res document</p>
              <p className="text-xs text-slate-400 mt-1">Single-use signed cryptographic upload</p>
              <input type="file" className="mt-4 text-xs text-slate-500" />
            </div>

            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-sm transition">
              Request Signed Upload & Submit
            </button>
          </div>
        </div>
      )}

      {activeTab === 'mfa' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Two-Factor Authentication (MFA)</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Mandatory security enforcement for provider accounts to protect payouts and listing integrity.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-800">
            ✓ TOTP Multi-Factor Authentication is currently enforced for this account.
          </div>
        </div>
      )}
    </div>
  );
}
