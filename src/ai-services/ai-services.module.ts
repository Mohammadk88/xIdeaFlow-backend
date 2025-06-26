import { Module } from '@nestjs/common';
import { PostGeneratorModule } from './post-generator/post-generator.module';
import { EmailGeneratorModule } from './email-generator/email-generator.module';
import { HookGeneratorModule } from './hook-generator/hook-generator.module';
import { PromptMarketplaceModule } from './prompt-marketplace/prompt-marketplace.module';
import { ContentSchedulerModule } from './content-scheduler/content-scheduler.module';
import { PromptTemplateGeneratorModule } from './prompt-template-generator/prompt-template-generator.module';
import { AdCopyGeneratorModule } from './ad-copy-generator/ad-copy-generator.module';
import { HeadlineGeneratorModule } from './headline-generator/headline-generator.module';
import { VoiceScriptWriterModule } from './voice-script-writer/voice-script-writer.module';

@Module({
  imports: [
    PostGeneratorModule,
    EmailGeneratorModule,
    HookGeneratorModule,
    PromptMarketplaceModule,
    ContentSchedulerModule,
    PromptTemplateGeneratorModule,
    AdCopyGeneratorModule,
    HeadlineGeneratorModule,
    VoiceScriptWriterModule,
  ],
  exports: [
    PostGeneratorModule,
    EmailGeneratorModule,
    HookGeneratorModule,
    PromptMarketplaceModule,
    ContentSchedulerModule,
    PromptTemplateGeneratorModule,
    AdCopyGeneratorModule,
    HeadlineGeneratorModule,
    VoiceScriptWriterModule,
  ],
})
export class AiServicesModule {}
