import { Module } from '@nestjs/common';
import { HeadlineGeneratorController } from './headline-generator.controller';
import { HeadlineGeneratorService } from './headline-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CreditsModule } from '../../credits/credits.module';
import { SubscriptionsModule } from '../../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, CreditsModule, SubscriptionsModule],
  controllers: [HeadlineGeneratorController],
  providers: [HeadlineGeneratorService],
  exports: [HeadlineGeneratorService],
})
export class HeadlineGeneratorModule {}
