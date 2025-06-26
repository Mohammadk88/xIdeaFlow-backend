import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export enum PromptPurpose {
  CONTENT_CREATION = 'content_creation',
  MARKETING = 'marketing',
  EMAIL_WRITING = 'email_writing',
  SOCIAL_MEDIA = 'social_media',
  BUSINESS_COMMUNICATION = 'business_communication',
  CREATIVE_WRITING = 'creative_writing',
  EDUCATION = 'education',
  TECHNICAL = 'technical',
}

export enum ComplexityLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export class GeneratePromptTemplateDto {
  @ApiProperty({
    description: 'Purpose or goal of the prompt template',
    enum: PromptPurpose,
    example: PromptPurpose.CONTENT_CREATION,
  })
  @IsEnum(PromptPurpose)
  purpose: PromptPurpose;

  @ApiProperty({
    description: 'Specific use case or scenario',
    example: 'Create engaging blog post introductions',
  })
  @IsString()
  useCase: string;

  @ApiProperty({
    description: 'Target audience for the output',
    example: 'Marketing professionals and content creators',
  })
  @IsString()
  targetAudience: string;

  @ApiProperty({
    description: 'Complexity level of the prompt',
    enum: ComplexityLevel,
    example: ComplexityLevel.INTERMEDIATE,
  })
  @IsEnum(ComplexityLevel)
  complexity: ComplexityLevel;

  @ApiProperty({
    description: 'Specific requirements or constraints',
    example: 'Include call-to-action, max 150 words, SEO-friendly',
    required: false,
  })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiProperty({
    description: 'Industry or domain focus',
    example: 'Technology and SaaS',
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({
    description: 'Variables that should be customizable',
    example: ['TOPIC', 'TONE', 'LENGTH', 'AUDIENCE'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];
}

export class PromptTemplateResponseDto {
  @ApiProperty({
    description: 'Generated prompt template',
    example: 'Create a [TONE] blog post introduction about [TOPIC] for [AUDIENCE]. The introduction should be [LENGTH] and include a compelling hook that...',
  })
  template: string;

  @ApiProperty({
    description: 'Title for the prompt template',
    example: 'Blog Post Introduction Creator',
  })
  title: string;

  @ApiProperty({
    description: 'Description of what the template does',
    example: 'Generates compelling blog post introductions that hook readers and encourage continued reading',
  })
  description: string;

  @ApiProperty({
    description: 'Purpose category',
    enum: PromptPurpose,
    example: PromptPurpose.CONTENT_CREATION,
  })
  purpose: PromptPurpose;

  @ApiProperty({
    description: 'Complexity level',
    enum: ComplexityLevel,
    example: ComplexityLevel.INTERMEDIATE,
  })
  complexity: ComplexityLevel;

  @ApiProperty({
    description: 'Variables that can be customized',
    example: ['TOPIC', 'TONE', 'LENGTH', 'AUDIENCE'],
  })
  variables: string[];

  @ApiProperty({
    description: 'Usage instructions',
    example: 'Replace variables with specific values: [TOPIC] with your subject, [TONE] with desired writing style, etc.',
  })
  instructions: string;

  @ApiProperty({
    description: 'Example output using the template',
    example: 'Create a professional blog post introduction about artificial intelligence for business executives...',
  })
  example: string;

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
    example: 'Prompt template generated successfully',
  })
  message: string;
}
