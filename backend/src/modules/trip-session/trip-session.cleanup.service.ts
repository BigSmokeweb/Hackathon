import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Privacy retention cron for TripSession (addendum Section 7).
 *
 * Abandoned/inactive sessions older than SESSION_ABANDON_HOURS (default 6h)
 * have their precise GPS data purged:
 *   - start_location  → NULL
 *   - current_location → NULL
 *
 * Category/pattern data (selected_categories, rejected_categories) is RETAINED
 * for analytics as permitted by the anonymized data retention policy in system-design.md.
 *
 * This cron runs hourly. It is idempotent — running it multiple times on the
 * same session is safe (NULL update on already-NULL columns is a no-op).
 */
@Injectable()
export class TripSessionCleanupService {
  private readonly logger = new Logger(TripSessionCleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async purgeStaleSessionLocations(): Promise<void> {
    const abandonHours = Number(
      this.configService.get<string>('SESSION_ABANDON_HOURS', '6'),
    );
    const cutoffAt = new Date(Date.now() - abandonHours * 60 * 60 * 1000);

    try {
      const result = await this.prisma.$queryRawUnsafe<{ count: string }[]>(
        `
        UPDATE trip_sessions SET
          -- Nullify precise GPS. Retains category/pattern data for analytics.
          start_location   = NULL,
          current_location = NULL,
          updated_at       = NOW()
        WHERE
          status IN ('ABANDONED', 'ACTIVE')
          AND last_activity_at < $1
          AND (start_location IS NOT NULL OR current_location IS NOT NULL)
        `,
        cutoffAt,
      );

      this.logger.log(
        `[TripSessionCleanup] Purged GPS data from stale sessions older than ${abandonHours}h (cutoff: ${cutoffAt.toISOString()}).`,
      );
    } catch (err) {
      // Log but do not rethrow — cleanup failures must not crash the service
      this.logger.error('[TripSessionCleanup] Error during GPS purge run.', err);
    }
  }
}
