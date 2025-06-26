import { Module } from '@nestjs/common';
import { PromptTemplateGeneratorController } from './prompt-template-generator.controller';
import { PromptTemplateGeneratorService } from './prompt-template-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CreditsModule } from '../../credits/credits.module';
import { SubscriptionsModule } from '../../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, CreditsModule, SubscriptionsModule],
  controllers: [PromptTemplateGeneratorController],
  providers: [PromptTemplateGeneratorService],
  exports: [PromptTemplateGeneratorService],
})
export class PromptTemplateGeneratorModule {}
