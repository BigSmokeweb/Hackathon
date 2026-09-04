import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ContentSanitizer } from '../../common/utils/sanitizer.util';
import {
  CreateExperienceDto,
  UpdateExperienceDto,
  SearchExperiencesQueryDto,
  PaginatedResult,
  Category,
  BudgetBand,
} from '@experience-platform/shared';

@Injectable()
export class ExperiencesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create Experience (Sanitizes descriptions on write, sets PostGIS Point)
   */
  async createExperience(userId: string, dto: CreateExperienceDto) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (!provider) {
      throw new ForbiddenException('Only registered providers can create experiences');
    }

    const sanitizedDescription = ContentSanitizer.sanitize(dto.description);
    const sanitizedTitle = ContentSanitizer.stripAll(dto.title);

    // Using parameterized query for PostGIS geography Point creation
    const experience = await this.prisma.$queryRawUnsafe<any[]>(
      `
      INSERT INTO "experiences" (
        "id", "provider_id", "title", "description", "category",
        "location", "latitude", "longitude", "address", "city", "state", "country",
        "price_min", "price_max", "currency", "budget_band", "accessibility_tags",
        "media_urls", "availability_rules", "duration_minutes", "updated_at"
      ) VALUES (
        gen_random_uuid(), $1::uuid, $2, $3, $4::"Category",
        ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, $6, $5, $7, $8, $9, $10,
        $11, $12, $13, $14::"BudgetBand", $15::text[],
        $16::text[], $17::jsonb, $18, NOW()
      )
      RETURNING *;
      `,
      provider.id,
      sanitizedTitle,
      sanitizedDescription,
      dto.category,
      dto.location.longitude,
      dto.location.latitude,
      dto.address,
      dto.city,
      dto.state,
      dto.country,
      dto.priceMin,
      dto.priceMax,
      dto.currency,
      dto.budgetBand,
      dto.accessibilityTags,
      dto.mediaUrls,
      JSON.stringify(dto.availabilityRules),
      dto.durationMinutes,
    );

    return experience[0];
  }

  /**
   * Update Experience with IDOR check
   */
  async updateExperience(userId: string, experienceId: string, dto: UpdateExperienceDto) {
    const provider = await this.prisma.providerProfile.findUnique({ where: { userId } });
    if (!provider) throw new ForbiddenException();

    const existing = await this.prisma.experience.findUnique({ where: { id: experienceId } });
    if (!existing) throw new NotFoundException('Experience not found');
    if (existing.providerId !== provider.id) {
      throw new ForbiddenException('IDOR Violation: You do not own this experience');
    }

    return this.prisma.experience.update({
      where: { id: experienceId },
      data: {
        title: dto.title ? ContentSanitizer.stripAll(dto.title) : undefined,
        description: dto.description ? ContentSanitizer.sanitize(dto.description) : undefined,
        category: dto.category,
        priceMin: dto.priceMin,
        priceMax: dto.priceMax,
        budgetBand: dto.budgetBand,
        accessibilityTags: dto.accessibilityTags,
        mediaUrls: dto.mediaUrls,
        availabilityRules: dto.availabilityRules as any,
        durationMinutes: dto.durationMinutes,
      },
    });
  }

  /**
   * PostGIS Geo-Radius Search with Enforced Pagination
   * Exclusively lives in this service and is consumed by Recommendation Engine.
   */
  async findWithinRadius(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    categories?: Category[];
    budgetBand?: BudgetBand;
    minRating?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const radiusMeters = (params.radiusKm || 25) * 1000;
    const limit = Math.min(params.limit || 20, 50); // Enforce max 50 items
    const offset = params.offset || 0;

    // Build dynamic parameterized query — all values flow through $N placeholders (no interpolation)
    const queryArgs: any[] = [
      params.longitude,   // $1
      params.latitude,    // $2
      radiusMeters,       // $3
    ];

    // $4 — optional categories array
    const hasCats = params.categories && params.categories.length > 0;
    let catClause = '';
    if (hasCats) {
      queryArgs.push(params.categories);
      catClause = `AND e.category = ANY($4::"Category"[])`;
    }

    // $5 / $6 / $7 — optional budget band and min rating (parameterized, never interpolated)
    let budgetClause = '';
    if (params.budgetBand) {
      queryArgs.push(params.budgetBand);
      budgetClause = `AND e.budget_band = $${queryArgs.length}::"BudgetBand"`;
    }

    let ratingClause = '';
    if (params.minRating) {
      queryArgs.push(params.minRating);
      ratingClause = `AND e.rating_average >= $${queryArgs.length}`;
    }

    // $N-1, $N — limit and offset (always last)
    queryArgs.push(limit);
    const limitIdx = queryArgs.length;
    queryArgs.push(offset);
    const offsetIdx = queryArgs.length;

    const results = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT
        e.id, e.title, e.description, e.category, e.city, e.state, e.address,
        e.price_min AS "priceMin", e.price_max AS "priceMax", e.currency,
        e.budget_band AS "budgetBand", e.accessibility_tags AS "accessibilityTags",
        e.media_urls AS "mediaUrls", e.availability_rules AS "availabilityRules",
        e.duration_minutes AS "durationMinutes", e.quality_score AS "qualityScore",
        e.rating_average AS "ratingAverage", e.review_count AS "reviewCount",
        e.authenticity_rating AS "authenticityRating",
        p.business_name AS "providerBusinessName", p.verification_status AS "verificationStatus",
        ROUND((ST_Distance(e.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000)::numeric, 2) AS "distanceKm"
      FROM "experiences" e
      JOIN "provider_profiles" p ON e.provider_id = p.id
      WHERE e.is_active = true
        AND ST_DWithin(e.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
        ${catClause}
        ${budgetClause}
        ${ratingClause}
      ORDER BY "distanceKm" ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
      `,
      ...queryArgs,
    );

    return results;
  }

  /**
   * Search / Discovery endpoint with enforced pagination (Max 50 items)
   */
  async searchExperiences(query: SearchExperiencesQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50); // Pagination limit cap
    const offset = (page - 1) * limit;

    if (query.latitude !== undefined && query.longitude !== undefined) {
      const items = await this.findWithinRadius({
        latitude: query.latitude,
        longitude: query.longitude,
        radiusKm: query.radiusKm || 25,
        categories: query.category ? [query.category] : undefined,
        budgetBand: query.budgetBand,
        minRating: query.minRating,
        limit,
        offset,
      });

      return {
        data: items,
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit) || 1,
      };
    }

    // Fallback: Standard City/Category filtered search
    const whereClause: any = {
      isActive: true,
      ...(query.city && { city: { equals: query.city, mode: 'insensitive' } }),
      ...(query.category && { category: query.category }),
      ...(query.budgetBand && { budgetBand: query.budgetBand }),
      ...(query.minRating && { ratingAverage: { gte: query.minRating } }),
    };

    const [total, data] = await Promise.all([
      this.prisma.experience.count({ where: whereClause }),
      this.prisma.experience.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { ratingAverage: 'desc' },
        include: {
          provider: {
            select: {
              businessName: true,
              verificationStatus: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single experience by ID with reviews
   */
  async getExperienceById(id: string) {
    const experience = await this.prisma.experience.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            city: true,
            verificationStatus: true,
          },
        },
        reviews: {
          where: { isModerated: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    return experience;
  }
}
