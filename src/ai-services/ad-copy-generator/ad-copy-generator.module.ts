import { Module } from '@nestjs/common';
import { AdCopyGeneratorController } from './ad-copy-generator.controller';
import { AdCopyGeneratorService } from './ad-copy-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CreditsModule } from '../../credits/credits.module';
import { SubscriptionsModule } from '../../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, CreditsModule, SubscriptionsModule],
  controllers: [AdCopyGeneratorController],
  providers: [AdCopyGeneratorService],
  exports: [AdCopyGeneratorService],
})
export class AdCopyGeneratorModule {}
