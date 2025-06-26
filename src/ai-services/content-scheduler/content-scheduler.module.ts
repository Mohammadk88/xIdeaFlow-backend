import { Module } from '@nestjs/common';
import { ContentSchedulerController } from './content-scheduler.controller';
import { ContentSchedulerService } from './content-scheduler.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubscriptionsModule } from '../../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, SubscriptionsModule],
  controllers: [ContentSchedulerController],
  providers: [ContentSchedulerService],
  exports: [ContentSchedulerService],
})
export class ContentSchedulerModule {}
