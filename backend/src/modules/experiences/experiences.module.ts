import { Module } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { ExperiencesController } from './experiences.controller';
import { MatchPreviewService } from './match-preview.service';

@Module({
  controllers: [ExperiencesController],
  providers: [ExperiencesService, MatchPreviewService],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
