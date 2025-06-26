import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../../credits/credits.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { CreditActionType } from '@prisma/client';
import {
  GenerateAdCopyDto,
  AdCopyResponseDto,
  AdCopyVariationDto,
  AdPlatform,
  AdObjective,
  AdTone,
} from './dto/ad-copy-generator.dto';

@Injectable()
export class AdCopyGeneratorService {
  private readonly serviceName = 'ai_ad_copy_generator';
  private readonly creditCost = 3;

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async generateAdCopy(
    userId: string,
    generateDto: GenerateAdCopyDto,
  ): Promise<AdCopyResponseDto> {
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
      throw new ForbiddenException(creditCheck.message);
    }

    // Generate mock ad copy variations
    const adCopyData = this.generateMockAdCopy(generateDto);

    // Deduct credits and track usage
    await this.creditsService.deductCredits(
      userId,
      service.id,
      CreditActionType.GENERATE_AD_COPY,
      this.creditCost,
      {
        product: generateDto.product,
        platform: generateDto.platform,
        objective: generateDto.objective,
        variationsGenerated: adCopyData.variations.length,
      },
    );

    // Track usage for subscription users
    if (accessCheck.hasAccess) {
      await this.subscriptionsService.incrementUsage(
        userId,
        service.id,
        accessCheck.usagePeriod!,
      );
    }

