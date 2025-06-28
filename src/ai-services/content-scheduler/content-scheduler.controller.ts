import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ContentSchedulerService } from './content-scheduler.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/auth.interface';
import {
  ScheduleContentDto,
  ContentResponseDto,
  GetScheduledContentDto,
  UpdateScheduledContentDto,
} from './dto/content-scheduler.dto';

@ApiTags('Content Scheduler')
@Controller('ai-services/content-scheduler')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContentSchedulerController {
  constructor(private contentSchedulerService: ContentSchedulerService) {}

  @Post('schedule')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule content for future publication' })
  @ApiResponse({
    status: 201,
    description: 'Content scheduled successfully',
    type: ContentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or scheduling in the past',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Service not available in subscription plan',
  })
  async scheduleContent(
    @Body() scheduleContentDto: ScheduleContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContentResponseDto> {
    return this.contentSchedulerService.scheduleContent(
      user.id,
      scheduleContentDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get scheduled content' })
  @ApiQuery({
    name: 'platform',
    required: false,
    description: 'Filter by platform',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Scheduled content retrieved successfully',
    type: [ContentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Service not available in subscription plan',
  })
  async getScheduledContent(
    @Query() queryDto: GetScheduledContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContentResponseDto[]> {
    return this.contentSchedulerService.getScheduledContent(user.id, queryDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update scheduled content' })
  @ApiParam({
    name: 'id',
    description: 'Scheduled content ID',
    example: 'schedule-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Content updated successfully',
    type: ContentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Content not found or invalid update',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Service not available in subscription plan',
  })
  async updateScheduledContent(
    @Param('id') id: string,
    @Body() updateDto: UpdateScheduledContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContentResponseDto> {
    return this.contentSchedulerService.updateScheduledContent(
      user.id,
      id,
      updateDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete scheduled content' })
  @ApiParam({
    name: 'id',
    description: 'Scheduled content ID',
    example: 'schedule-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Content deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Scheduled content deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Content not found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Service not available in subscription plan',
  })
  async deleteScheduledContent(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean; message: string }> {
    return this.contentSchedulerService.deleteScheduledContent(user.id, id);
  }
}
