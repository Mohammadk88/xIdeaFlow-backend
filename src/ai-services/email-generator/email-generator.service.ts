import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../../credits/credits.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { CreditActionType } from '@prisma/client';
import {
  GenerateEmailDto,
  EmailResponseDto,
  EmailType,
  EmailTone,
} from './dto/email-generator.dto';

@Injectable()
export class EmailGeneratorService {
  private readonly serviceName = 'email_generator_ai';
  private readonly creditCost = 4;

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async generateEmail(
    userId: string,
    generateEmailDto: GenerateEmailDto,
  ): Promise<EmailResponseDto> {
    // Get service from database
    const service = await this.prisma.service.findUnique({
      where: { name: this.serviceName },
    });

    if (!service) {
      throw new ForbiddenException('Service not found');
    }

    // Check subscription access
    const accessCheck = await this.subscriptionsService.checkServiceAccess(
      userId,
      service.id,
    );
    if (!accessCheck.hasAccess) {
      throw new ForbiddenException(
        'This service is not available in your current subscription plan',
      );
    }

    // Check and deduct credits
    const creditCheck = await this.creditsService.checkCreditAvailability(
      userId,
      this.creditCost,
    );
    if (!creditCheck.hasEnoughCredits) {
      throw new ForbiddenException('Insufficient credits');
    }

    await this.creditsService.deductCredits(
      userId,
      service.id,
      CreditActionType.GENERATE_EMAIL,
      this.creditCost,
      {
        emailType: generateEmailDto.emailType,
        subject: generateEmailDto.subject,
      },
    );

    // Track usage
    await this.subscriptionsService.incrementUsage(
      userId,
      service.id,
      accessCheck.usagePeriod || 'MONTHLY',
    );

    // Generate email content
    const generatedEmail = this.generateEmailContent(generateEmailDto);

    return generatedEmail;
  }

  private generateEmailContent(
    generateEmailDto: GenerateEmailDto,
  ): EmailResponseDto {
    const {
      emailType,
      subject,
      tone,
      targetAudience,
      keyPoints,
      callToAction,
      additionalContext,
    } = generateEmailDto;

    const emailSubject = this.generateSubject(subject, emailType, tone);
    const emailBody = this.generateBody(
      emailType,
      subject,
      tone,
      targetAudience,
      keyPoints,
      callToAction,
      additionalContext,
    );
    const previewText = this.generatePreviewText(emailBody);
    const suggestions = this.generateSuggestions(emailType, tone);

    return {
      subject: emailSubject,
      body: emailBody,
      previewText,
      suggestions,
      wordCount: emailBody.split(' ').length,
    };
  }

  private generateSubject(
    subject: string,
    emailType: EmailType,
    tone: EmailTone,
  ): string {
    let prefix = '';
    let suffix = '';

    switch (emailType) {
      case EmailType.MARKETING:
        prefix = tone === EmailTone.URGENT ? '🚨 ' : '✨ ';
        suffix = " - Don't Miss Out!";
        break;
      case EmailType.SALES:
        prefix = '💰 ';
        suffix = ' - Limited Time';
        break;
      case EmailType.NEWSLETTER:
        prefix = '📰 ';
        suffix = ' - Weekly Update';
        break;
      case EmailType.ANNOUNCEMENT:
        prefix = '🎉 ';
        suffix = ' - Official Announcement';
        break;
      default:
        prefix = '';
        suffix = '';
    }

    return `${prefix}${subject}${suffix}`;
  }

  private generateBody(
    emailType: EmailType,
    subject: string,
    tone: EmailTone,
    targetAudience?: string,
    keyPoints?: string[],
    callToAction?: string,
    additionalContext?: string,
  ): string {
    let greeting = '';
    let mainContent = '';
    let closing = '';

    // Generate greeting based on tone
    switch (tone) {
      case EmailTone.FORMAL:
        greeting = 'Dear Valued Customer,';
        break;
      case EmailTone.FRIENDLY:
        greeting = 'Hi there! 👋';
        break;
      case EmailTone.CASUAL:
        greeting = 'Hey!';
        break;
      default:
        greeting = 'Hello,';
    }

    // Generate main content based on email type
    switch (emailType) {
      case EmailType.MARKETING:
        mainContent = `We're excited to share ${subject} with you. This represents an incredible opportunity that we believe you'll find valuable.`;
        break;
      case EmailType.SALES:
        mainContent = `I wanted to personally reach out about ${subject}. Based on your interests, I think this could be exactly what you're looking for.`;
        break;
      case EmailType.NEWSLETTER:
        mainContent = `Here's your latest update on ${subject}. We've got some exciting news and insights to share with you this week.`;
        break;
      case EmailType.COLD_OUTREACH:
        mainContent = `I hope this email finds you well. I'm reaching out regarding ${subject} and how it might benefit your business.`;
        break;
      case EmailType.FOLLOW_UP:
        mainContent = `Following up on our previous conversation about ${subject}. I wanted to provide you with additional information.`;
        break;
      case EmailType.THANK_YOU:
        mainContent = `Thank you so much for ${subject}. Your support means the world to us and we truly appreciate it.`;
        break;
      case EmailType.ANNOUNCEMENT:
        mainContent = `We're thrilled to announce ${subject}! This is a significant milestone for our company.`;
        break;
    }

    // Add key points if provided
    if (keyPoints && keyPoints.length > 0) {
      mainContent += '\n\nHere are the key highlights:\n';
      keyPoints.forEach((point, index) => {
        mainContent += `\n${index + 1}. ${point}`;
      });
    }

    // Add target audience context
    if (targetAudience) {
      mainContent += `\n\nThis is especially relevant for ${targetAudience}.`;
    }

    // Add additional context
    if (additionalContext) {
      mainContent += `\n\n${additionalContext}`;
    }

    // Generate closing
    if (callToAction) {
      closing = `\n\n${callToAction}\n\nBest regards,\nThe Team`;
    } else {
      switch (emailType) {
        case EmailType.MARKETING:
        case EmailType.SALES:
          closing =
            '\n\nReady to get started? Click the link below!\n\nBest regards,\nThe Team';
          break;
        default:
          closing = '\n\nThank you for your time.\n\nBest regards,\nThe Team';
      }
    }

    return `${greeting}\n\n${mainContent}${closing}`;
  }

  private generatePreviewText(body: string): string {
    const firstSentence = body.split('\n')[2] || body.split('\n')[0];
    return firstSentence.substring(0, 100) + '...';
  }

  private generateSuggestions(emailType: EmailType, tone: EmailTone): string[] {
    const suggestions = ['Personalize with recipient name'];

    switch (emailType) {
      case EmailType.MARKETING:
        suggestions.push(
          'A/B test subject lines',
          'Send during optimal hours (10-11 AM)',
          'Include clear call-to-action buttons',
        );
        break;
      case EmailType.SALES:
        suggestions.push(
          'Follow up within 48 hours',
          'Include social proof or testimonials',
          'Keep it concise and focused',
        );
        break;
      case EmailType.NEWSLETTER:
        suggestions.push(
          'Maintain consistent branding',
          'Include unsubscribe link',
          'Use engaging visuals',
        );
        break;
      default:
        suggestions.push(
          'Proofread before sending',
          'Use mobile-friendly design',
        );
    }

    return suggestions;
  }
}
