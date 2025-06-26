import { Module } from '@nestjs/common';
import { PromptMarketplaceController } from './prompt-marketplace.controller';
import { PromptMarketplaceService } from './prompt-marketplace.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CreditsModule } from '../../credits/credits.module';
import { SubscriptionsModule } from '../../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, CreditsModule, SubscriptionsModule],
  controllers: [PromptMarketplaceController],
  providers: [PromptMarketplaceService],
  exports: [PromptMarketplaceService],
})
export class PromptMarketplaceModule {}
