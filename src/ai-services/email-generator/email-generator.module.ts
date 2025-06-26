import { Module } from '@nestjs/common';
import { EmailGeneratorController } from './email-generator.controller';
import { EmailGeneratorService } from './email-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CreditsModule } from '../../credits/credits.module';
import { SubscriptionsModule } from '../../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, CreditsModule, SubscriptionsModule],
  controllers: [EmailGeneratorController],
  providers: [EmailGeneratorService],
  exports: [EmailGeneratorService],
})
export class EmailGeneratorModule {}
