import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export enum EmailType {
  MARKETING = 'marketing',
  SALES = 'sales',
  NEWSLETTER = 'newsletter',
  FOLLOW_UP = 'follow_up',
  COLD_OUTREACH = 'cold_outreach',
  THANK_YOU = 'thank_you',
  ANNOUNCEMENT = 'announcement',
}

export enum EmailTone {
  PROFESSIONAL = 'professional',
  CASUAL = 'casual',
  FRIENDLY = 'friendly',
  FORMAL = 'formal',
  PERSUASIVE = 'persuasive',
  URGENT = 'urgent',
}

export class GenerateEmailDto {
  @ApiProperty({
    description: 'Type of email to generate',
    enum: EmailType,
    example: EmailType.MARKETING,
  })
  @IsEnum(EmailType)
  emailType: EmailType;

  @ApiProperty({
    description: 'Subject or main topic of the email',
    example: 'New product launch announcement',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Tone of the email',
    enum: EmailTone,
    example: EmailTone.PROFESSIONAL,
  })
  @IsEnum(EmailTone)
  tone: EmailTone;

  @ApiProperty({
    description: 'Target audience description',
    example: 'Existing customers interested in tech products',
    required: false,
  })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiProperty({
    description: 'Key points to include in the email',
    example: ['Product features', 'Special discount', 'Limited time offer'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyPoints?: string[];

  @ApiProperty({
    description: 'Call-to-action text',
    example: 'Shop Now',
    required: false,
  })
  @IsOptional()
  @IsString()
  callToAction?: string;

  @ApiProperty({
    description: 'Additional context or requirements',
    example: 'Include company branding and contact information',
    required: false,
  })
  @IsOptional()
  @IsString()
  additionalContext?: string;
}

export class EmailResponseDto {
  @ApiProperty({
    description: 'Generated email subject line',
    example: 'Introducing Our Revolutionary New Product - Limited Time Offer!',
  })
  subject: string;

  @ApiProperty({
    description: 'Generated email body content',
    example: 'Dear valued customer...',
  })
  body: string;

  @ApiProperty({
    description: 'Email preview text',
    example: 'Get 20% off our latest innovation...',
  })
  previewText: string;

  @ApiProperty({
    description: 'Suggested follow-up actions',
    example: ['Send within 24 hours', 'A/B test subject line'],
  })
  suggestions: string[];

  @ApiProperty({
    description: 'Estimated word count',
    example: 150,
  })
  wordCount: number;
}
