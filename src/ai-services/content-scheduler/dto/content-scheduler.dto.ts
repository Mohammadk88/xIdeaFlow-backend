import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum ContentPlatform {
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
}

export enum ContentStatus {
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class ScheduleContentDto {
  @ApiProperty({
    description: 'Content to be scheduled',
    example: 'Check out our new AI-powered features!',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Platform to publish on',
    enum: ContentPlatform,
    example: ContentPlatform.TWITTER,
  })
  @IsEnum(ContentPlatform)
  platform: ContentPlatform;

  @ApiProperty({
    description: 'Scheduled publication date and time',
    example: '2024-12-25T10:00:00Z',
  })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({
    description: 'Optional title for the content',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Optional hashtags for the content',
    example: ['#AI', '#Technology', '#Innovation'],
    required: false,
  })
  @IsOptional()
  hashtags?: string[];
}

export class ScheduledContentResponseDto {
  @ApiProperty({
    description: 'Unique ID of the scheduled content',
    example: 'schedule-123',
  })
  id: string;

  @ApiProperty({
    description: 'Content to be published',
    example: 'Check out our new AI-powered features!',
  })
  content: string;

  @ApiProperty({
    description: 'Platform for publication',
    enum: ContentPlatform,
    example: ContentPlatform.TWITTER,
  })
  platform: ContentPlatform;

  @ApiProperty({
    description: 'Scheduled publication time',
    example: '2024-12-25T10:00:00Z',
  })
  scheduledAt: string;

  @ApiProperty({
    description: 'Current status',
    enum: ContentStatus,
    example: ContentStatus.SCHEDULED,
  })
  status: ContentStatus;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-12-20T15:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Content title',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'Hashtags',
    example: ['#AI', '#Technology'],
    required: false,
  })
  hashtags?: string[];
}

export class GetScheduledContentDto {
  @ApiProperty({
    description: 'Filter by platform',
    enum: ContentPlatform,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContentPlatform)
  platform?: ContentPlatform;

  @ApiProperty({
    description: 'Filter by status',
    enum: ContentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

export class UpdateScheduledContentDto {
  @ApiProperty({
    description: 'Updated content',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Updated platform',
    enum: ContentPlatform,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContentPlatform)
  platform?: ContentPlatform;

  @ApiProperty({
    description: 'Updated scheduled time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    description: 'Updated title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Updated status',
    enum: ContentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

export class ContentResponseDto {
  @ApiProperty({
    description: 'Unique ID of the scheduled content',
    example: 'schedule-123',
  })
  id: string;

  @ApiProperty({
    description: 'Content to be published',
    example: 'Check out our new AI-powered features!',
  })
  content: string;

  @ApiProperty({
    description: 'Platform for publication',
    enum: ContentPlatform,
    example: ContentPlatform.TWITTER,
  })
  platform: ContentPlatform;

  @ApiProperty({
    description: 'Scheduled publication time',
    example: '2024-12-25T10:00:00Z',
  })
  scheduledAt: string;

  @ApiProperty({
    description: 'Current status',
    enum: ContentStatus,
    example: ContentStatus.SCHEDULED,
  })
  status: ContentStatus;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-12-20T15:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Content title',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Content scheduled successfully',
  })
  message: string;
}
