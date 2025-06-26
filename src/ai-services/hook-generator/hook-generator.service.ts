import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../../credits/credits.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { CreditActionType } from '@prisma/client';
import {
  GenerateHookDto,
  HookResponseDto,
  HookType,
  ContentPlatform,
} from './dto/hook-generator.dto';

@Injectable()
export class HookGeneratorService {
  private readonly serviceName = 'hook_generator_ai';
  private readonly creditCost = 2;

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async generateHook(
    userId: string,
    generateHookDto: GenerateHookDto,
  ): Promise<HookResponseDto> {
    const service = await this.prisma.service.findUnique({
      where: { name: this.serviceName },
    });

    if (!service) {
      throw new ForbiddenException('Service not found');
    }

    const accessCheck = await this.subscriptionsService.checkServiceAccess(
      userId,
      service.id,
    );
    if (!accessCheck.hasAccess) {
      throw new ForbiddenException(
        'This service is not available in your current subscription plan',
      );
    }

    const creditCheck = await this.creditsService.checkCreditAvailability(
      userId,
      this.creditCost,
    );
    if (!creditCheck.hasEnoughCredits) {
      throw new ForbiddenException('Insufficient credits');
    }

    await this.creditsService.deductCredits(
      userId,
      service.id,
      CreditActionType.GENERATE_HOOK,
      this.creditCost,
      { topic: generateHookDto.topic, hookType: generateHookDto.hookType },
    );

    await this.subscriptionsService.incrementUsage(
      userId,
      service.id,
      accessCheck.usagePeriod || 'MONTHLY',
    );

    return this.generateHookContent(generateHookDto);
  }

  private generateHookContent(
    generateHookDto: GenerateHookDto,
  ): HookResponseDto {
    const { topic, hookType, platform, targetAudience, context } =
      generateHookDto;

    const hook = this.createHook(topic, hookType, platform, context);
    const alternatives = this.generateAlternatives(topic, hookType, platform);
    const usageTips = this.getUsageTips(hookType, platform);
    const category = this.getHookCategory(hookType);

    return {
      hook,
      category,
      alternatives,
      usageTips,
      characterCount: hook.length,
    };
  }

  private createHook(
    topic: string,
    hookType: HookType,
    platform: ContentPlatform,
    context?: string,
  ): string {
    let hook = '';

    switch (hookType) {
      case HookType.QUESTION:
        hook = `Did you know that ${topic} can transform your business?`;
        if (context) {
          hook = `What if ${topic} could ${context.toLowerCase()}?`;
        }
        break;

      case HookType.STATISTIC:
        hook = `95% of businesses see improved results with ${topic}.`;
        break;

      case HookType.STORY:
        hook = `Last year, I discovered the power of ${topic}...`;
        break;

      case HookType.QUOTE:
        hook = `"The future belongs to those who understand ${topic}" - Industry Expert`;
        break;

      case HookType.BOLD_STATEMENT:
        hook = `${topic} is completely changing the game.`;
        break;

      case HookType.PROBLEM_SOLUTION:
        hook = `Struggling with efficiency? ${topic} is your answer.`;
        break;

      default:
        hook = `Discover the power of ${topic}.`;
    }

    // Optimize for platform
    if (platform === ContentPlatform.SOCIAL_MEDIA && hook.length > 100) {
      hook = hook.substring(0, 97) + '...';
    }

    return hook;
  }

  private generateAlternatives(
    topic: string,
    hookType: HookType,
    platform: ContentPlatform,
  ): string[] {
    const alternatives: string[] = [];

    switch (hookType) {
      case HookType.QUESTION:
        alternatives.push(
          `Have you considered how ${topic} impacts your industry?`,
          `What's the real secret behind ${topic}?`,
          `Why is everyone talking about ${topic}?`,
        );
        break;

      case HookType.STATISTIC:
        alternatives.push(
          `Studies show ${topic} increases productivity by 40%.`,
          `9 out of 10 experts recommend focusing on ${topic}.`,
          `The latest research reveals ${topic} drives 60% more engagement.`,
        );
        break;

      case HookType.BOLD_STATEMENT:
        alternatives.push(
          `${topic} is the future, and the future is now.`,
          `Everything you know about ${topic} is about to change.`,
          `${topic} isn't just a trend—it's a revolution.`,
        );
        break;

      default:
        alternatives.push(
          `The ultimate guide to ${topic}.`,
          `Master ${topic} in 5 simple steps.`,
          `Why ${topic} matters more than you think.`,
        );
    }

    return alternatives;
  }

  private getUsageTips(
    hookType: HookType,
    platform: ContentPlatform,
  ): string[] {
    const tips = ['Keep it concise and impactful', 'Test different variations'];

    switch (hookType) {
      case HookType.QUESTION:
        tips.push(
          'Follow with compelling answers',
          'Use to start conversations',
        );
        break;
      case HookType.STATISTIC:
        tips.push('Cite credible sources', 'Use eye-catching numbers');
        break;
      case HookType.STORY:
        tips.push('Keep it relatable', 'Include emotional elements');
        break;
    }

    if (platform === ContentPlatform.SOCIAL_MEDIA) {
      tips.push('Include relevant emojis', 'Use hashtags strategically');
    }

    return tips;
  }

  private getHookCategory(hookType: HookType): string {
    const categoryMap = {
      [HookType.QUESTION]: 'Question-based hook',
      [HookType.STATISTIC]: 'Data-driven hook',
      [HookType.STORY]: 'Narrative hook',
      [HookType.QUOTE]: 'Authority-based hook',
      [HookType.BOLD_STATEMENT]: 'Statement hook',
      [HookType.PROBLEM_SOLUTION]: 'Problem-solving hook',
    };

    return categoryMap[hookType] || 'General hook';
  }
}
