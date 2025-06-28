import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import {
  ScheduleContentDto,
  ContentResponseDto,
  GetScheduledContentDto,
  UpdateScheduledContentDto,
  ContentPlatform,
  ContentStatus,
} from './dto/content-scheduler.dto';

@Injectable()
export class ContentSchedulerService {
  private readonly serviceName = 'content_scheduler';

  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async scheduleContent(
    userId: string,
    scheduleDto: ScheduleContentDto,
  ): Promise<ContentResponseDto> {
    // Get service from database
    const service = await this.prisma.service.findUnique({
      where: { name: this.serviceName },
    });

    if (!service) {
      throw new ForbiddenException('Service not found');
    }

    // Check subscription access (Content Scheduler is free - 0 credits)
    const accessCheck = await this.subscriptionsService.checkServiceAccess(
      userId,
      service.id,
    );
    if (!accessCheck.hasAccess) {
      throw new ForbiddenException(
        'This service is not available in your current subscription plan',
      );
    }

    // Validate scheduled date
    const scheduledDate = new Date(scheduleDto.scheduledAt);
    const now = new Date();

    if (scheduledDate <= now) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    // Create scheduled content entry
    const scheduledContent = await this.prisma.scheduledContent.create({
      data: {
        userId,
        content: scheduleDto.content,
        platform: scheduleDto.platform ? scheduleDto.platform.toUpperCase() : '',
        scheduledAt: scheduledDate,
        title: scheduleDto.title || '',
        status: ContentStatus.SCHEDULED,
      },
    });

    // Track usage for subscription users
    if (accessCheck.hasAccess) {
      await this.subscriptionsService.incrementUsage(
        userId,
        service.id,
        accessCheck.usagePeriod!,
      );
    }

    return {
      id: scheduledContent.id,
      content: scheduledContent.content || '',
      platform: scheduledContent.platform as ContentPlatform,
      scheduledAt: scheduledContent.scheduledAt.toISOString(),
      status: scheduledContent.status as ContentStatus,
      title: scheduledContent.title || undefined,
      createdAt: scheduledContent.createdAt.toISOString(),
      success: true,
      message: 'Content scheduled successfully',
    };
  }

  async getScheduledContent(
    userId: string,
    queryDto: GetScheduledContentDto,
  ): Promise<ContentResponseDto[]> {
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

    const whereClause: {
      userId: string;
      platform?: string;
      status?: string;
    } = { userId };

    if (queryDto.platform) {
      whereClause.platform = queryDto.platform.toUpperCase();
    }

    if (queryDto.status) {
      whereClause.status = queryDto.status;
    }

    const scheduledContents = await this.prisma.scheduledContent.findMany({
      where: whereClause,
      orderBy: { scheduledAt: 'asc' },
    });

    return scheduledContents.map((content) => ({
      id: content.id,
      content: content.content || '',
      platform: content.platform as ContentPlatform,
      scheduledAt: content.scheduledAt.toISOString(),
      status: content.status as ContentStatus,
      title: content.title || undefined,
      createdAt: content.createdAt.toISOString(),
      success: true,
      message: 'Content retrieved successfully',
    }));
  }

  async updateScheduledContent(
    userId: string,
    id: string,
    updateDto: UpdateScheduledContentDto,
  ): Promise<ContentResponseDto> {
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

    // Check if content exists and belongs to user
    const existingContent = await this.prisma.scheduledContent.findFirst({
      where: { id, userId },
    });

    if (!existingContent) {
      throw new BadRequestException('Scheduled content not found');
    }

    // Validate new scheduled date if provided
    if (updateDto.scheduledAt) {
      const scheduledDate = new Date(updateDto.scheduledAt);
      const now = new Date();

      if (scheduledDate <= now) {
        throw new BadRequestException('Scheduled time must be in the future');
      }
    }

    const updateData: any = {};
    if (updateDto.content) updateData.content = updateDto.content;
    if (updateDto.platform)
      updateData.platform = updateDto.platform.toUpperCase();
    if (updateDto.scheduledAt)
      updateData.scheduledAt = new Date(updateDto.scheduledAt);
    if (updateDto.title !== undefined) updateData.title = updateDto.title;
    if (updateDto.status) updateData.status = updateDto.status;

    const updatedContent = await this.prisma.scheduledContent.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updatedContent.id,
      content: updatedContent.content,
      platform: updatedContent.platform as ContentPlatform,
      scheduledAt: updatedContent.scheduledAt.toISOString(),
      status: updatedContent.status as ContentStatus,
      title: updatedContent.title || undefined,
      createdAt: updatedContent.createdAt.toISOString(),
      success: true,
      message: 'Content updated successfully',
    };
  }

  async deleteScheduledContent(
    userId: string,
    id: string,
  ): Promise<{ success: boolean; message: string }> {
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

    // Check if content exists and belongs to user
    const existingContent = await this.prisma.scheduledContent.findFirst({
      where: { id, userId },
    });

    if (!existingContent) {
      throw new BadRequestException('Scheduled content not found');
    }

    await this.prisma.scheduledContent.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Scheduled content deleted successfully',
    };
  }
}
