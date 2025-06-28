import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../../credits/credits.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { CreditActionType } from '@prisma/client';
import {
  GenerateVoiceScriptDto,
  VoiceScriptResponseDto,
  ScriptSectionDto,
  ScriptType,
  VoiceStyle,
} from './dto/voice-script-writer.dto';

@Injectable()
export class VoiceScriptWriterService {
  private readonly serviceName = 'ai_voice_script_writer';
  private readonly creditCost = 5;

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async generateVoiceScript(
    userId: string,
    generateDto: GenerateVoiceScriptDto,
  ): Promise<VoiceScriptResponseDto> {
    const service = await this.prisma.service.findUnique({
      where: { name: this.serviceName },
    });

    if (!service) {
      throw new ForbiddenException('Service not found');
    }

    const accessCheck = await this.subscriptionsService.checkServiceAccess(
      userId,
      service.id,
    );
    if (!accessCheck.hasAccess) {
      throw new ForbiddenException(
        'This service is not available in your current subscription plan',
      );
    }

    const creditCheck = await this.creditsService.checkCreditAvailability(
      userId,
      this.creditCost,
    );
    if (!creditCheck.hasEnoughCredits) {
      throw new ForbiddenException(creditCheck.message);
    }

    const scriptData = this.generateMockVoiceScript(generateDto);

    await this.creditsService.deductCredits(
      userId,
      service.id,
      CreditActionType.GENERATE_VOICE_SCRIPT,
      this.creditCost,
      {
        topic: generateDto.topic,
        scriptType: generateDto.scriptType,
        length: generateDto.length,
        wordCount: scriptData.wordCount,
      },
    );

    if (accessCheck.hasAccess) {
      await this.subscriptionsService.incrementUsage(
        userId,
        service.id,
        accessCheck.usagePeriod!,
      );
    }

    return {
      ...scriptData,
      creditsUsed: this.creditCost,
      success: true,
      message: 'Voice script generated successfully',
    };
  }

  private generateMockVoiceScript(
    dto: GenerateVoiceScriptDto,
  ): Omit<VoiceScriptResponseDto, 'creditsUsed' | 'success' | 'message'> {
    const sections = this.createScriptSections(dto);
    const fullScript = sections.map((section) => section.content).join('\n\n');
    const totalDuration = sections.reduce(
      (total, section) => total + section.duration,
      0,
    );
    const wordCount = this.countWords(fullScript);

    return {
      topic: dto.topic,
      scriptType: dto.scriptType,
      sections,
      fullScript,
      totalDuration,
      wordCount,
      deliveryTips: this.getDeliveryTips(dto.voiceStyle),
      recordingNotes: this.getRecordingNotes(dto.scriptType),
    };
  }

  private createScriptSections(
    dto: GenerateVoiceScriptDto,
  ): ScriptSectionDto[] {
    const sections: ScriptSectionDto[] = [];
    const readingSpeed = dto.readingSpeed || 150; // words per minute

    // Introduction section
    sections.push(this.createIntroSection(dto, readingSpeed));

    // Main content sections based on key points
    dto.keyPoints.forEach((point, index) => {
      sections.push(this.createContentSection(point, dto, index, readingSpeed));
    });

    // Conclusion section
    sections.push(this.createConclusionSection(dto, readingSpeed));

    return sections;
  }

  private createIntroSection(
    dto: GenerateVoiceScriptDto,
    readingSpeed: number,
  ): ScriptSectionDto {
    const introTexts = {
      [ScriptType.PODCAST]: `Welcome to today's episode! I'm excited to talk with you about ${dto.topic}.`,
      [ScriptType.VOICEOVER]: `In this presentation, we'll explore ${dto.topic} and its impact on ${dto.audience}.`,
      [ScriptType.COMMERCIAL]: `Attention ${dto.audience}! Discover how ${dto.topic} can transform your experience.`,
      [ScriptType.EXPLAINER_VIDEO]: `Have you ever wondered about ${dto.topic}? Today, we'll break it down in simple terms for ${dto.audience}.`,
      [ScriptType.YOUTUBE_VIDEO]: `Hey everyone! Welcome back to our channel. Today's video is all about ${dto.topic}.`,
      [ScriptType.TRAINING]: `Welcome to this training session on ${dto.topic}. By the end, you'll have a clear understanding of the key concepts.`,
    };

    const content =
      (introTexts[dto.scriptType] as string) ||
      `Welcome! Today we're discussing ${dto.topic}.`;
    const wordCount = this.countWords(content);
    const duration = Math.round((wordCount / readingSpeed) * 60);

    return {
      title: 'Introduction',
      content,
      duration,
      voiceNotes: this.getVoiceStyleNotes(dto.voiceStyle, 'introduction'),
    };
  }

  private createContentSection(
    keyPoint: string,
    dto: GenerateVoiceScriptDto,
    index: number,
    readingSpeed: number,
  ): ScriptSectionDto {
    const sectionContent = this.generateSectionContent(keyPoint, dto);
    const wordCount = this.countWords(sectionContent);
    const duration = Math.round((wordCount / readingSpeed) * 60);

    return {
      title: `Section ${index + 1}: ${keyPoint}`,
      content: sectionContent,
      duration,
      voiceNotes: this.getVoiceStyleNotes(dto.voiceStyle, 'content'),
    };
  }

