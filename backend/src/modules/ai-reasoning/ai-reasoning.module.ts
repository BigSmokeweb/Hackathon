import { Module } from '@nestjs/common';
import { AiReasoningService } from './ai-reasoning.service';

@Module({
  providers: [AiReasoningService],
  exports: [AiReasoningService],
})
export class AiReasoningModule {}