    return {
      ...adCopyData,
      creditsUsed: this.creditCost,
      success: true,
      message: 'Ad copy generated successfully',
    };
  }

  private generateMockAdCopy(dto: GenerateAdCopyDto): Omit<
    AdCopyResponseDto,
    'creditsUsed' | 'success' | 'message'
  > {
    const variations = this.generateVariations(dto);
    const recommendations = this.getPlatformRecommendations(dto.platform);
    const optimizationTips = this.getOptimizationTips(dto.platform, dto.objective);

    return {
      product: dto.product,
      platform: dto.platform,
      variations,
      recommendations,
      optimizationTips,
    };
  }

  private generateVariations(dto: GenerateAdCopyDto): AdCopyVariationDto[] {
    const variations: AdCopyVariationDto[] = [];
    const characterLimit = dto.characterLimit || this.getDefaultCharacterLimit(dto.platform);
    
    // Generate 3 different variations
    for (let i = 0; i < 3; i++) {
      const variation = this.createVariation(dto, i, characterLimit);
      variations.push(variation);
    }

    return variations;
  }

  private createVariation(dto: GenerateAdCopyDto, index: number, characterLimit: number): AdCopyVariationDto {
    const headlines = this.generateHeadlines(dto, index);
    const copies = this.generateCopies(dto, index, characterLimit);
    const cta = dto.callToAction || this.getDefaultCTA(dto.objective);

    const copy = copies[index % copies.length];
    
    return {
      headline: headlines[index % headlines.length],
      copy,
      callToAction: cta,
      characterCount: copy.length,
    };
  }

  private generateHeadlines(dto: GenerateAdCopyDto, index: number): string[] {
    const productName = dto.product;
    const benefit = dto.keyBenefits[0] || 'amazing results';
    
    const headlines = [
      `${productName} - ${benefit}`,
      `Transform Your Business with ${productName}`,
      `Get ${benefit} with ${productName}`,
      `${productName}: The Solution You've Been Looking For`,
      `Boost Your Success with ${productName}`,
    ];

    // Customize based on tone
    if (dto.tone === AdTone.URGENT) {
      headlines.push(`Don't Miss Out: ${productName} Limited Time`);
      headlines.push(`Act Now: ${benefit} Awaits`);
    } else if (dto.tone === AdTone.FRIENDLY) {
      headlines.push(`Meet ${productName} - Your New Best Friend`);
      headlines.push(`We'd Love to Help You ${benefit}`);
    }

    return headlines;
  }

  private generateCopies(dto: GenerateAdCopyDto, index: number, characterLimit: number): string[] {
    const baseTemplates = [
      `Discover how ${dto.product} helps ${dto.targetAudience} achieve ${dto.keyBenefits.join(', ')}. Join thousands of satisfied customers.`,
      `${dto.product} is designed for ${dto.targetAudience} who want ${dto.keyBenefits[0]}. Experience the difference today.`,
      `Ready to transform your business? ${dto.product} offers ${dto.keyBenefits.join(', ')} for ${dto.targetAudience}.`,
    ];

    // Add platform-specific optimizations
    const optimizedCopies = baseTemplates.map(template => {
      let copy = template;
      
      // Add keywords if provided
      if (dto.keywords && dto.keywords.length > 0) {
        copy += ` Perfect for ${dto.keywords.join(', ')}.`;
      }

      // Add urgency based on tone
      if (dto.tone === AdTone.URGENT) {
        copy += ' Limited time offer!';
      }

      // Ensure character limit
      if (copy.length > characterLimit) {
        copy = copy.substring(0, characterLimit - 3) + '...';
      }

      return copy;
    });

    return optimizedCopies;
  }

  private getDefaultCTA(objective: AdObjective): string {
    const ctaMap = {
      [AdObjective.BRAND_AWARENESS]: 'Learn More',
      [AdObjective.LEAD_GENERATION]: 'Get Your Free Quote',
      [AdObjective.SALES]: 'Buy Now',
      [AdObjective.TRAFFIC]: 'Visit Our Website',
      [AdObjective.ENGAGEMENT]: 'Join the Conversation',
      [AdObjective.APP_PROMOTION]: 'Download Now',
      [AdObjective.EVENT_PROMOTION]: 'Register Today',
    };

    return ctaMap[objective] || 'Learn More';
  }

  private getDefaultCharacterLimit(platform: AdPlatform): number {
    const limits = {
      [AdPlatform.GOOGLE_ADS]: 300,
      [AdPlatform.FACEBOOK_ADS]: 250,
      [AdPlatform.INSTAGRAM_ADS]: 125,
      [AdPlatform.LINKEDIN_ADS]: 300,
      [AdPlatform.TWITTER_ADS]: 280,
      [AdPlatform.YOUTUBE_ADS]: 200,
      [AdPlatform.TIKTOK_ADS]: 100,
    };

    return limits[platform] || 250;
  }

  private getPlatformRecommendations(platform: AdPlatform): string[] {
    const recommendations = {
      [AdPlatform.GOOGLE_ADS]: [
        'Use power words for higher CTR',
        'Include relevant keywords in headlines',
        'Add site link extensions for more real estate',
        'Use ad customizers for dynamic content',
      ],
      [AdPlatform.FACEBOOK_ADS]: [
        'Use eye-catching visuals with minimal text',
        'Target specific demographics and interests',
        'Include social proof elements',
        'Test video vs. image formats',
      ],
      [AdPlatform.INSTAGRAM_ADS]: [
        'Focus on high-quality visuals',
        'Use hashtags strategically',
        'Keep copy concise and engaging',
        'Leverage Stories format for urgency',
      ],
      [AdPlatform.LINKEDIN_ADS]: [
        'Professional tone and language',
        'Target by job title and company size',
        'Highlight business benefits',
        'Use sponsored content for thought leadership',
      ],
      [AdPlatform.TWITTER_ADS]: [
        'Keep it conversational and timely',
        'Use trending hashtags when relevant',
        'Engage with replies and mentions',
        'Consider promoted tweets for viral content',
      ],
      [AdPlatform.YOUTUBE_ADS]: [
        'Hook viewers in the first 5 seconds',
        'Include clear call-to-action overlays',
        'Use compelling thumbnails',
        'Optimize for mobile viewing',
      ],
      [AdPlatform.TIKTOK_ADS]: [
        'Keep it fun and authentic',
        'Use trending sounds and effects',
        'Partner with influencers',
        'Focus on entertainment value',
      ],
    };

    return recommendations[platform] || [];
  }

  private getOptimizationTips(platform: AdPlatform, objective: AdObjective): string[] {
    const baseTips = [
      'A/B test different headlines and copy',
      'Monitor click-through rates daily',
      'Adjust targeting based on performance data',
      'Set up conversion tracking',
    ];

    const objectiveSpecificTips = {
      [AdObjective.LEAD_GENERATION]: [
        'Use lead magnets to increase conversions',
        'Optimize landing page for form completion',
        'Test different CTA buttons',
      ],
      [AdObjective.SALES]: [
        'Include pricing or discount information',
        'Use urgency and scarcity tactics',
        'Highlight customer reviews',
      ],
      [AdObjective.BRAND_AWARENESS]: [
        'Focus on reach over frequency',
        'Use brand-focused messaging',
        'Track brand recall metrics',
      ],
    };

    return [...baseTips, ...(objectiveSpecificTips[objective] || [])];
  }
}