  private createConclusionSection(
    dto: GenerateVoiceScriptDto,
    readingSpeed: number,
  ): ScriptSectionDto {
    const brand = dto.brandName || 'our team';
    const cta = dto.callToAction || 'Thank you for listening!';

    const content = `To wrap up, ${dto.topic} offers incredible opportunities for ${dto.audience}. ${cta} From all of us at ${brand}, thanks for your time and attention.`;

    const wordCount = this.countWords(content);
    const duration = Math.round((wordCount / readingSpeed) * 60);

    return {
      title: 'Conclusion',
      content,
      duration,
      voiceNotes: this.getVoiceStyleNotes(dto.voiceStyle, 'conclusion'),
    };
  }

  private generateSectionContent(
    keyPoint: string,
    dto: GenerateVoiceScriptDto,
  ): string {
    const templates = [
      `Let's dive into ${keyPoint}. This is particularly important for ${dto.audience} because it directly impacts how you approach your daily challenges.`,
      `Now, when we talk about ${keyPoint}, we need to understand its practical applications. For ${dto.audience}, this means new opportunities to improve and grow.`,
      `Here's what you need to know about ${keyPoint}: it's not just theory, but a practical solution that ${dto.audience} can implement right away.`,
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];

    // Add keywords naturally if provided
    if (dto.keywords && dto.keywords.length > 0) {
      const relevantKeywords = dto.keywords.slice(0, 2);
      return `${template} Key concepts like ${relevantKeywords.join(' and ')} play a crucial role in understanding this topic.`;
    }

    return template;
  }

  private getVoiceStyleNotes(style: VoiceStyle, section: string): string {
    const styleNotes: Record<VoiceStyle, Record<string, string>> = {
      [VoiceStyle.CONVERSATIONAL]: {
        introduction: 'Speak warmly as if talking to a friend',
        content: 'Maintain a natural, flowing pace with occasional pauses',
        conclusion: 'End with genuine appreciation and warmth',
      },
      [VoiceStyle.PROFESSIONAL]: {
        introduction: 'Begin with clear, confident delivery',
        content: 'Speak with authority while remaining approachable',
        conclusion: 'Close with professional confidence',
      },
      [VoiceStyle.ENERGETIC]: {
        introduction: 'Start with enthusiasm and high energy',
        content: 'Maintain excitement while staying clear',
        conclusion: 'End with motivational energy',
      },
      [VoiceStyle.CALM]: {
        introduction: 'Begin with steady, reassuring tone',
        content: 'Speak slowly and deliberately',
        conclusion: 'Close with peaceful, satisfied tone',
      },
      [VoiceStyle.CASUAL]: {
        introduction: 'Start with relaxed, informal tone',
        content: 'Keep it light and easy-going',
        conclusion: 'End with friendly, laid-back tone',
      },
      [VoiceStyle.AUTHORITATIVE]: {
        introduction: 'Begin with commanding presence',
        content: 'Speak with strong conviction and expertise',
        conclusion: 'Close with definitive authority',
      },
      [VoiceStyle.FRIENDLY]: {
        introduction: 'Start with warm, welcoming tone',
        content: 'Maintain approachable and kind delivery',
        conclusion: 'End with sincere friendliness',
      },
      [VoiceStyle.DRAMATIC]: {
        introduction: 'Begin with compelling, theatrical delivery',
        content: 'Use dynamic emphasis and emotional range',
        conclusion: 'Close with powerful, memorable impact',
      },
    };

    return styleNotes[style]?.[section] || 'Speak clearly and at a steady pace';
  }

  private getDeliveryTips(style: VoiceStyle): string[] {
    const tips = {
      [VoiceStyle.CONVERSATIONAL]: [
        'Use natural inflection and rhythm',
        'Include brief pauses for emphasis',
        'Vary your pace to maintain interest',
      ],
      [VoiceStyle.PROFESSIONAL]: [
        'Maintain consistent volume and pace',
        'Emphasize key points with slight pitch changes',
        'Pause at commas and periods',
      ],
      [VoiceStyle.ENERGETIC]: [
        'Use dynamic range in volume and pitch',
        'Speak slightly faster than normal',
        'Express enthusiasm through voice modulation',
      ],
      [VoiceStyle.CALM]: [
        'Speak slowly and deliberately',
        'Use gentle, soothing tones',
        'Take longer pauses between sections',
      ],
    };

    return (
      (tips[style] as string[]) || [
        'Speak clearly and distinctly',
        'Maintain steady pacing',
        'Use appropriate emphasis',
      ]
    );
  }

  private getRecordingNotes(scriptType: ScriptType): string[] {
    const notes = {
      [ScriptType.PODCAST]: [
        'Use good quality microphone',
        'Record in quiet environment',
        'Leave room for editing between sections',
      ],
      [ScriptType.VOICEOVER]: [
        'Sync timing with visual elements',
        'Leave space for transitions',
        'Maintain consistent distance from microphone',
      ],
      [ScriptType.COMMERCIAL]: [
        'Emphasize call-to-action',
        'Record multiple takes of key phrases',
        'Keep energy high throughout',
      ],
    };

    return (
      (notes[scriptType] as string[]) || [
        'Use clear articulation',
        'Maintain consistent audio levels',
        'Record in sections for easier editing',
      ]
    );
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }
}
