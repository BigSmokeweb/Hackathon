import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WeatherCondition {
  isAdverse: boolean;
  description: string;
  weatherCode: number;
}

/**
 * Lightweight weather signal for session-based recommendations.
 *
 * Uses Open-Meteo (https://open-meteo.com/) by default — free-tier, no API key required.
 * Set WEATHER_API_KEY in .env to use a different provider.
 *
 * Called at most ONCE per recommend request (addendum Section 6).
 * Never polled continuously — this is intentional to avoid cost and rate-limit issues.
 */
@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Fetch current weather conditions for a GPS location.
   * Returns a safe fallback (non-adverse) if the call fails — weather failures
   * must never block a recommendation response.
   */
  async getCurrentConditions(lat: number, lng: number): Promise<WeatherCondition> {
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lng}` +
        `&current_weather=true&timezone=auto`;

      const response = await fetch(url, {
        signal: AbortSignal.timeout(3000), // 3s timeout — non-blocking
      });

      if (!response.ok) {
        this.logger.warn(`Open-Meteo returned ${response.status}. Assuming non-adverse weather.`);
        return this.safeFallback();
      }

      const data = await response.json();
      const weatherCode: number = data.current_weather?.weathercode ?? 0;
      const isAdverse = this.isAdverseByCode(weatherCode);

      return {
        isAdverse,
        weatherCode,
        description: this.describeCode(weatherCode),
      };
    } catch (err) {
      this.logger.error('Weather API call failed. Defaulting to non-adverse.', err);
      return this.safeFallback();
    }
  }

  /**
   * WMO weather code interpretation.
   * Adverse = heavy rain, thunderstorm, snow, heavy drizzle.
   * Codes reference: https://open-meteo.com/en/docs (current_weather_code)
   */
  isAdverse(condition: WeatherCondition): boolean {
    return condition.isAdverse;
  }

  private isAdverseByCode(code: number): boolean {
    // WMO codes: 51-67 drizzle/rain, 71-77 snow, 80-82 rain showers,
    // 85-86 snow showers, 95-99 thunderstorm
    return (
      (code >= 51 && code <= 67) ||
      (code >= 71 && code <= 77) ||
      (code >= 80 && code <= 86) ||
      (code >= 95 && code <= 99)
    );
  }

  private describeCode(code: number): string {
    if (code === 0) return 'Clear sky';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 49) return 'Foggy or hazy';
    if (code <= 67) return 'Rain or drizzle';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Rain showers';
    if (code <= 86) return 'Snow showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Unknown';
  }

  private safeFallback(): WeatherCondition {
    return { isAdverse: false, description: 'Weather unavailable', weatherCode: 0 };
  }
}
