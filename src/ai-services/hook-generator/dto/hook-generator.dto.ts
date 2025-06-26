import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum HookType {
  QUESTION = 'question',
  STATISTIC = 'statistic',
  STORY = 'story',
  QUOTE = 'quote',
  BOLD_STATEMENT = 'bold_statement',
  PROBLEM_SOLUTION = 'problem_solution',
}

export enum ContentPlatform {
  SOCIAL_MEDIA = 'social_media',
  BLOG = 'blog',
  EMAIL = 'email',
  VIDEO = 'video',
  PODCAST = 'podcast',
}

export class GenerateHookDto {
  @ApiProperty({
    description: 'The topic or subject for the hook',
    example: 'remote work productivity',
  })
  @IsString()
  topic: string;

  @ApiProperty({
    description: 'Type of hook to generate',
    enum: HookType,
    example: HookType.QUESTION,
  })
  @IsEnum(HookType)
  hookType: HookType;

  @ApiProperty({
    description: 'Platform where the hook will be used',
    enum: ContentPlatform,
    example: ContentPlatform.SOCIAL_MEDIA,
  })
  @IsEnum(ContentPlatform)
  platform: ContentPlatform;

  @ApiProperty({
    description: 'Target audience description',
    example: 'business professionals and entrepreneurs',
    required: false,
  })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiProperty({
    description: 'Additional context for the hook',
    example: 'Focus on time management benefits',
    required: false,
  })
  @IsOptional()
  @IsString()
  context?: string;
}

export class HookResponseDto {
  @ApiProperty({
    description: 'Generated hook content',
    example: 'Did you know that remote workers are 13% more productive?',
  })
  hook: string;

  @ApiProperty({
    description: 'Hook category',
    example: 'Question-based hook',
  })
  category: string;

  @ApiProperty({
    description: 'Alternative hook variations',
    example: [
      'What if I told you remote work increases productivity by 13%?',
      'The surprising truth about remote work productivity...',
    ],
  })
  alternatives: string[];

  @ApiProperty({
    description: 'Tips for using this hook effectively',
    example: ['Follow with supporting statistics', 'Use engaging visuals'],
  })
  usageTips: string[];

  @ApiProperty({
    description: 'Character count of the main hook',
    example: 52,
  })
  characterCount: number;
}
