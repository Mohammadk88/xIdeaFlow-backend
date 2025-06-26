import { Module } from '@nestjs/common';
import { VoiceScriptWriterController } from './voice-script-writer.controller';
import { VoiceScriptWriterService } from './voice-script-writer.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CreditsModule } from '../../credits/credits.module';
import { SubscriptionsModule } from '../../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, CreditsModule, SubscriptionsModule],
  controllers: [VoiceScriptWriterController],
  providers: [VoiceScriptWriterService],
  exports: [VoiceScriptWriterService],
})
export class VoiceScriptWriterModule {}
