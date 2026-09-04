import {
  Controller,
  Post,
  Body,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RecommendationEngineService } from './recommendation-engine.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt.guard';
import {
  RecommendationRequestSchema,
  RecommendationRequestDto,
} from '@experience-platform/shared';

@Controller('recommendations')
export class RecommendationEngineController {
  constructor(
    private readonly recommendationService: RecommendationEngineService,
  ) {}

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @UsePipes(new ZodValidationPipe(RecommendationRequestSchema))
  async getRecommendations(
    @Body() dto: RecommendationRequestDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.recommendationService.getRecommendations(dto, userId);
  }
}
