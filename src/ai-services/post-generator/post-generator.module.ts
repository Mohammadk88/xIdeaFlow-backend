import { Module } from '@nestjs/common';
import { PostGeneratorController } from './post-generator.controller';
import { PostGeneratorService } from './post-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CreditsModule } from '../../credits/credits.module';
import { SubscriptionsModule } from '../../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, CreditsModule, SubscriptionsModule],
  controllers: [PostGeneratorController],
  providers: [PostGeneratorService],
  exports: [PostGeneratorService],
})
export class PostGeneratorModule {}
