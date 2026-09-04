import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiReasoningPayload,
  AiExplanationResult,
  AiItineraryStepResult,
  AiWrapUpPrompt,
  AiWeatherAdaptPrompt,
  SessionAiReasoningPayload,
} from '@experience-platform/shared';

@Injectable()
export class AiReasoningService {
  private readonly logger = new Logger(AiReasoningService.name);
  private readonly isEnabled: boolean;
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled = this.configService.get<string>('AI_SERVICE_ENABLED', 'true') === 'true';
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
  }

  /**
   * Generates natural-language "Why this" explanations for already-ranked top-N candidates.
   *
   * SECURITY GUARANTEES:
   * 1. Stateless execution — zero direct database access or write permissions.
   * 2. Receives only pre-filtered, pre-scored candidate JSON (no raw SQL, no system tools).
   * 3. Prompt injection safe: Treats user intent text strictly as data in structured JSON format.
   * 4. Resilient fallback: If API is disabled, unavailable, or times out, returns deterministic template phrases.
   */
  async generateExplanations(
    payload: AiReasoningPayload,
  ): Promise<AiExplanationResult[]> {
    if (!this.isEnabled || !this.apiKey || payload.candidates.length === 0) {
      return this.generateFallbackExplanations(payload);
    }

    try {
      const structuredPrompt = {
        role: 'system',
        instruction:
          'You are an expert local guide assistant in India. For each experience candidate provided, write a concise, compelling 1-sentence "why this matches your trip" explanation and a 2-3 word highlight hook based on the provided attributes. Return valid JSON only matching the schema.',
        context: {
          userIntent: payload.userIntent || 'General local discovery',
          groupSize: payload.groupSize,
          budgetBand: payload.budgetBand,
        },
        candidates: payload.candidates.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          city: c.city,
          distanceKm: c.distanceKm,
          priceRange: `₹${c.priceMin} - ₹${c.priceMax}`,
          authenticityScore: `${Math.round(c.authenticityRating * 100)}%`,
          accessibilityTags: c.accessibilityTags,
        })),
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: JSON.stringify(structuredPrompt) }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        },
      );

      if (!response.ok) {
        this.logger.warn(`Gemini API returned status ${response.status}. Using fallback explanations.`);
        return this.generateFallbackExplanations(payload);
      }

      const resultData = await response.json();
      const rawText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return this.generateFallbackExplanations(payload);

      const parsed: AiExplanationResult[] = JSON.parse(rawText);
      return parsed;
    } catch (err) {
      this.logger.error('Error in AI reasoning explanation layer. Falling back to deterministic copy.', err);
      return this.generateFallbackExplanations(payload);
    }
  }

  /**
   * Deterministic explanation fallback when AI is disabled or offline
   */
  private generateFallbackExplanations(payload: AiReasoningPayload): AiExplanationResult[] {
    return payload.candidates.map((c) => ({
      experienceId: c.id,
      whyThis: `Top-rated ${c.category.toLowerCase().replace('_', ' ')} pick located ${c.distanceKm} km away with ${Math.round(c.authenticityRating * 100)}% local authenticity rating.`,
      highlightHook: `Authentic ${c.category.replace('_', ' ')}`,
    }));
  }

  // ─── Session-aware AI response methods ────────────────────────────────────
  // All three below follow the same security rules as generateExplanations():
  //  - Structured JSON only — no raw user text concatenated into the prompt
  //  - Distinct, schema-validated response shapes (not freeform chat)
  //  - Deterministic fallbacks when AI is disabled/unavailable

  /**
   * Generates itinerary-step explanations for session-based recommendations.
   * Explains WHY this stop fits the itinerary given the session context so far.
   */
  async generateSessionStepExplanations(
    payload: SessionAiReasoningPayload,
  ): Promise<AiItineraryStepResult[]> {
    if (!this.isEnabled || !this.apiKey || payload.candidates.length === 0) {
      return this.fallbackSessionStepExplanations(payload);
    }

    try {
      const structuredPrompt = {
        role: 'system',
        instruction:
          'You are an itinerary assistant for India travel. For each candidate, write a 1-sentence "why this fits your itinerary now" explanation that references the session progress, and a 2-3 word hook. Return valid JSON array with schema: [{experienceId, stepExplanation, highlightHook}].',
        sessionContext: payload.sessionContext,
        candidates: payload.candidates.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          distanceKm: c.distanceKm,
          priceRange: `₹${c.priceMin} - ₹${c.priceMax}`,
        })),
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: JSON.stringify(structuredPrompt) }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
          }),
          signal: AbortSignal.timeout(5000),
        },
      );

      if (!response.ok) return this.fallbackSessionStepExplanations(payload);
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return this.fallbackSessionStepExplanations(payload);
      return JSON.parse(rawText) as AiItineraryStepResult[];
    } catch (err) {
      this.logger.error('Session step explanation failed; using fallback.', err);
      return this.fallbackSessionStepExplanations(payload);
    }
  }

  private fallbackSessionStepExplanations(payload: SessionAiReasoningPayload): AiItineraryStepResult[] {
    return payload.candidates.map((c) => ({
      experienceId: c.id,
      stepExplanation: `Stop ${(payload.sessionContext?.selectedCount ?? 0) + 1}: This ${c.category.toLowerCase().replace('_', ' ')} is ${c.distanceKm} km from your current location and fits within your remaining budget.`,
      highlightHook: `Next up: ${c.category.replace('_', ' ')}`,
    }));
  }

  /**
   * Generates a wrap-up prompt when remaining time/budget is nearly exhausted.
   * The BACKEND decides when to call this (based on StopConditionResult.wrapUpFlag).
   * The LLM only phrases the message — it never decides whether to stop.
   */
  async generateWrapUpPrompt(
    payload: SessionAiReasoningPayload,
    reason: 'LOW_TIME' | 'LOW_BUDGET' | 'NO_CANDIDATES',
  ): Promise<AiWrapUpPrompt> {
    if (!this.isEnabled || !this.apiKey) {
      return this.fallbackWrapUpPrompt(payload, reason);
    }

    try {
      const structuredPrompt = {
        role: 'system',
        instruction:
          'You are a friendly itinerary assistant. Generate a single warm, concise message (max 2 sentences) suggesting the user wraps up their trip or picks one final stop. Use the trigger reason and session context. Return JSON: {message, triggerReason}.',
        triggerReason: reason,
        sessionContext: payload.sessionContext,
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: JSON.stringify(structuredPrompt) }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
          }),
          signal: AbortSignal.timeout(5000),
        },
      );

      if (!response.ok) return this.fallbackWrapUpPrompt(payload, reason);
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return this.fallbackWrapUpPrompt(payload, reason);
      return JSON.parse(rawText) as AiWrapUpPrompt;
    } catch (err) {
      this.logger.error('Wrap-up prompt generation failed; using fallback.', err);
      return this.fallbackWrapUpPrompt(payload, reason);
    }
  }

  private fallbackWrapUpPrompt(
    payload: SessionAiReasoningPayload,
    reason: 'LOW_TIME' | 'LOW_BUDGET' | 'NO_CANDIDATES',
  ): AiWrapUpPrompt {
    const timeLeft = payload.sessionContext?.remainingTimeMinutes ?? 0;
    const messages: Record<string, string> = {
      LOW_TIME: `You have about ${timeLeft} minutes left — want one final nearby stop, or shall we wrap up your itinerary?`,
      LOW_BUDGET: `Your budget is nearly spent. Want to squeeze in one more affordable stop nearby?`,
      NO_CANDIDATES: `Looks like we've explored everything nearby within your criteria. Ready to wrap up?`,
    };
    return { message: messages[reason], triggerReason: reason };
  }

  /**
   * Generates a weather-adapt prompt when adverse conditions are detected.
   * Called only when the weather service flags adverse conditions AND there
   * are candidates that were deprioritised as a result.
   */
  async generateWeatherAdaptPrompt(
    weatherDescription: string,
    affectedCandidateIds: string[],
  ): Promise<AiWeatherAdaptPrompt> {
    if (!this.isEnabled || !this.apiKey) {
      return this.fallbackWeatherAdaptPrompt(weatherDescription, affectedCandidateIds);
    }

    try {
      const structuredPrompt = {
        role: 'system',
        instruction:
          'You are a helpful travel assistant. Generate a single friendly 1-sentence message informing the user that adverse weather has been detected and their outdoor options have been adjusted. Return JSON: {message, affectedCandidateIds}.',
        weatherDescription,
        affectedCandidateCount: affectedCandidateIds.length,
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: JSON.stringify(structuredPrompt) }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
          }),
          signal: AbortSignal.timeout(5000),
        },
      );

      if (!response.ok) return this.fallbackWeatherAdaptPrompt(weatherDescription, affectedCandidateIds);
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return this.fallbackWeatherAdaptPrompt(weatherDescription, affectedCandidateIds);
      const parsed = JSON.parse(rawText);
      return { ...parsed, affectedCandidateIds };
    } catch (err) {
      this.logger.error('Weather adapt prompt failed; using fallback.', err);
      return this.fallbackWeatherAdaptPrompt(weatherDescription, affectedCandidateIds);
    }
  }

  private fallbackWeatherAdaptPrompt(
    weatherDescription: string,
    affectedCandidateIds: string[],
  ): AiWeatherAdaptPrompt {
    return {
      message: `${weatherDescription} detected nearby. We've adjusted your recommendations to prioritise indoor options.`,
      affectedCandidateIds,
    };
  }
}
