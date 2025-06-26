import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../../credits/credits.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { CreditActionType } from '@prisma/client';
import {
  GeneratePostDto,
  PostResponseDto,
  SocialPlatform,
} from './dto/post-generator.dto';

@Injectable()
export class PostGeneratorService {
  private readonly serviceName = 'post_generator_ai';
  private readonly creditCost = 3;

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async generatePost(
    userId: string,
    generatePostDto: GeneratePostDto,
  ): Promise<PostResponseDto> {
    // Get service from database
    const service = await this.prisma.service.findUnique({
      where: { name: this.serviceName },
    });

    if (!service) {
      throw new ForbiddenException('Service not found');
    }

    // Check subscription access
    const accessCheck = await this.subscriptionsService.checkServiceAccess(
      userId,
      service.id,
    );
    if (!accessCheck.hasAccess) {
      throw new ForbiddenException(
        'This service is not available in your current subscription plan',
      );
    }

    // Check and deduct credits
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
      CreditActionType.GENERATE_POST,
      this.creditCost,
      { topic: generatePostDto.topic, platform: generatePostDto.platform },
    );

    // Track usage
    await this.subscriptionsService.incrementUsage(
      userId,
      service.id,
      accessCheck.usagePeriod || 'MONTHLY',
    );

    // Generate post content (mock AI generation)
    const generatedPost = this.generatePostContent(generatePostDto);

    return generatedPost;
  }

  private generatePostContent(
    generatePostDto: GeneratePostDto,
  ): PostResponseDto {
    const {
      topic,
      tone,
      platform,
      targetAudience,
      hashtags,
      additionalContext,
    } = generatePostDto;

    // Mock AI-generated content based on inputs
    const platformLimits = this.getPlatformLimits(platform);

    const content = this.createPostContent(
      topic,
      tone,
      platform,
      targetAudience,
      additionalContext,
      platformLimits.maxLength,
    );

    const suggestedHashtags =
      hashtags || this.generateHashtags(topic, platform);

    return {
      content,
      hashtags: suggestedHashtags,
      characterCount: content.length,
      platformRecommendations: this.getPlatformRecommendations(
        platform,
        content.length,
      ),
    };
  }

  private createPostContent(
    topic: string,
    tone: string,
    platform: SocialPlatform,
    targetAudience?: string,
    additionalContext?: string,
    maxLength?: number,
  ): string {
    let content = '';

    // Mock content generation based on tone and platform
    switch (tone) {
      case 'professional':
        content = `Exploring the impact of ${topic} in today's landscape. This emerging trend is reshaping how we approach innovation and efficiency.`;
        break;
      case 'casual':
        content = `Just discovered something cool about ${topic}! 🚀 The possibilities are endless and I'm excited to see where this goes.`;
        break;
      case 'friendly':
        content = `Hey everyone! 👋 Want to share some thoughts on ${topic}. It's amazing how this is changing the game for so many industries.`;
        break;
      case 'authoritative':
        content = `${topic} represents a significant paradigm shift. Industry leaders must adapt to leverage these innovations effectively.`;
        break;
      case 'humorous':
        content = `${topic} is like that friend who always has the best ideas 😄 Revolutionary, game-changing, and slightly intimidating!`;
        break;
      case 'inspirational':
        content = `✨ ${topic} reminds us that innovation knows no bounds. Every challenge is an opportunity to create something extraordinary.`;
        break;
      default:
        content = `Sharing insights about ${topic} and its potential impact on our industry.`;
    }

    if (targetAudience) {
      content += ` Perfect for ${targetAudience} looking to stay ahead of the curve.`;
    }

    if (additionalContext) {
      content += ` ${additionalContext}`;
    }

    // Add platform-specific call-to-action
    switch (platform) {
      case SocialPlatform.LINKEDIN:
        content +=
          ' What are your thoughts? Share your experience in the comments!';
        break;
      case SocialPlatform.TWITTER:
        content += ' What do you think? 🤔';
        break;
      case SocialPlatform.INSTAGRAM:
        content += ' Double tap if you agree! ❤️';
        break;
      case SocialPlatform.FACEBOOK:
        content += ' Let me know your thoughts in the comments below!';
        break;
      case SocialPlatform.TIKTOK:
        content += ' Drop a 🔥 if you found this helpful!';
        break;
    }

    // Trim if exceeds platform limits
    if (maxLength && content.length > maxLength) {
      content = content.substring(0, maxLength - 3) + '...';
    }

    return content;
  }

  private generateHashtags(topic: string, platform: SocialPlatform): string[] {
    const baseHashtags = ['#innovation', '#technology', '#business'];
    const topicWords = topic.split(' ').filter((word) => word.length > 3);
    const topicHashtags = topicWords.map((word) => `#${word.toLowerCase()}`);

    let platformHashtags: string[] = [];
    switch (platform) {
      case SocialPlatform.LINKEDIN:
        platformHashtags = ['#professional', '#leadership', '#growth'];
        break;
      case SocialPlatform.TWITTER:
        platformHashtags = ['#tech', '#trending', '#discussion'];
        break;
      case SocialPlatform.INSTAGRAM:
        platformHashtags = ['#inspiration', '#motivation', '#lifestyle'];
        break;
      case SocialPlatform.FACEBOOK:
        platformHashtags = ['#community', '#sharing', '#insights'];
        break;
      case SocialPlatform.TIKTOK:
        platformHashtags = ['#viral', '#trending', '#fyp'];
        break;
    }

    return [...topicHashtags, ...baseHashtags, ...platformHashtags].slice(0, 8);
  }

  private getPlatformLimits(platform: SocialPlatform) {
    switch (platform) {
      case SocialPlatform.TWITTER:
        return { maxLength: 280 };
      case SocialPlatform.FACEBOOK:
        return { maxLength: 63206 };
      case SocialPlatform.INSTAGRAM:
        return { maxLength: 2200 };
      case SocialPlatform.LINKEDIN:
        return { maxLength: 3000 };
      case SocialPlatform.TIKTOK:
        return { maxLength: 300 };
      default:
        return { maxLength: 280 };
    }
  }

  private getPlatformRecommendations(
    platform: SocialPlatform,
    contentLength: number,
  ): string {
    const limits = this.getPlatformLimits(platform);
    const percentage = (contentLength / limits.maxLength) * 100;

    if (percentage > 90) {
      return `Near ${platform} character limit. Consider shortening for better engagement.`;
    } else if (percentage > 70) {
      return `Good length for ${platform}. Optimal for engagement.`;
    } else if (percentage > 40) {
      return `Perfect length for ${platform}. Great for readability.`;
    } else {
      return `Short and concise for ${platform}. Consider adding more detail.`;
    }
  }
}
