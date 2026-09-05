'use client';

import { useState, useCallback } from 'react';
import {
  Category,
  BudgetBand,
  MatchPreviewRequestDto,
} from '@experience-platform/shared';
import {
  ChefHat, Landmark, Compass, Gem, Moon, CalendarDays, Scissors, ShoppingBag,
  MapPin, DollarSign, Image as ImageIcon, Clock, Users, ArrowRight, ArrowLeft,
  Save, Globe, CheckCircle2,
} from 'lucide-react';
import MatchPreviewPanel from './MatchPreviewPanel';

// ── Category metadata ────────────────────────────────────────────────────────
const CATEGORIES: { value: Category; label: string; icon: React.ComponentType<{ className?: string }>; hint: string }[] = [
  { value: Category.FOOD,        label: 'Food & Culinary',   icon: ChefHat,     hint: 'Street food trails, cooking classes, market walks' },
  { value: Category.CULTURE,     label: 'Culture & Heritage', icon: Landmark,    hint: 'Heritage sites, art, architecture, history' },
  { value: Category.ADVENTURE,   label: 'Adventure',          icon: Compass,     hint: 'Treks, water sports, outdoor exploration' },
  { value: Category.HIDDEN_GEMS, label: 'Hidden Gems',        icon: Gem,         hint: 'Off-the-map spots only locals know' },
  { value: Category.NIGHTLIFE,   label: 'Nightlife',          icon: Moon,        hint: 'Evening scenes, music, rooftop bars' },
  { value: Category.EVENTS,      label: 'Local Events',       icon: CalendarDays,hint: 'Festivals, seasonal fairs, community gatherings' },
  { value: Category.WORKSHOPS,   label: 'Workshops & Crafts', icon: Scissors,    hint: 'Hands-on classes, artisan studios, skill demos' },
  { value: Category.SHOPPING,    label: 'Shopping & Markets', icon: ShoppingBag, hint: 'Bazaars, craft markets, specialty boutiques' },
];

const BUDGET_BANDS: { value: BudgetBand; label: string; range: string }[] = [
  { value: BudgetBand.BUDGET,   label: 'Budget',   range: '₹0 – 500' },
  { value: BudgetBand.MODERATE, label: 'Moderate', range: '₹500 – 1,500' },
  { value: BudgetBand.PREMIUM,  label: 'Premium',  range: '₹1,500 – 4,000' },
  { value: BudgetBand.LUXURY,   label: 'Luxury',   range: '₹4,000+' },
];

// Category-specific conditional fields
const CATEGORY_EXTRA_FIELDS: Partial<Record<Category, string[]>> = {
  [Category.FOOD]:      ['cuisineType', 'isVegetarian'],
  [Category.WORKSHOPS]: ['groupSize', 'materialsIncluded'],
  [Category.ADVENTURE]: ['difficultyLevel', 'equipmentProvided'],
};

type FormStep = 1 | 2 | 3 | 4;

interface DraftState {
  category?: Category;
  title: string;
  address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  priceMin?: number;
  priceMax?: number;
  budgetBand?: BudgetBand;
  description: string;
  durationMinutes: number;
  accessibilityTags: string[];
  mediaUrls: string[];
  availabilityRules: Array<{ daysOfWeek: number[]; openTime: string; closeTime: string }>;
  // Category extras (stored loosely, not sent to backend directly)
  extras: Record<string, string | boolean>;
}

interface ListingFormProps {
  token?: string;
  onDraftSaved?: (msg: string) => void;
  onPublished?: () => void;
}

const INITIAL_DRAFT: DraftState = {
  title: '',
  address: '',
  city: '',
  state: '',
  description: '',
  durationMinutes: 120,
  accessibilityTags: [],
  mediaUrls: [],
  availabilityRules: [],
  extras: {},
};

const ACCESSIBILITY_OPTIONS = [
  'Wheelchair accessible',
  'Step-free access',
  'Sign language support',
  'Braille materials',
  'Hearing loop',
  'Dietary accommodations',
  'Child-friendly',
  'Senior-friendly',
];

