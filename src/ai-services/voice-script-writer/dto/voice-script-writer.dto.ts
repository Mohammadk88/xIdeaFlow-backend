import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';

export enum ScriptType {
  PODCAST = 'podcast',
  VOICEOVER = 'voiceover',
  PRESENTATION = 'presentation',
  COMMERCIAL = 'commercial',
  AUDIOBOOK = 'audiobook',
  TRAINING = 'training',
  EXPLAINER_VIDEO = 'explainer_video',
  YOUTUBE_VIDEO = 'youtube_video',
}

export enum VoiceStyle {
  CONVERSATIONAL = 'conversational',
  PROFESSIONAL = 'professional',
  CASUAL = 'casual',
  ENERGETIC = 'energetic',
  CALM = 'calm',
  AUTHORITATIVE = 'authoritative',
  FRIENDLY = 'friendly',
  DRAMATIC = 'dramatic',
}

export enum ScriptLength {
  SHORT = 'short', // 30-60 seconds
  MEDIUM = 'medium', // 1-3 minutes
  LONG = 'long', // 3-10 minutes
  EXTENDED = 'extended', // 10+ minutes
}

export class GenerateVoiceScriptDto {
  @ApiProperty({
    description: 'Main topic or subject of the script',
    example: 'Introduction to artificial intelligence for beginners',
  })
  @IsString()
  topic: string;

  @ApiProperty({
    description: 'Type of voice script needed',
    enum: ScriptType,
    example: ScriptType.EXPLAINER_VIDEO,
  })
  @IsEnum(ScriptType)
  scriptType: ScriptType;

  @ApiProperty({
    description: 'Target audience for the script',
    example: 'Technology newcomers and business professionals',
  })
  @IsString()
  audience: string;

  @ApiProperty({
    description: 'Desired voice style and tone',
    enum: VoiceStyle,
    example: VoiceStyle.CONVERSATIONAL,
  })
  @IsEnum(VoiceStyle)
  voiceStyle: VoiceStyle;

  @ApiProperty({
    description: 'Target length of the script',
    enum: ScriptLength,
    example: ScriptLength.MEDIUM,
  })
  @IsEnum(ScriptLength)
  length: ScriptLength;

  @ApiProperty({
    description: 'Key points to cover in the script',
    example: ['What is AI', 'Real-world applications', 'Getting started tips'],
  })
  @IsArray()
  @IsString({ each: true })
  keyPoints: string[];

  @ApiProperty({
    description: 'Call-to-action for the script',
    example: 'Subscribe for more AI tutorials',
    required: false,
  })
  @IsOptional()
  @IsString()
  callToAction?: string;

  @ApiProperty({
    description: 'Specific requirements or constraints',
    example: 'Include a personal story, avoid technical jargon',
    required: false,
  })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiProperty({
    description: 'Brand or speaker name to mention',
    example: 'TechEasy Solutions',
    required: false,
  })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiProperty({
    description: 'Keywords to include naturally',
    example: ['artificial intelligence', 'machine learning', 'automation'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiProperty({
    description: 'Estimated reading speed (words per minute)',
    minimum: 100,
    maximum: 200,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(200)
  readingSpeed?: number;
}

export class ScriptSectionDto {
  @ApiProperty({
    description: 'Section title or purpose',
    example: 'Introduction',
  })
  title: string;

  @ApiProperty({
    description: 'Script content for this section',
    example: 'Welcome to our AI basics series. Today, we\'ll explore how artificial intelligence is transforming the way we work and live.',
  })
  content: string;

  @ApiProperty({
    description: 'Estimated duration in seconds',
    example: 15,
  })
  duration: number;

  @ApiProperty({
    description: 'Voice direction notes',
    example: 'Speak with enthusiasm and warmth',
  })
  voiceNotes: string;
}

export class VoiceScriptResponseDto {
  @ApiProperty({
    description: 'Original topic',
    example: 'Introduction to artificial intelligence for beginners',
  })
  topic: string;

  @ApiProperty({
    description: 'Script type',
    enum: ScriptType,
    example: ScriptType.EXPLAINER_VIDEO,
  })
  scriptType: ScriptType;

  @ApiProperty({
    description: 'Complete script broken into sections',
    type: [ScriptSectionDto],
  })
  sections: ScriptSectionDto[];

  @ApiProperty({
    description: 'Full script as continuous text',
    example: 'Welcome to our AI basics series. Today, we\'ll explore how artificial intelligence is transforming...',
  })
  fullScript: string;

  @ApiProperty({
    description: 'Total estimated duration in seconds',
    example: 180,
  })
  totalDuration: number;

  @ApiProperty({
    description: 'Total word count',
    example: 300,
  })
  wordCount: number;

  @ApiProperty({
    description: 'Voice direction and delivery tips',
    example: ['Pause after key points', 'Emphasize benefits', 'End with confident tone'],
  })
  deliveryTips: string[];

  @ApiProperty({
    description: 'Technical notes for recording',
    example: ['Use clear pronunciation', 'Maintain consistent pace', 'Include 2-second pauses between sections'],
  })
  recordingNotes: string[];

  @ApiProperty({
    description: 'Credits deducted for generation',
    example: 5,
  })
  creditsUsed: number;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Voice script generated successfully',
  })
  message: string;
}
