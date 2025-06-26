import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

export enum PostTone {
  PROFESSIONAL = 'professional',
  CASUAL = 'casual',
  FRIENDLY = 'friendly',
  AUTHORITATIVE = 'authoritative',
  HUMOROUS = 'humorous',
  INSPIRATIONAL = 'inspirational',
}

export enum SocialPlatform {
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
}

export class GeneratePostDto {
  @ApiProperty({
    description: 'The topic or subject for the post',
    example: 'AI technology in healthcare',
  })
  @IsString()
  topic: string;

  @ApiProperty({
    description: 'The tone of the post',
    enum: PostTone,
    example: PostTone.PROFESSIONAL,
  })
  @IsEnum(PostTone)
  tone: PostTone;

  @ApiProperty({
    description: 'Target social media platform',
    enum: SocialPlatform,
    example: SocialPlatform.LINKEDIN,
  })
  @IsEnum(SocialPlatform)
  platform: SocialPlatform;

  @ApiProperty({
    description: 'Target audience description',
    example: 'Healthcare professionals and tech enthusiasts',
    required: false,
  })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiProperty({
    description: 'Hashtags to include in the post',
    example: ['#AI', '#Healthcare', '#Technology'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiProperty({
    description: 'Additional context or requirements',
    example: 'Include a call-to-action for engagement',
    required: false,
  })
  @IsOptional()
  @IsString()
  additionalContext?: string;
}

export class PostResponseDto {
  @ApiProperty({
    description: 'Generated post content',
    example: 'AI is revolutionizing healthcare by enabling...',
  })
  content: string;

  @ApiProperty({
    description: 'Suggested hashtags',
    example: ['#AI', '#Healthcare', '#Innovation'],
  })
  hashtags: string[];

  @ApiProperty({
    description: 'Character count for the post',
    example: 280,
  })
  characterCount: number;

  @ApiProperty({
    description: 'Platform-specific recommendations',
    example: 'Perfect length for LinkedIn posts',
  })
  platformRecommendations: string;
}
