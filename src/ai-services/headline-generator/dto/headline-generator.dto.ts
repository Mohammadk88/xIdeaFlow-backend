import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export enum HeadlineType {
  BLOG_POST = 'blog_post',
  NEWS_ARTICLE = 'news_article',
  SOCIAL_MEDIA = 'social_media',
  EMAIL_SUBJECT = 'email_subject',
  AD_HEADLINE = 'ad_headline',
  PRESS_RELEASE = 'press_release',
  LANDING_PAGE = 'landing_page',
  PRODUCT_LAUNCH = 'product_launch',
}

export enum HeadlineStyle {
  QUESTION = 'question',
  HOW_TO = 'how_to',
  LIST = 'list',
  EMOTIONAL = 'emotional',
  URGENT = 'urgent',
  BENEFIT_DRIVEN = 'benefit_driven',
  CURIOSITY = 'curiosity',
  DIRECT = 'direct',
}

export class GenerateHeadlineDto {
  @ApiProperty({
    description: 'Main topic or subject',
    example: 'artificial intelligence in healthcare',
  })
  @IsString()
  topic: string;

  @ApiProperty({
    description: 'Type of headline needed',
    enum: HeadlineType,
    example: HeadlineType.BLOG_POST,
  })
  @IsEnum(HeadlineType)
  type: HeadlineType;

  @ApiProperty({
    description: 'Target audience',
    example: 'healthcare professionals and medical researchers',
  })
  @IsString()
  audience: string;

  @ApiProperty({
    description: 'Preferred headline style',
    enum: HeadlineStyle,
    example: HeadlineStyle.BENEFIT_DRIVEN,
  })
  @IsEnum(HeadlineStyle)
  style: HeadlineStyle;

  @ApiProperty({
    description: 'Key benefits or selling points',
    example: [
      'improved patient outcomes',
      'cost reduction',
      'faster diagnosis',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyPoints?: string[];

  @ApiProperty({
    description: 'Keywords to include',
    example: ['AI', 'machine learning', 'diagnosis'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiProperty({
    description: 'Character limit for headline',
    minimum: 30,
    maximum: 200,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  characterLimit?: number;

  @ApiProperty({
    description: 'Industry or niche focus',
    example: 'Healthcare Technology',
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({
    description: 'Emotional tone to convey',
    example: 'excitement',
    required: false,
  })
  @IsOptional()
  @IsString()
  emotion?: string;
}

export class HeadlineVariationDto {
  @ApiProperty({
    description: 'Generated headline',
    example:
      'How AI is Revolutionizing Healthcare: 5 Game-Changing Applications',
  })
  headline: string;

  @ApiProperty({
    description: 'Character count',
    example: 68,
  })
  characterCount: number;

  @ApiProperty({
    description: 'Effectiveness score (1-10)',
    example: 8.5,
  })
  score: number;

  @ApiProperty({
    description: 'Why this headline works',
    example: 'Uses numbers for specificity and power words for impact',
  })
  reasoning: string;
}

export class HeadlineResponseDto {
  @ApiProperty({
    description: 'Original topic',
    example: 'artificial intelligence in healthcare',
  })
  topic: string;

  @ApiProperty({
    description: 'Headline type',
    enum: HeadlineType,
    example: HeadlineType.BLOG_POST,
  })
  type: HeadlineType;

  @ApiProperty({
    description: 'Multiple headline variations',
    type: [HeadlineVariationDto],
  })
  variations: HeadlineVariationDto[];

  @ApiProperty({
    description: 'Best performing headline',
    type: HeadlineVariationDto,
  })
  recommended: HeadlineVariationDto;

  @ApiProperty({
    description: 'Tips for headline optimization',
    example: [
      'Include numbers for credibility',
      'Use power words',
      'Keep under 60 characters for SEO',
    ],
  })
  optimizationTips: string[];

  @ApiProperty({
    description: 'A/B testing suggestions',
    example: [
      'Test emotional vs rational appeal',
      'Try different numbers',
      'Experiment with question format',
    ],
  })
  testingSuggestions: string[];

  @ApiProperty({
    description: 'Credits deducted for generation',
    example: 2,
  })
  creditsUsed: number;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Headlines generated successfully',
  })
  message: string;
}
