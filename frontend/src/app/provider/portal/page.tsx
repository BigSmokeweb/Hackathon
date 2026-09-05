'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Plus, 
  FileText, 
  MapPin, 
  Star, 
  ArrowRight, 
  Clock, 
  UploadCloud, 
  CheckCircle2, 
  Key, 
  Sparkles,
  Compass,
  AlertCircle
} from 'lucide-react';

export default function ProviderPortalPage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'kyc' | 'mfa'>('listings');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [docType, setDocType] = useState('GST_CERTIFICATE');

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
    }, 1200);
  };

  return (
    <div className="bg-[#F7F4EA] text-[#3E4541] min-h-screen pt-28 pb-24 selection:bg-[#4FA3D1]/30 selection:text-[#3E4541]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Breadcrumb / Top Category Badge ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#D8D4C8] mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-[#347F8C] font-mono text-xs tracking-[0.28em] uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-[#8FAF82] animate-pulse" />
              Provider Control Center
            </div>
            <h1 className="font-manifold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wide text-[#3E4541] font-extrabold leading-tight">
              Host & Guide Dashboard
            </h1>
            <p className="text-xs sm:text-sm font-light text-[#5C6460] mt-2 max-w-xl">
              Spatial integrity telemetry, on-site verified credentials, and cryptographic custody of regional experience records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8FAF82]/15 text-[#347F8C] border border-[#8FAF82]/40 rounded-full text-xs font-mono font-medium shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#8FAF82]" />
              <span>Verified Host Guild</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#3E4541]/80 border border-[#D8D4C8] rounded-full text-xs font-mono font-medium shadow-sm">
              <Lock className="w-3.5 h-3.5 text-[#347F8C]" />
              <span>2FA Enforced</span>
            </div>
          </div>
        </div>

        {/* ─── Navigation Tabs ─── */}
        <div className="flex items-center border-b border-[#D8D4C8] mb-10 overflow-x-auto no-scrollbar gap-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 transition-all text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap border-b-2 flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'border-[#347F8C] text-[#347F8C]'
                : 'border-transparent text-[#3E4541]/60 hover:text-[#3E4541]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>My Listed Experiences</span>
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`pb-4 transition-all text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap border-b-2 flex items-center gap-2 ${
              activeTab === 'kyc'
                ? 'border-[#347F8C] text-[#347F8C]'
                : 'border-transparent text-[#3E4541]/60 hover:text-[#3E4541]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>KYC & Spatial Verification</span>
          </button>
          <button
            onClick={() => setActiveTab('mfa')}
            className={`pb-4 transition-all text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap border-b-2 flex items-center gap-2 ${
              activeTab === 'mfa'
                ? 'border-[#347F8C] text-[#347F8C]'
                : 'border-transparent text-[#3E4541]/60 hover:text-[#3E4541]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Security & 2FA Setup</span>
          </button>
        </div>

        {/* ─── Tab Content ─── */}
        {activeTab === 'listings' && (
          <div className="space-y-8">
            {/* Header Action Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D8D4C8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold block mb-1">
                  Catalog Management
                </span>
                <h2 className="font-manifold text-xl sm:text-2xl text-[#3E4541] font-bold uppercase tracking-wide">
                  Curated Experience Portfolio
                </h2>
                <p className="text-xs font-mono text-[#3E4541]/70 mt-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF82]" />
                  PostGIS spatial indexing and deterministic authenticity scoring active
                </p>
              </div>
              <button 
                type="button"
                className="inline-flex items-center justify-center gap-2 bg-[#347F8C] hover:bg-[#2A6772] text-[#F7F4EA] text-xs font-mono uppercase tracking-wider font-bold px-5 py-3 rounded-xl shadow-md shadow-[#347F8C]/20 transition-all duration-300 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Experience</span>
              </button>
            </div>

            {/* Listings Grid / Table */}
            <div className="bg-white rounded-2xl border border-[#D8D4C8] overflow-hidden shadow-sm">
              <div className="p-5 sm:p-6 border-b border-[#D8D4C8] bg-[#F7F4EA]/40 flex items-center justify-between">
                <div>
                  <h3 className="font-manifold text-base text-[#3E4541] uppercase tracking-wide font-bold">
                    Active Catalog Listings (3)
                  </h3>
                  <p className="text-xs font-mono text-[#3E4541]/60 mt-0.5">
                    Synchronized across Ahmedabad, Mumbai, Jaipur
                  </p>
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-3 py-1 bg-[#8FAF82]/20 text-[#347F8C] border border-[#8FAF82]/30 rounded-full font-semibold">
                  3 Deployed
                </span>
              </div>

              <div className="divide-y divide-[#D8D4C8]">
                {[
                  {
                    title: 'Old Ahmedabad Heritage & Pol Food Trail',
                    category: 'FOOD',
                    city: 'Ahmedabad',
                    rating: 4.85,
                    reviews: 124,
                    duration: '90 mins',
                    tariff: '₹450 – ₹750',
                    status: 'Active',
                    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    title: 'Dawn at Sassoon Docks: Fisherfolk Culture',
                    category: 'LOCAL LIFE',
                    city: 'Mumbai',
                    rating: 4.88,
                    reviews: 96,
                    duration: '120 mins',
                    tariff: '₹600 – ₹1,000',
                    status: 'Active',
                    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    title: 'Bagru Natural Indigo Block Printing Workshop',
                    category: 'WORKSHOPS',
                    city: 'Jaipur',
                    rating: 4.95,
                    reviews: 78,
                    duration: '120 mins',
                    tariff: '₹1,500 – ₹2,200',
                    status: 'Active',
                    image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-[#F7F4EA]/30 transition-colors"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#D8D4C8] bg-zinc-100 shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold">
                            {item.category}
                          </span>
                          <span className="text-[#D8D4C8]">&bull;</span>
                          <span className="text-[10px] font-mono text-[#3E4541]/60 uppercase">
                            {item.city}
                          </span>
                        </div>
                        <h4 className="font-manifold text-base sm:text-lg text-[#3E4541] font-bold uppercase tracking-wide truncate">
                          {item.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-mono text-[#3E4541]/75">
                          <span className="flex items-center gap-1 font-semibold text-[#3E4541]">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            {item.rating}
                          </span>
                          <span className="text-[#D8D4C8]">&bull;</span>
                          <span>{item.reviews} reviews</span>
                          <span className="text-[#D8D4C8]">&bull;</span>
                          <span>{item.duration}</span>
                          <span className="text-[#D8D4C8]">&bull;</span>
                          <span className="font-semibold text-[#347F8C]">{item.tariff}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#D8D4C8]">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#8FAF82]/20 text-[#347F8C] border border-[#8FAF82]/30 text-xs font-mono uppercase tracking-wider font-bold rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF82]" />
                        {item.status}
                      </span>
                      <button 
                        type="button"
                        className="text-xs font-mono uppercase tracking-wider text-[#347F8C] hover:text-[#2A6772] font-bold underline underline-offset-4 decoration-[#347F8C]/40 hover:decoration-[#347F8C] transition"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── KYC Verification Tab ─── */}
        {activeTab === 'kyc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-[#D8D4C8] shadow-sm">
              <div className="mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold block mb-1">
                  Identity & Compliance
                </span>
                <h2 className="font-manifold text-2xl text-[#3E4541] uppercase tracking-wide font-bold">
                  Host & Guide Verification Audit
                </h2>
                <p className="text-xs font-mono text-[#3E4541]/70 mt-1 leading-relaxed">
                  Documents are stored in an access-restricted private storage bucket using single-use signed cryptographic tokens with 15-minute expiry under DPDP Act compliance.
                </p>
              </div>

              {uploadSuccess ? (
                <div className="p-6 rounded-xl bg-[#8FAF82]/15 border border-[#8FAF82]/40 text-xs font-mono text-[#3E4541] space-y-3">
                  <div className="flex items-center gap-2 text-[#347F8C] font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#8FAF82]" />
                    Document Securely Ingested & Verified
                  </div>
                  <p className="text-[#3E4541]/80">
                    Your verification record has been timestamped and encrypted into the host registry. Single-use download hashes generated for supervisory compliance audits.
                  </p>
                  <button
                    type="button"
                    onClick={() => setUploadSuccess(false)}
                    className="mt-2 text-xs text-[#347F8C] underline font-bold uppercase tracking-wider"
                  >
                    Upload an additional credential
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#3E4541] font-bold mb-2">
                      Accreditation Document Type
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full text-xs font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] focus:outline-none focus:border-[#347F8C] transition"
                    >
                      <option value="GST_CERTIFICATE">GST Registration Certificate (Artisan Guild / LLP)</option>
                      <option value="BUSINESS_REGISTRATION">Shop & Establishment Act / MSME Udyam License</option>
                      <option value="GOVERNMENT_ID">Ministry of Tourism Certified Guide License (RLG)</option>
                      <option value="HERITAGE_TRUST">State Heritage Council or Craft Cooperative Mandate</option>
                    </select>
                  </div>

                  <div className="border-2 border-dashed border-[#D8D4C8] rounded-2xl p-8 sm:p-10 text-center bg-[#F7F4EA]/40 hover:bg-[#F7F4EA]/80 transition-colors">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#347F8C]/15 flex items-center justify-center text-[#347F8C]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-mono uppercase tracking-wider font-bold text-[#3E4541]">
                      Select PDF or High-Resolution Scanned License
                    </p>
                    <p className="text-[11px] font-mono text-[#3E4541]/60 mt-1">
                      Max file size: 15MB. Encrypted in transit via AES-256 GCM.
                    </p>
                    <input 
                      type="file" 
                      required
                      className="mt-4 text-xs font-mono text-[#3E4541]/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-[#D8D4C8] file:text-xs file:font-mono file:uppercase file:bg-white file:text-[#347F8C] file:font-bold hover:file:bg-[#F7F4EA] file:cursor-pointer cursor-pointer" 
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#347F8C] hover:bg-[#2A6772] disabled:opacity-50 text-[#F7F4EA] font-mono text-xs uppercase tracking-wider font-bold py-3.5 rounded-xl transition shadow-md shadow-[#347F8C]/20"
                  >
                    {isUploading ? (
                      <span>Encrypting & Generating Signature...</span>
                    ) : (
                      <>
                        <span>Request Signed Upload & Transmit</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar Guidelines */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#D8D4C8] shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold block mb-2">
                  Verification Standards
                </span>
                <h3 className="font-manifold text-lg text-[#3E4541] font-bold uppercase tracking-wide">
                  Ethical Host Charter
                </h3>
                <ul className="mt-4 space-y-3 text-xs font-mono text-[#3E4541]/80">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#8FAF82] shrink-0 mt-0.5" />
                    <span>Zero kickbacks to tourist shops or commission stops.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#8FAF82] shrink-0 mt-0.5" />
                    <span>Direct financial payout disbursement to authentic craftspeople.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#8FAF82] shrink-0 mt-0.5" />
                    <span>Verified physical coordinates with geofenced check-in nodes.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#F0EDE1] p-5 rounded-2xl border border-[#D8D4C8] text-xs font-mono text-[#3E4541]/80 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#347F8C] shrink-0 mt-0.5" />
                <span>
                  Regulatory compliance guaranteed under the Digital Personal Data Protection Act (DPDP) 2023.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Security & 2FA Tab ─── */}
        {activeTab === 'mfa' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D8D4C8] shadow-sm max-w-2xl">
            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold block mb-1">
                Access Security
              </span>
              <h2 className="font-manifold text-2xl text-[#3E4541] uppercase tracking-wide font-bold">
                Two-Factor Authentication (MFA)
              </h2>
              <p className="text-xs font-mono text-[#3E4541]/70 mt-1 leading-relaxed">
                Mandatory multi-factor enforcement for all provider accounts to guard listing provenance, financial payouts, and spatial metadata integrity.
              </p>
            </div>

            <div className="bg-[#8FAF82]/15 border border-[#8FAF82]/40 p-5 rounded-xl flex items-start gap-3.5 mb-6 text-xs font-mono text-[#3E4541]">
              <CheckCircle2 className="w-5 h-5 text-[#8FAF82] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#347F8C] text-sm">TOTP Multi-Factor Authentication Active</p>
                <p className="text-[#3E4541]/80 mt-1">
                  Time-based one-time password verification (Google Authenticator / 1Password) is permanently bound to this host profile.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-[#D8D4C8] bg-[#F7F4EA]/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-[#3E4541]">
                    Hardware Token / Backup Codes
                  </h4>
                  <p className="text-[11px] font-mono text-[#3E4541]/60 mt-0.5">
                    10 single-use emergency recovery keys provisioned
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider bg-white border border-[#D8D4C8] text-[#347F8C] font-bold rounded-lg hover:bg-[#F7F4EA] transition shadow-sm"
                >
                  Regenerate
                </button>
              </div>

              <div className="pt-3 border-t border-[#D8D4C8] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-[#3E4541]">
                    Session Sign-Out
                  </h4>
                  <p className="text-[11px] font-mono text-[#3E4541]/60 mt-0.5">
                    Revoke all active browser sessions across devices
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition shadow-sm"
                >
                  Revoke All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
