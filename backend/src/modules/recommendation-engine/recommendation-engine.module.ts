import { Module } from '@nestjs/common';
import { RecommendationEngineService } from './recommendation-engine.service';
import { RecommendationEngineController } from './recommendation-engine.controller';
import { ExperiencesModule } from '../experiences/experiences.module';

@Module({
  imports: [ExperiencesModule],
  controllers: [RecommendationEngineController],
  providers: [RecommendationEngineService],
  exports: [RecommendationEngineService],
})
export class RecommendationEngineModule {}
