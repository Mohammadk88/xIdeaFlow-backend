import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum PromptCategory {
  CONTENT_CREATION = 'content_creation',
  MARKETING = 'marketing',
  BUSINESS = 'business',
  EDUCATION = 'education',
  CREATIVE = 'creative',
  TECHNICAL = 'technical',
}

export class BrowsePromptsDto {
  @ApiProperty({
    description: 'Category to filter prompts',
    enum: PromptCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(PromptCategory)
  category?: PromptCategory;

  @ApiProperty({
    description: 'Search query for prompt titles or descriptions',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Number of prompts to return (default: 10)',
    required: false,
  })
  @IsOptional()
  limit?: number;
}

export class PurchasePromptDto {
  @ApiProperty({
    description: 'ID of the prompt template to purchase',
    example: 'prompt-123',
  })
  @IsString()
  promptId: string;
}

export class PromptTemplateDto {
  @ApiProperty({
    description: 'Unique prompt ID',
    example: 'prompt-123',
  })
  id: string;

  @ApiProperty({
    description: 'Prompt title',
    example: 'Social Media Content Creator',
  })
  title: string;

  @ApiProperty({
    description: 'Prompt description',
    example: 'Generate engaging social media posts for any platform',
  })
  description: string;

  @ApiProperty({
    description: 'Prompt category',
    enum: PromptCategory,
    example: PromptCategory.CONTENT_CREATION,
  })
  category: PromptCategory;

  @ApiProperty({
    description: 'Credit cost to use this prompt',
    example: 1,
  })
  credits: number;

  @ApiProperty({
    description: 'Preview of the prompt template',
    example:
      'Create a [TONE] social media post about [TOPIC] for [PLATFORM]...',
  })
  preview: string;

  @ApiProperty({
    description: 'Variables that can be customized',
    example: ['TONE', 'TOPIC', 'PLATFORM'],
  })
  variables: string[];

  @ApiProperty({
    description: 'User rating (1-5 stars)',
    example: 4.5,
  })
  rating: number;

  @ApiProperty({
    description: 'Number of times used',
    example: 150,
  })
  usageCount: number;
}

export class MarketplaceResponseDto {
  @ApiProperty({
    description: 'Available prompt templates',
    type: [PromptTemplateDto],
  })
  prompts: PromptTemplateDto[];

  @ApiProperty({
    description: 'Total number of prompts available',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Number of prompts returned',
    example: 10,
  })
  count: number;
}

export class UsePromptDto {
  @ApiProperty({
    description: 'ID of the prompt template to use',
    example: 'prompt-123',
  })
  @IsString()
  promptId: string;

  @ApiProperty({
    description: 'Variable values for the prompt template',
    example: {
      TONE: 'professional',
      TOPIC: 'artificial intelligence',
      PLATFORM: 'LinkedIn',
    },
  })
  variables: Record<string, string>;
}

export class PromptUsageResponseDto {
  @ApiProperty({
    description: 'Generated content using the prompt',
    example: 'Professional LinkedIn post about artificial intelligence...',
  })
  content: string;

  @ApiProperty({
    description: 'Prompt template used',
    type: PromptTemplateDto,
  })
  prompt: PromptTemplateDto;

  @ApiProperty({
    description: 'Credits deducted for usage',
    example: 1,
  })
  creditsUsed: number;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Prompt used successfully',
  })
  message: string;
}
