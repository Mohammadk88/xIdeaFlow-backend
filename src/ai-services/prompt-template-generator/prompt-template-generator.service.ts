import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../../credits/credits.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { CreditActionType } from '@prisma/client';
import {
  GeneratePromptTemplateDto,
  PromptTemplateResponseDto,
  PromptPurpose,
  ComplexityLevel,
} from './dto/prompt-template-generator.dto';

@Injectable()
export class PromptTemplateGeneratorService {
  private readonly serviceName = 'prompt_template_generator';
  private readonly creditCost = 2;

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async generatePromptTemplate(
    userId: string,
    generateDto: GeneratePromptTemplateDto,
  ): Promise<PromptTemplateResponseDto> {
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

    // Generate mock prompt template based on inputs
    const templateData = this.generateMockTemplate(generateDto);

    // Deduct credits and track usage
    await this.creditsService.deductCredits(
      userId,
      service.id,
      CreditActionType.GENERATE_PROMPT_TEMPLATE,
      this.creditCost,
      {
        purpose: generateDto.purpose,
        useCase: generateDto.useCase,
        complexity: generateDto.complexity,
        generatedTemplate: templateData.template,
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
      ...templateData,
      creditsUsed: this.creditCost,
      success: true,
      message: 'Prompt template generated successfully',
    };
  }

  private generateMockTemplate(
    dto: GeneratePromptTemplateDto,
  ): Omit<PromptTemplateResponseDto, 'creditsUsed' | 'success' | 'message'> {
    const purposeTemplates = this.getPurposeTemplates();
    const baseTemplate =
      purposeTemplates[dto.purpose] ||
      purposeTemplates[PromptPurpose.CONTENT_CREATION];

    // Generate variables based on purpose and user input
    const variables = dto.variables?.length
      ? dto.variables
      : this.getDefaultVariables(dto.purpose);

    // Create template with variables
    let template = baseTemplate.template;

    // Customize template based on use case
    if (dto.useCase.toLowerCase().includes('blog')) {
      template = template.replace('[CONTENT_TYPE]', 'blog post');
    } else if (dto.useCase.toLowerCase().includes('email')) {
      template = template.replace('[CONTENT_TYPE]', 'email');
    } else if (dto.useCase.toLowerCase().includes('social')) {
      template = template.replace('[CONTENT_TYPE]', 'social media post');
    } else {
      template = template.replace('[CONTENT_TYPE]', 'content');
    }

    // Add complexity-specific instructions
    const complexityInstructions = this.getComplexityInstructions(
      dto.complexity,
    );
    template = `${template}${complexityInstructions}`;

    // Add requirements if specified
    if (dto.requirements) {
      template = `${template}\n\nAdditional requirements: ${dto.requirements}`;
    }

    // Add industry focus if specified
    if (dto.industry) {
      template = template.replace('[INDUSTRY]', dto.industry);
    } else {
      template = template.replace('[INDUSTRY]', 'your industry');
    }

    const title = this.generateTitle(dto.purpose, dto.useCase);
    const description = this.generateDescription(dto.purpose, dto.useCase);
    const instructions = this.generateInstructions(variables);
    const example = this.generateExample(template, variables);

    return {
      template,
      title,
      description,
      purpose: dto.purpose,
      complexity: dto.complexity,
      variables,
      instructions,
      example,
    };
  }

  private getPurposeTemplates(): Record<PromptPurpose, { template: string }> {
    return {
      [PromptPurpose.CONTENT_CREATION]: {
        template:
          'Create a [TONE] [CONTENT_TYPE] about [TOPIC] for [AUDIENCE]. The content should be [LENGTH] and focus on [INDUSTRY]. Make it engaging and informative.',
      },
      [PromptPurpose.MARKETING]: {
        template:
          'Write a [TONE] marketing [CONTENT_TYPE] for [PRODUCT] targeting [AUDIENCE]. Highlight [BENEFITS] and include a compelling [CTA]. Focus on [INDUSTRY] market.',
      },
      [PromptPurpose.EMAIL_WRITING]: {
        template:
          'Compose a [TONE] email [CONTENT_TYPE] to [RECIPIENT] about [SUBJECT]. Include [KEY_POINTS] and end with [CTA]. Keep it [LENGTH] and professional.',
      },
      [PromptPurpose.SOCIAL_MEDIA]: {
        template:
          'Create a [TONE] social media [CONTENT_TYPE] for [PLATFORM] about [TOPIC]. Target [AUDIENCE], use [HASHTAGS], and keep it under [LENGTH] characters.',
      },
      [PromptPurpose.BUSINESS_COMMUNICATION]: {
        template:
          'Write a [TONE] business [CONTENT_TYPE] for [PURPOSE] addressing [AUDIENCE]. Cover [KEY_POINTS] and maintain [FORMALITY_LEVEL] throughout.',
      },
      [PromptPurpose.CREATIVE_WRITING]: {
        template:
          'Create a [TONE] creative [CONTENT_TYPE] about [THEME] for [AUDIENCE]. Use [STYLE] writing style and incorporate [ELEMENTS]. Make it [LENGTH].',
      },
      [PromptPurpose.EDUCATION]: {
        template:
          'Develop an educational [CONTENT_TYPE] about [TOPIC] for [AUDIENCE]. Explain [CONCEPTS] in a [TONE] manner and include [EXAMPLES]. Structure it for [LEVEL] learners.',
      },
      [PromptPurpose.TECHNICAL]: {
        template:
          'Write a technical [CONTENT_TYPE] about [TECHNOLOGY] for [AUDIENCE]. Cover [FEATURES] and provide [EXAMPLES]. Use [TONE] language appropriate for [LEVEL].',
      },
    };
  }

  private getDefaultVariables(purpose: PromptPurpose): string[] {
    const baseVariables = ['TOPIC', 'TONE', 'AUDIENCE', 'LENGTH'];

    const purposeSpecificVariables: Record<PromptPurpose, string[]> = {
      [PromptPurpose.CONTENT_CREATION]: [
        ...baseVariables,
        'INDUSTRY',
        'CONTENT_TYPE',
      ],
      [PromptPurpose.MARKETING]: [
        ...baseVariables,
        'PRODUCT',
        'BENEFITS',
        'CTA',
      ],
      [PromptPurpose.EMAIL_WRITING]: [
        ...baseVariables,
        'RECIPIENT',
        'SUBJECT',
        'KEY_POINTS',
        'CTA',
      ],
      [PromptPurpose.SOCIAL_MEDIA]: [...baseVariables, 'PLATFORM', 'HASHTAGS'],
      [PromptPurpose.BUSINESS_COMMUNICATION]: [
        ...baseVariables,
        'PURPOSE',
        'KEY_POINTS',
        'FORMALITY_LEVEL',
      ],
      [PromptPurpose.CREATIVE_WRITING]: [
        ...baseVariables,
        'THEME',
        'STYLE',
        'ELEMENTS',
      ],
      [PromptPurpose.EDUCATION]: [
        ...baseVariables,
        'CONCEPTS',
        'EXAMPLES',
        'LEVEL',
      ],
      [PromptPurpose.TECHNICAL]: [
        ...baseVariables,
        'TECHNOLOGY',
        'FEATURES',
        'EXAMPLES',
        'LEVEL',
      ],
    };

    return purposeSpecificVariables[purpose] || baseVariables;
  }

  private getComplexityInstructions(complexity: ComplexityLevel): string {
    const instructions = {
      [ComplexityLevel.BEGINNER]:
        '\n\nUse simple language and basic concepts. Provide clear explanations.',
      [ComplexityLevel.INTERMEDIATE]:
        '\n\nUse moderate complexity with some technical terms. Balance detail with clarity.',
      [ComplexityLevel.ADVANCED]:
        '\n\nUse sophisticated language and complex concepts. Assume domain knowledge.',
      [ComplexityLevel.EXPERT]:
        '\n\nUse highly technical language and advanced concepts. Target subject matter experts.',
    };

    return instructions[complexity];
  }

  private generateTitle(purpose: PromptPurpose, useCase: string): string {
    const purposeMap = {
      [PromptPurpose.CONTENT_CREATION]: 'Content Creator',
      [PromptPurpose.MARKETING]: 'Marketing Copy Generator',
      [PromptPurpose.EMAIL_WRITING]: 'Email Writer',
      [PromptPurpose.SOCIAL_MEDIA]: 'Social Media Creator',
      [PromptPurpose.BUSINESS_COMMUNICATION]: 'Business Communication Helper',
      [PromptPurpose.CREATIVE_WRITING]: 'Creative Writing Assistant',
      [PromptPurpose.EDUCATION]: 'Educational Content Creator',
      [PromptPurpose.TECHNICAL]: 'Technical Documentation Helper',
    };

    return `${purposeMap[purpose]} - ${useCase}`;
  }

  private generateDescription(purpose: PromptPurpose, useCase: string): string {
    return `Generates ${purpose.replace('_', ' ').toLowerCase()} content specifically for ${useCase.toLowerCase()}. Customizable with variables for different contexts and requirements.`;
  }

  private generateInstructions(variables: string[]): string {
    return `Replace the following variables with your specific values: ${variables.map((v) => `[${v}]`).join(', ')}. Each variable should be replaced with relevant content for your specific use case.`;
  }

  private generateExample(template: string, variables: string[]): string {
    // Create example values for common variables
    const exampleValues: Record<string, string> = {
      TOPIC: 'artificial intelligence in business',
      TONE: 'professional',
      AUDIENCE: 'business executives',
      LENGTH: '300 words',
      INDUSTRY: 'technology',
      CONTENT_TYPE: 'blog post',
      PRODUCT: 'AI productivity tool',
      BENEFITS: 'increased efficiency and cost savings',
      CTA: 'schedule a demo',
      RECIPIENT: 'potential clients',
      SUBJECT: 'improving business processes',
      KEY_POINTS: 'ROI analysis and implementation timeline',
      PLATFORM: 'LinkedIn',
      HASHTAGS: '#AI #Business #Technology',
      PURPOSE: 'quarterly review',
      FORMALITY_LEVEL: 'formal',
      THEME: 'innovation and transformation',
      STYLE: 'engaging and informative',
      ELEMENTS: 'real-world examples and case studies',
      CONCEPTS: 'machine learning fundamentals',
      EXAMPLES: 'practical applications',
      LEVEL: 'intermediate',
      TECHNOLOGY: 'cloud computing',
      FEATURES: 'scalability and security',
    };

    let example = template;

    // Replace variables with example values
    variables.forEach((variable) => {
      const placeholder = `[${variable}]`;
      const value = exampleValues[variable] || `your ${variable.toLowerCase()}`;
      example = example.replace(new RegExp(placeholder, 'g'), value);
    });

    return example;
  }
}
