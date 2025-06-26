import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { PaddleService, PaddleWebhookEvent } from './paddle.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/auth.interface';

@ApiTags('paddle')
@Controller('paddle')
export class PaddleController {
  private readonly logger = new Logger(PaddleController.name);

  constructor(private paddleService: PaddleService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Paddle webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook' })
  async handleWebhook(@Req() req: Request, @Body() body: any): Promise<void> {
    this.logger.log('Received Paddle webhook');

    try {
      // Verify webhook signature
      const isValid = this.paddleService.verifyWebhookSignature(body);

      if (!isValid) {
        throw new BadRequestException('Invalid webhook signature');
      }

      // Process webhook event
      await this.paddleService.handleWebhook(body as PaddleWebhookEvent);

      this.logger.log('Paddle webhook processed successfully');
    } catch (error) {
      this.logger.error('Failed to process Paddle webhook', error);
      throw error;
    }
  }

  @Post('subscription/create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create subscription checkout' })
  @ApiResponse({
    status: 200,
    description: 'Checkout URL created successfully',
    schema: {
      type: 'object',
      properties: {
        checkout_url: { type: 'string' },
      },
    },
  })
  async createSubscriptionCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { planId: string },
  ): Promise<{ checkout_url: string }> {
    return this.paddleService.createSubscriptionCheckout(
      user.id,
      body.planId,
      user.email,
    );
  }

  @Post('credits/purchase')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create credit purchase checkout' })
  @ApiResponse({
    status: 200,
    description: 'Checkout URL created successfully',
    schema: {
      type: 'object',
      properties: {
        checkout_url: { type: 'string' },
        transaction_id: { type: 'string' },
      },
    },
  })
  async createCreditCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { credits: number },
  ): Promise<{ checkout_url: string; transaction_id: string }> {
    if (!body.credits || body.credits <= 0) {
      throw new BadRequestException('Credits must be a positive number');
    }

    return this.paddleService.createCreditCheckout(
      user.id,
      body.credits,
      user.email,
    );
  }

  @Post('subscription/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel user subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  async cancelSubscription(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    // Find user's active subscription
    const subscription = await this.paddleService[
      'prisma'
    ].userSubscription.findFirst({
      where: { userId: user.id, isActive: true },
    });

    if (!subscription || !subscription.paddleSubscriptionId) {
      throw new BadRequestException('No active subscription found');
    }

    await this.paddleService.cancelSubscription(
      subscription.paddleSubscriptionId,
    );

    return { message: 'Subscription cancelled successfully' };
  }
}