export default function ListingForm({ token, onDraftSaved, onPublished }: ListingFormProps) {
  const [step, setStep] = useState<FormStep>(1);
  const [draft, setDraft] = useState<DraftState>(INITIAL_DRAFT);
  const [saving, setSaving] = useState(false);

  const update = useCallback(<K extends keyof DraftState>(key: K, value: DraftState[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Build preview payload from current draft (send only set fields)
  const previewPayload: Partial<MatchPreviewRequestDto> = {
    category: draft.category,
    priceMin: draft.priceMin,
    priceMax: draft.priceMax,
    budgetBand: draft.budgetBand,
    latitude: draft.latitude,
    longitude: draft.longitude,
    accessibilityTags: draft.accessibilityTags,
    mediaUrls: draft.mediaUrls,
    description: draft.description,
    availabilityRules: draft.availabilityRules,
    durationMinutes: draft.durationMinutes || undefined,
  };

  const isPublishEligible =
    draft.category !== undefined &&
    draft.title.trim().length >= 3 &&
    draft.budgetBand !== undefined &&
    draft.priceMin !== undefined &&
    draft.priceMax !== undefined &&
    draft.latitude !== undefined &&
    draft.longitude !== undefined &&
    draft.mediaUrls.length >= 1;

  const handleSaveDraft = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800)); // simulated save
    setSaving(false);
    onDraftSaved?.('Draft saved — you can continue editing anytime.');
  };

  // ── Step renderers ────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div>
      <h3 className="font-manifold text-xl text-[#3E4541] font-bold uppercase tracking-wide mb-1">
        What kind of experience is this?
      </h3>
      <p className="text-xs font-mono text-[#5C6460] mb-6">
        Choose a category first — the form will adapt to show relevant fields for your type.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map(({ value, label, icon: Icon, hint }) => (
          <button
            key={value}
            type="button"
            onClick={() => update('category', value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
              draft.category === value
                ? 'border-[#347F8C] bg-[#347F8C]/10 shadow-md shadow-[#347F8C]/10'
                : 'border-[#D8D4C8] bg-white hover:border-[#347F8C]/40 hover:bg-[#F7F4EA]'
            }`}
          >
            <Icon className={`w-6 h-6 ${draft.category === value ? 'text-[#347F8C]' : 'text-[#5C6460]'}`} />
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
              draft.category === value ? 'text-[#347F8C]' : 'text-[#3E4541]'
            }`}>{label}</span>
            <span className="text-[9px] font-mono text-[#3E4541]/50 leading-snug">{hint}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-manifold text-xl text-[#3E4541] font-bold uppercase tracking-wide mb-1">
          Core details
        </h3>
        <p className="text-xs font-mono text-[#5C6460]">
          These fields are required to publish. You can save as draft and come back.
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-1.5">
          Listing Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="e.g. Old Quarter Heritage Walk at Dusk"
          className="w-full text-sm font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] placeholder-[#3E4541]/30 focus:outline-none focus:border-[#347F8C] transition"
        />
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-1.5">
            <MapPin className="w-3 h-3 inline mr-1" />City <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={draft.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="e.g. Jaipur"
            className="w-full text-sm font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] placeholder-[#3E4541]/30 focus:outline-none focus:border-[#347F8C] transition"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-1.5">
            State <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={draft.state}
            onChange={(e) => update('state', e.target.value)}
            placeholder="e.g. Rajasthan"
            className="w-full text-sm font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] placeholder-[#3E4541]/30 focus:outline-none focus:border-[#347F8C] transition"
          />
        </div>
      </div>

      {/* Lat/Lng */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-1.5">
            Latitude <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="any"
            value={draft.latitude ?? ''}
            onChange={(e) => update('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="e.g. 26.9124"
            className="w-full text-sm font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] placeholder-[#3E4541]/30 focus:outline-none focus:border-[#347F8C] transition"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-1.5">
            Longitude <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="any"
            value={draft.longitude ?? ''}
            onChange={(e) => update('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="e.g. 75.7873"
            className="w-full text-sm font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] placeholder-[#3E4541]/30 focus:outline-none focus:border-[#347F8C] transition"
          />
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-2">
          <DollarSign className="w-3 h-3 inline mr-1" />Price Range (₹) <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <input
            type="number"
            min={0}
            value={draft.priceMin ?? ''}
            onChange={(e) => update('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Min price"
            className="w-full text-sm font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] placeholder-[#3E4541]/30 focus:outline-none focus:border-[#347F8C] transition"
          />
          <input
            type="number"
            min={0}
            value={draft.priceMax ?? ''}
            onChange={(e) => update('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Max price"
            className="w-full text-sm font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] placeholder-[#3E4541]/30 focus:outline-none focus:border-[#347F8C] transition"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BUDGET_BANDS.map(({ value, label, range }) => (
            <button
              key={value}
              type="button"
              onClick={() => update('budgetBand', value)}
              className={`py-2 px-3 rounded-xl border text-[10px] font-mono text-center transition ${
                draft.budgetBand === value
                  ? 'border-[#347F8C] bg-[#347F8C]/10 text-[#347F8C] font-bold'
                  : 'border-[#D8D4C8] bg-white text-[#5C6460] hover:border-[#347F8C]/40'
              }`}
            >
              <div className="font-bold uppercase tracking-wider">{label}</div>
              <div className="text-[8px] mt-0.5 opacity-80">{range}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-1.5">
          <Clock className="w-3 h-3 inline mr-1" />Duration (minutes)
        </label>
        <input
          type="number"
          min={15}
          value={draft.durationMinutes}
          onChange={(e) => update('durationMinutes', parseInt(e.target.value) || 120)}
          className="w-40 text-sm font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] focus:outline-none focus:border-[#347F8C] transition"
        />
      </div>
    </div>
  );

  const renderStep3 = () => {
    const extraFields = draft.category ? CATEGORY_EXTRA_FIELDS[draft.category] ?? [] : [];
    return (
      <div className="space-y-5">
        <div>
          <h3 className="font-manifold text-xl text-[#3E4541] font-bold uppercase tracking-wide mb-1">
            {draft.category ? `${CATEGORIES.find((c) => c.value === draft.category)?.label} details` : 'Category details'}
          </h3>
          <p className="text-xs font-mono text-[#5C6460]">
            Optional — but these help travelers find your specific experience type.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-1.5">
            Description
          </label>
          <textarea
            rows={5}
            value={draft.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Tell travelers what makes this experience uniquely yours. What will they see, do, taste, or learn?"
            className="w-full text-sm font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] placeholder-[#3E4541]/30 focus:outline-none focus:border-[#347F8C] transition resize-none"
          />
          <p className="text-[10px] font-mono text-[#5C6460] mt-1">{draft.description.length} / 4000 chars</p>
        </div>

        {/* Category-specific extras */}
        {extraFields.includes('cuisineType') && (
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-1.5">
              Cuisine type
            </label>
            <input
              type="text"
              value={(draft.extras['cuisineType'] as string) ?? ''}
              onChange={(e) => update('extras', { ...draft.extras, cuisineType: e.target.value })}
              placeholder="e.g. Rajasthani street food, Bengali sweets"
              className="w-full text-sm font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] placeholder-[#3E4541]/30 focus:outline-none focus:border-[#347F8C] transition"
            />
          </div>
        )}

        {extraFields.includes('groupSize') && (
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-1.5">
              <Users className="w-3 h-3 inline mr-1" />Max group size
            </label>
            <input
              type="number"
              min={1}
              value={(draft.extras['groupSize'] as string) ?? ''}
              onChange={(e) => update('extras', { ...draft.extras, groupSize: e.target.value })}
              placeholder="e.g. 10"
              className="w-32 text-sm font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] placeholder-[#3E4541]/30 focus:outline-none focus:border-[#347F8C] transition"
            />
          </div>
        )}

        {/* Accessibility tags */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-2">
            Accessibility features
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCESSIBILITY_OPTIONS.map((opt) => {
              const active = draft.accessibilityTags.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    update(
                      'accessibilityTags',
                      active
                        ? draft.accessibilityTags.filter((t) => t !== opt)
                        : [...draft.accessibilityTags, opt],
                    )
                  }
                  className={`px-3 py-1.5 text-[10px] font-mono rounded-full border transition ${
                    active
                      ? 'bg-[#347F8C] border-[#347F8C] text-white font-bold'
                      : 'bg-white border-[#D8D4C8] text-[#5C6460] hover:border-[#347F8C]/40'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-manifold text-xl text-[#3E4541] font-bold uppercase tracking-wide mb-1">
          Photos & Availability
        </h3>
        <p className="text-xs font-mono text-[#5C6460]">
          Optional at this step — save as draft and add later, or complete now to publish immediately.
        </p>
      </div>

      {/* Photo URLs */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-1.5">
          <ImageIcon className="w-3 h-3 inline mr-1" />Photo URLs (one per line, min 1 to publish)
        </label>
        <textarea
          rows={4}
          value={draft.mediaUrls.join('\n')}
          onChange={(e) =>
            update(
              'mediaUrls',
              e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
            )
          }
          placeholder={'https://images.unsplash.com/...\nhttps://images.unsplash.com/...'}
          className="w-full text-xs font-mono bg-[#F7F4EA]/60 border border-[#D8D4C8] rounded-xl p-3.5 text-[#3E4541] placeholder-[#3E4541]/30 focus:outline-none focus:border-[#347F8C] transition resize-none"
        />
        <p className="text-[10px] font-mono text-[#5C6460] mt-1">
          {draft.mediaUrls.length} photo{draft.mediaUrls.length !== 1 ? 's' : ''} added
          {draft.mediaUrls.length < 3 && ' · Add 3+ for best results'}
        </p>
      </div>

      {/* Availability — simple add-a-slot UI */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-2">
          <Clock className="w-3 h-3 inline mr-1" />Availability slots
        </label>

        {draft.availabilityRules.map((rule, idx) => (
          <div key={idx} className="flex flex-wrap items-center gap-2 mb-2 text-xs font-mono text-[#3E4541] bg-[#F7F4EA] px-3 py-2 rounded-lg border border-[#D8D4C8]">
            <span>Days: {rule.daysOfWeek.map((d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}</span>
            <span>·</span>
            <span>{rule.openTime} – {rule.closeTime}</span>
            <button
              type="button"
              onClick={() => update('availabilityRules', draft.availabilityRules.filter((_, i) => i !== idx))}
              className="ml-auto text-red-400 hover:text-red-600 font-bold"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            update('availabilityRules', [
              ...draft.availabilityRules,
              { daysOfWeek: [1, 2, 3, 4, 5], openTime: '09:00', closeTime: '18:00' },
            ])
          }
          className="text-[10px] font-mono uppercase tracking-wider text-[#347F8C] border border-[#347F8C]/40 px-3 py-2 rounded-lg hover:bg-[#347F8C]/10 transition"
        >
          + Add slot (Mon–Fri 09:00–18:00)
        </button>
      </div>

      {/* Summary */}
      <div className={`p-4 rounded-xl border ${isPublishEligible ? 'bg-[#8FAF82]/15 border-[#8FAF82]/40' : 'bg-[#F7F4EA] border-[#D8D4C8]'}`}>
        <p className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#347F8C] mb-2">
          {isPublishEligible ? 'Ready to publish' : 'Draft — required fields missing'}
        </p>
        <ul className="space-y-1 text-[11px] font-mono text-[#5C6460]">
          {[
            { label: 'Category', ok: Boolean(draft.category) },
            { label: 'Title (3+ chars)', ok: draft.title.trim().length >= 3 },
            { label: 'Location pin', ok: draft.latitude !== undefined && draft.longitude !== undefined },
            { label: 'Price range + budget band', ok: draft.budgetBand !== undefined && draft.priceMin !== undefined },
            { label: 'At least 1 photo', ok: draft.mediaUrls.length >= 1 },
          ].map(({ label, ok }) => (
            <li key={label} className={`flex items-center gap-2 ${ok ? 'text-[#347F8C]' : ''}`}>
              <CheckCircle2 className={`w-3 h-3 ${ok ? 'text-[#8FAF82]' : 'text-[#D8D4C8]'}`} />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const STEP_RENDERERS: Record<FormStep, () => React.ReactNode> = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
  };

  const STEP_LABELS: Record<FormStep, string> = {
    1: 'Category',
    2: 'Core details',
    3: 'About & extras',
    4: 'Photos & hours',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form column */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D8D4C8] shadow-sm overflow-hidden">
        {/* Step progress */}
        <div className="px-6 py-4 border-b border-[#D8D4C8] bg-[#F7F4EA]/60">
          <div className="flex items-center gap-0">
            {([1, 2, 3, 4] as FormStep[]).map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => s < step || (s === step + 1 && draft.category) ? setStep(s) : undefined}
                  className={`w-7 h-7 rounded-full text-[10px] font-mono font-bold border-2 transition shrink-0 ${
                    s === step
                      ? 'border-[#347F8C] bg-[#347F8C] text-white'
                      : s < step
                      ? 'border-[#8FAF82] bg-[#8FAF82] text-white'
                      : 'border-[#D8D4C8] bg-white text-[#3E4541]/40'
                  }`}
                >
                  {s < step ? '✓' : s}
                </button>
                <span className={`text-[9px] font-mono uppercase tracking-wider ml-1.5 hidden sm:block ${s === step ? 'text-[#347F8C] font-bold' : 'text-[#3E4541]/40'}`}>
                  {STEP_LABELS[s]}
                </span>
                {s < 4 && <div className={`flex-1 h-0.5 mx-2 ${s < step ? 'bg-[#8FAF82]' : 'bg-[#D8D4C8]'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-6 sm:p-8">
          {STEP_RENDERERS[step]()}
        </div>

        {/* Navigation */}
        <div className="px-6 sm:px-8 pb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as FormStep)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#3E4541]/70 border border-[#D8D4C8] rounded-xl hover:bg-[#F7F4EA] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />Back
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#347F8C] border border-[#347F8C]/40 rounded-xl hover:bg-[#347F8C]/10 transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save draft'}
            </button>
          </div>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as FormStep)}
              disabled={step === 1 && !draft.category}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#347F8C] hover:bg-[#2A6772] text-[#F7F4EA] text-xs font-mono uppercase tracking-wider font-bold rounded-xl shadow-md shadow-[#347F8C]/20 transition disabled:opacity-40"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!isPublishEligible}
              onClick={() => onPublished?.()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#8FAF82] hover:bg-[#7a9e6e] disabled:opacity-40 text-white text-xs font-mono uppercase tracking-wider font-bold rounded-xl shadow-md shadow-[#8FAF82]/20 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              Publish listing
            </button>
          )}
        </div>
      </div>

      {/* Match preview panel */}
      <div className="lg:col-span-5">
        <MatchPreviewPanel draft={previewPayload} token={token} />
      </div>
    </div>
  );
}
