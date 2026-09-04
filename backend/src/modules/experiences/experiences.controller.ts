import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ExperiencesService } from './experiences.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  Role,
  CreateExperienceSchema,
  CreateExperienceDto,
  UpdateExperienceSchema,
  UpdateExperienceDto,
  SearchExperiencesQuerySchema,
  SearchExperiencesQueryDto,
} from '@experience-platform/shared';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 req/min search endpoint rate limit
  @Get('search')
  @UsePipes(new ZodValidationPipe(SearchExperiencesQuerySchema))
  async search(@Query() query: SearchExperiencesQueryDto) {
    return this.experiencesService.searchExperiences(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.experiencesService.getExperienceById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROVIDER, Role.ADMIN)
  @UsePipes(new ZodValidationPipe(CreateExperienceSchema))
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateExperienceDto,
  ) {
    return this.experiencesService.createExperience(userId, dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROVIDER, Role.ADMIN)
  @UsePipes(new ZodValidationPipe(UpdateExperienceSchema))
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.experiencesService.updateExperience(userId, id, dto);
  }
}
