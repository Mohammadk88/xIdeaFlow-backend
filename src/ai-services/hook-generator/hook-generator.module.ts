import { Module } from '@nestjs/common';
import { HookGeneratorController } from './hook-generator.controller';
import { HookGeneratorService } from './hook-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CreditsModule } from '../../credits/credits.module';
import { SubscriptionsModule } from '../../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, CreditsModule, SubscriptionsModule],
  controllers: [HookGeneratorController],
  providers: [HookGeneratorService],
  exports: [HookGeneratorService],
})
export class HookGeneratorModule {}
