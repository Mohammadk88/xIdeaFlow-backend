import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../../credits/credits.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { CreditActionType } from '@prisma/client';
import {
  GenerateHeadlineDto,
  HeadlineResponseDto,
  HeadlineVariationDto,
  HeadlineType,
  HeadlineStyle,
} from './dto/headline-generator.dto';

@Injectable()
export class HeadlineGeneratorService {
  private readonly serviceName = 'ai_headline_generator';
  private readonly creditCost = 2;

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async generateHeadlines(
    userId: string,
    generateDto: GenerateHeadlineDto,
  ): Promise<HeadlineResponseDto> {
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
      throw new ForbiddenException(creditCheck.message);
    }

    const headlineData = this.generateMockHeadlines(generateDto);

    await this.creditsService.deductCredits(
      userId,
      service.id,
      CreditActionType.GENERATE_HEADLINE,
      this.creditCost,
      {
        topic: generateDto.topic,
        type: generateDto.type,
        style: generateDto.style,
        variationsGenerated: headlineData.variations.length,
      },
    );

    if (accessCheck.hasAccess) {
      await this.subscriptionsService.incrementUsage(
        userId,
        service.id,
        accessCheck.usagePeriod!,
      );
    }

    return {
      ...headlineData,
      creditsUsed: this.creditCost,
      success: true,
      message: 'Headlines generated successfully',
    };
  }

  private generateMockHeadlines(dto: GenerateHeadlineDto): Omit<HeadlineResponseDto, 'creditsUsed' | 'success' | 'message'> {
    const variations = this.createHeadlineVariations(dto);
    const recommended = variations.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return {
      topic: dto.topic,
      type: dto.type,
      variations,
      recommended,
      optimizationTips: this.getOptimizationTips(dto.type),
      testingSuggestions: this.getTestingSuggestions(dto.style),
    };
  }

  private createHeadlineVariations(dto: GenerateHeadlineDto): HeadlineVariationDto[] {
    const variations: HeadlineVariationDto[] = [];
    const templates = this.getHeadlineTemplates(dto.style);
    const characterLimit = dto.characterLimit || this.getDefaultCharacterLimit(dto.type);

    templates.forEach((template, index) => {
      const headline = this.populateTemplate(template, dto);
      if (headline.length <= characterLimit) {
        variations.push({
          headline,
          characterCount: headline.length,
          score: this.calculateScore(headline, dto),
          reasoning: this.generateReasoning(template, dto.style),
        });
      }
    });

    return variations.slice(0, 5); // Return top 5 variations
  }

  private getHeadlineTemplates(style: HeadlineStyle): string[] {
    const templates = {
      [HeadlineStyle.QUESTION]: [
        'How Can [TOPIC] Transform [AUDIENCE]?',
        'What [AUDIENCE] Need to Know About [TOPIC]',
        'Is [TOPIC] the Future of [INDUSTRY]?',
        'Why [AUDIENCE] Should Care About [TOPIC]',
      ],
      [HeadlineStyle.HOW_TO]: [
        'How to Use [TOPIC] to [BENEFIT]',
        'How [AUDIENCE] Can Leverage [TOPIC]',
        'How to Master [TOPIC] in [TIME_FRAME]',
        'How to Implement [TOPIC] for [BENEFIT]',
      ],
      [HeadlineStyle.LIST]: [
        '[NUMBER] Ways [TOPIC] Will Change [INDUSTRY]',
        '[NUMBER] [TOPIC] Trends [AUDIENCE] Should Watch',
        'Top [NUMBER] [TOPIC] Benefits for [AUDIENCE]',
        '[NUMBER] Reasons Why [TOPIC] Matters',
      ],
      [HeadlineStyle.EMOTIONAL]: [
        'The Shocking Truth About [TOPIC]',
        'Why [AUDIENCE] Are Excited About [TOPIC]',
        'The Amazing Impact of [TOPIC] on [INDUSTRY]',
        'Incredible [TOPIC] Success Stories',
      ],
      [HeadlineStyle.URGENT]: [
        'Don\'t Miss: [TOPIC] is Changing Everything',
        'Act Now: [TOPIC] Opportunity for [AUDIENCE]',
        'Limited Time: [TOPIC] Breakthrough',
        'Breaking: [TOPIC] Revolution in [INDUSTRY]',
      ],
      [HeadlineStyle.BENEFIT_DRIVEN]: [
        '[TOPIC]: The Key to [BENEFIT]',
        'Boost [OUTCOME] with [TOPIC]',
        'How [TOPIC] Delivers [BENEFIT] for [AUDIENCE]',
        'Maximize [RESULT] Through [TOPIC]',
      ],
      [HeadlineStyle.CURIOSITY]: [
        'The Secret Behind [TOPIC] Success',
        'What Nobody Tells You About [TOPIC]',
        'Hidden [TOPIC] Insights for [AUDIENCE]',
        'The Untold Story of [TOPIC]',
      ],
      [HeadlineStyle.DIRECT]: [
        '[TOPIC] for [AUDIENCE]: Complete Guide',
        'Everything About [TOPIC] in [INDUSTRY]',
        '[TOPIC] Explained for [AUDIENCE]',
        'Understanding [TOPIC]: A [AUDIENCE] Perspective',
      ],
    };

    return templates[style] || templates[HeadlineStyle.DIRECT];
  }

  private populateTemplate(template: string, dto: GenerateHeadlineDto): string {
    let headline = template;
    
    // Replace placeholders
    headline = headline.replace(/\[TOPIC\]/g, dto.topic);
    headline = headline.replace(/\[AUDIENCE\]/g, dto.audience);
    headline = headline.replace(/\[INDUSTRY\]/g, dto.industry || 'your industry');
    
    // Add numbers for list-style headlines
    headline = headline.replace(/\[NUMBER\]/g, this.getRandomNumber().toString());
    
    // Add benefits if available
    if (dto.keyPoints && dto.keyPoints.length > 0) {
      headline = headline.replace(/\[BENEFIT\]/g, dto.keyPoints[0]);
      headline = headline.replace(/\[OUTCOME\]/g, dto.keyPoints[0]);
      headline = headline.replace(/\[RESULT\]/g, dto.keyPoints[0]);
    } else {
      headline = headline.replace(/\[BENEFIT\]/g, 'better results');
      headline = headline.replace(/\[OUTCOME\]/g, 'performance');
      headline = headline.replace(/\[RESULT\]/g, 'success');
    }
    
    // Add time frame
    headline = headline.replace(/\[TIME_FRAME\]/g, '30 days');
    
    return this.capitalizeWords(headline);
  }

  private getRandomNumber(): number {
    const numbers = [3, 5, 7, 10, 15, 20];
    return numbers[Math.floor(Math.random() * numbers.length)];
  }

  private calculateScore(headline: string, dto: GenerateHeadlineDto): number {
    let score = 5; // Base score
    
    // Length optimization
    if (headline.length >= 30 && headline.length <= 60) score += 1;
    if (headline.length > 60 && headline.length <= 90) score += 0.5;
    
    // Keyword inclusion
    if (dto.keywords) {
      const keywordCount = dto.keywords.filter(keyword => 
        headline.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += keywordCount * 0.5;
    }
    
    // Power words detection
    const powerWords = ['amazing', 'incredible', 'breakthrough', 'revolutionary', 'secret', 'proven'];
    const powerWordCount = powerWords.filter(word => 
      headline.toLowerCase().includes(word)
    ).length;
    score += powerWordCount * 0.3;
    
    // Numbers boost
    if (/\d/.test(headline)) score += 0.5;
    
    return Math.min(score, 10); // Cap at 10
  }

  private generateReasoning(template: string, style: HeadlineStyle): string {
    const reasons = {
      [HeadlineStyle.QUESTION]: 'Questions engage curiosity and encourage clicks',
      [HeadlineStyle.HOW_TO]: 'How-to headlines promise practical value',
      [HeadlineStyle.LIST]: 'Numbered lists provide clear expectations',
      [HeadlineStyle.EMOTIONAL]: 'Emotional appeal drives engagement',
      [HeadlineStyle.URGENT]: 'Urgency creates immediate action',
      [HeadlineStyle.BENEFIT_DRIVEN]: 'Clear benefits attract target audience',
      [HeadlineStyle.CURIOSITY]: 'Curiosity gaps compel reading',
      [HeadlineStyle.DIRECT]: 'Direct headlines set clear expectations',
    };

    return reasons[style] || 'Clear and descriptive headline';
  }

  private getDefaultCharacterLimit(type: HeadlineType): number {
    const limits = {
      [HeadlineType.BLOG_POST]: 60,
      [HeadlineType.NEWS_ARTICLE]: 70,
      [HeadlineType.SOCIAL_MEDIA]: 100,
      [HeadlineType.EMAIL_SUBJECT]: 50,
      [HeadlineType.AD_HEADLINE]: 30,
      [HeadlineType.PRESS_RELEASE]: 80,
      [HeadlineType.LANDING_PAGE]: 60,
      [HeadlineType.PRODUCT_LAUNCH]: 70,
    };

    return limits[type] || 60;
  }

  private getOptimizationTips(type: HeadlineType): string[] {
    const tips = {
      [HeadlineType.BLOG_POST]: [
        'Include keywords early',
        'Keep under 60 characters for SEO',
        'Use numbers when possible',
        'Create emotional connection',
      ],
      [HeadlineType.EMAIL_SUBJECT]: [
        'Avoid spam trigger words',
        'Use personalization when possible',
        'Create urgency appropriately',
        'Test different lengths',
      ],
      [HeadlineType.SOCIAL_MEDIA]: [
        'Use hashtags strategically',
        'Encourage engagement',
        'Keep platform-specific limits in mind',
        'Include visual elements description',
      ],
    };

    return tips[type] || [
      'Be clear and specific',
      'Use action words',
      'Appeal to target audience',
      'Test multiple variations',
    ];
  }

  private getTestingSuggestions(style: HeadlineStyle): string[] {
    return [
      'Test emotional vs rational appeal',
      'Try different numbers in lists',
      'Experiment with question vs statement format',
      'Compare short vs medium length headlines',
      'Test with and without keywords',
    ];
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }
}
