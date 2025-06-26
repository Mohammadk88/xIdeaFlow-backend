import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../../credits/credits.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { CreditActionType } from '@prisma/client';
import {
  BrowsePromptsDto,
  UsePromptDto,
  MarketplaceResponseDto,
  PromptUsageResponseDto,
  PromptTemplateDto,
  PromptCategory,
} from './dto/prompt-marketplace.dto';

@Injectable()
export class PromptMarketplaceService {
  private readonly serviceName = 'ai_prompt_marketplace';
  private readonly creditCost = 1;

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async browsePrompts(
    browseDto: BrowsePromptsDto,
  ): Promise<MarketplaceResponseDto> {
    const mockPrompts = this.getMockPrompts();

    let filtered = mockPrompts;

    if (browseDto.category) {
      filtered = filtered.filter((p) => p.category === browseDto.category);
    }

    if (browseDto.search) {
      const search = browseDto.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search),
      );
    }

    const limit = browseDto.limit || 10;
    const prompts = filtered.slice(0, limit);

    return {
      prompts,
      total: filtered.length,
      count: prompts.length,
    };
  }

  async usePrompt(
    userId: string,
    usePromptDto: UsePromptDto,
  ): Promise<PromptUsageResponseDto> {
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
      CreditActionType.USE_PROMPT_TEMPLATE,
      this.creditCost,
      { promptId: usePromptDto.promptId, variables: usePromptDto.variables },
    );

    await this.subscriptionsService.incrementUsage(
      userId,
      service.id,
      accessCheck.usagePeriod || 'MONTHLY',
    );

    return this.generateContentFromPrompt(usePromptDto);
  }

  private generateContentFromPrompt(
    usePromptDto: UsePromptDto,
  ): PromptUsageResponseDto {
    const mockPrompts = this.getMockPrompts();
    const promptTemplate = mockPrompts.find(
      (p) => p.id === usePromptDto.promptId,
    );

    if (!promptTemplate) {
      throw new ForbiddenException('Prompt template not found');
    }

    let content = promptTemplate.preview;
    const variables = usePromptDto.variables || {};

    // Replace variables in the prompt
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `[${key.toUpperCase()}]`;
      const stringValue = String(value);
      content = content.replace(new RegExp(placeholder, 'g'), stringValue);
    });

    // If still has placeholders, fill with defaults
    content = content.replace(/\[TOPIC\]/g, 'your business');
    content = content.replace(/\[TONE\]/g, 'professional');
    content = content.replace(/\[PLATFORM\]/g, 'social media');
    content = content.replace(/\[AUDIENCE\]/g, 'your target audience');

    return {
      content,
      prompt: promptTemplate,
      creditsUsed: this.creditCost,
      success: true,
      message: 'Prompt used successfully',
    };
  }

  private getMockPrompts(): PromptTemplateDto[] {
    return [
      {
        id: 'social-post-creator',
        title: 'Social Media Post Creator',
        description: 'Generate engaging social media posts for any platform',
        category: PromptCategory.CONTENT_CREATION,
        credits: 1,
        preview:
          'Create a [TONE] social media post about [TOPIC] for [PLATFORM] that will engage [AUDIENCE]. Include relevant hashtags and a call-to-action.',
        variables: ['TONE', 'TOPIC', 'PLATFORM', 'AUDIENCE'],
        rating: 4.8,
        usageCount: 1247,
      },
      {
        id: 'email-marketing',
        title: 'Email Marketing Campaign',
        description: 'Professional email templates for marketing campaigns',
        category: PromptCategory.MARKETING,
        credits: 1,
        preview:
          'Write a compelling marketing email about [TOPIC] with a [TONE] tone. Include a strong subject line and clear call-to-action for [AUDIENCE].',
        variables: ['TOPIC', 'TONE', 'AUDIENCE'],
        rating: 4.6,
        usageCount: 892,
      },
      {
        id: 'blog-outline',
        title: 'Blog Post Outline Generator',
        description: 'Create detailed blog post outlines and structures',
        category: PromptCategory.CONTENT_CREATION,
        credits: 1,
        preview:
          'Create a comprehensive blog post outline about [TOPIC] for [AUDIENCE]. Include main sections, key points, and SEO considerations.',
        variables: ['TOPIC', 'AUDIENCE'],
        rating: 4.7,
        usageCount: 634,
      },
      {
        id: 'product-description',
        title: 'Product Description Writer',
        description: 'Compelling product descriptions that convert',
        category: PromptCategory.BUSINESS,
        credits: 1,
        preview:
          'Write a persuasive product description for [TOPIC] targeting [AUDIENCE]. Highlight key benefits and include a compelling call-to-action.',
        variables: ['TOPIC', 'AUDIENCE'],
        rating: 4.9,
        usageCount: 1156,
      },
      {
        id: 'creative-story',
        title: 'Creative Story Generator',
        description: 'Generate creative stories and narratives',
        category: PromptCategory.CREATIVE,
        credits: 1,
        preview:
          'Write a creative story about [TOPIC] with a [TONE] mood. Include interesting characters and an engaging plot.',
        variables: ['TOPIC', 'TONE'],
        rating: 4.5,
        usageCount: 423,
      },
    ];
  }
}
