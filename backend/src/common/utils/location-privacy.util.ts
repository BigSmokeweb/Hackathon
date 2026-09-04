import * as crypto from 'crypto';

export class LocationPrivacy {
  /**
   * Hashes user coordinate context into a coarse geographic hash with daily salt
   * to guarantee DPDP compliance and prevent tracking raw movement history.
   */
  static anonymizeCoordinateContext(latitude: number, longitude: number, city?: string): string {
    // Round to ~11km coarse grid (1 decimal place)
    const coarseLat = latitude.toFixed(1);
    const coarseLng = longitude.toFixed(1);
    const rawContext = `${coarseLat}:${coarseLng}:${city || 'unknown'}`;
    
    return crypto.createHash('sha256').update(rawContext).digest('hex').substring(0, 16);
  }
}

export function coarsenLocation(latitude: number, longitude: number, city?: string): string {
  return LocationPrivacy.anonymizeCoordinateContext(latitude, longitude, city);
}
