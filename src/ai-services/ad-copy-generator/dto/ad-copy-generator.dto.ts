import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';

export enum AdPlatform {
  GOOGLE_ADS = 'google_ads',
  FACEBOOK_ADS = 'facebook_ads',
  INSTAGRAM_ADS = 'instagram_ads',
  LINKEDIN_ADS = 'linkedin_ads',
  TWITTER_ADS = 'twitter_ads',
  YOUTUBE_ADS = 'youtube_ads',
  TIKTOK_ADS = 'tiktok_ads',
}

export enum AdObjective {
  BRAND_AWARENESS = 'brand_awareness',
  LEAD_GENERATION = 'lead_generation',
  SALES = 'sales',
  TRAFFIC = 'traffic',
  ENGAGEMENT = 'engagement',
  APP_PROMOTION = 'app_promotion',
  EVENT_PROMOTION = 'event_promotion',
}

export enum AdTone {
  URGENT = 'urgent',
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional',
  CASUAL = 'casual',
  AUTHORITATIVE = 'authoritative',
  PLAYFUL = 'playful',
  EMOTIONAL = 'emotional',
}

export class GenerateAdCopyDto {
  @ApiProperty({
    description: 'Product or service being advertised',
    example: 'AI-powered project management tool',
  })
  @IsString()
  product: string;

  @ApiProperty({
    description: 'Target advertising platform',
    enum: AdPlatform,
    example: AdPlatform.GOOGLE_ADS,
  })
  @IsEnum(AdPlatform)
  platform: AdPlatform;

  @ApiProperty({
    description: 'Primary advertising objective',
    enum: AdObjective,
    example: AdObjective.LEAD_GENERATION,
  })
  @IsEnum(AdObjective)
  objective: AdObjective;

  @ApiProperty({
    description: 'Target audience description',
    example: 'Small business owners and entrepreneurs',
  })
  @IsString()
  targetAudience: string;

  @ApiProperty({
    description: 'Key benefits or selling points',
    example: ['Saves 10+ hours per week', 'Integrates with existing tools', 'AI-powered insights'],
  })
  @IsArray()
  @IsString({ each: true })
  keyBenefits: string[];

  @ApiProperty({
    description: 'Tone of voice for the ad',
    enum: AdTone,
    example: AdTone.PROFESSIONAL,
  })
  @IsEnum(AdTone)
  tone: AdTone;

  @ApiProperty({
    description: 'Call-to-action text',
    example: 'Start your free trial',
    required: false,
  })
  @IsOptional()
  @IsString()
  callToAction?: string;

  @ApiProperty({
    description: 'Budget range (for platform-specific optimization)',
    example: '$500-1000',
    required: false,
  })
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiProperty({
    description: 'Industry or business category',
    example: 'Software/Technology',
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({
    description: 'Specific keywords to include',
    example: ['productivity', 'automation', 'efficiency'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiProperty({
    description: 'Character limit for the ad copy (platform specific)',
    minimum: 50,
    maximum: 500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(500)
  characterLimit?: number;
}

export class AdCopyVariationDto {
  @ApiProperty({
    description: 'Headline for the ad',
    example: 'Boost Team Productivity by 300% with AI',
  })
  headline: string;

  @ApiProperty({
    description: 'Main ad copy text',
    example: 'Transform your project management with our AI-powered tool. Save 10+ hours weekly while delivering better results. Perfect for growing teams.',
  })
  copy: string;

  @ApiProperty({
    description: 'Call-to-action text',
    example: 'Start Free Trial',
  })
  callToAction: string;

  @ApiProperty({
    description: 'Character count of the copy',
    example: 145,
  })
  characterCount: number;
}

export class AdCopyResponseDto {
  @ApiProperty({
    description: 'Product/service being advertised',
    example: 'AI-powered project management tool',
  })
  product: string;

  @ApiProperty({
    description: 'Target platform',
    enum: AdPlatform,
    example: AdPlatform.GOOGLE_ADS,
  })
  platform: AdPlatform;

  @ApiProperty({
    description: 'Multiple ad copy variations',
    type: [AdCopyVariationDto],
  })
  variations: AdCopyVariationDto[];

  @ApiProperty({
    description: 'Platform-specific recommendations',
    example: ['Use power words for higher CTR', 'Include social proof elements', 'Test multiple CTAs'],
  })
  recommendations: string[];

  @ApiProperty({
    description: 'Optimization tips',
    example: ['A/B test different headlines', 'Monitor click-through rates', 'Adjust targeting based on performance'],
  })
  optimizationTips: string[];

  @ApiProperty({
    description: 'Credits deducted for generation',
    example: 3,
  })
  creditsUsed: number;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Ad copy generated successfully',
  })
  message: string;
}
