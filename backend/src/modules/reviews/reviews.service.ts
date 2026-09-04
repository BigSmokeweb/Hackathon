import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ContentSanitizer } from '../../common/utils/sanitizer.util';
import {
  CreateReviewDto,
  LogInteractionDto,
  EventType,
} from '@experience-platform/shared';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log User Interaction (Append-only event log)
   */
  async logInteraction(userId: string, dto: LogInteractionDto) {
    return this.prisma.interaction.create({
      data: {
        userId,
        experienceId: dto.experienceId,
        eventType: dto.eventType,
        metadata: dto.metadata as any,
      },
    });
  }

  /**
   * Create Review (Strictly gated by completed interaction verification + UGC sanitization)
   */
  async createReview(userId: string, dto: CreateReviewDto) {
    // 1. Verify that user has a completed interaction for this experience
    const completedInteraction = await this.prisma.interaction.findFirst({
      where: {
        userId,
        experienceId: dto.experienceId,
        eventType: EventType.COMPLETE,
      },
      include: {
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!completedInteraction) {
      throw new ForbiddenException(
        'Review eligibility violation: You can only review experiences you have completed.',
      );
    }

    if (completedInteraction.review) {
      throw new BadRequestException(
        'Duplicate review violation: A review has already been submitted for this completed visit.',
      );
    }

    // 2. Strict UGC Sanitization on Write
    const sanitizedText = ContentSanitizer.sanitize(dto.text);

    // 3. Create review & update experience rolling average ratings in transaction
    const review = await this.prisma.$transaction(async (tx) => {
      const createdReview = await tx.review.create({
        data: {
          experienceId: dto.experienceId,
          userId,
          interactionId: completedInteraction.id,
          ratingOverall: dto.ratingOverall,
          ratingAuthenticity: dto.ratingAuthenticity,
          ratingValue: dto.ratingValue,
          ratingExperience: dto.ratingExperience,
          ratingAccessibility: dto.ratingAccessibility,
          text: sanitizedText,
          isModerated: true,
        },
      });

      // Recalculate average rating for experience
      const agg = await tx.review.aggregate({
        where: { experienceId: dto.experienceId, isModerated: true },
        _avg: {
          ratingOverall: true,
          ratingAuthenticity: true,
        },
        _count: {
          id: true,
        },
      });

      await tx.experience.update({
        where: { id: dto.experienceId },
        data: {
          ratingAverage: Math.round((agg._avg.ratingOverall || dto.ratingOverall) * 10) / 10,
          authenticityRating: Math.round(((agg._avg.ratingAuthenticity || dto.ratingAuthenticity) / 5.0) * 100) / 100,
          reviewCount: agg._count.id,
        },
      });

      return createdReview;
    });

    return review;
  }
}
