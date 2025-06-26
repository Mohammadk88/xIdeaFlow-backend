import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { TransactionType, TransactionStatus } from '../common/types';

export interface PaddleWebhookEvent {
  alert_id: string;
  alert_name: string;
  balance_currency: string;
  balance_earnings: string;
  balance_fee: string;
  balance_gross: string;
  balance_tax: string;
  checkout_id: string;
  country: string;
  coupon: string;
  currency: string;
  customer_name: string;
  earnings: string;
  email: string;
  event_time: string;
  fee: string;
  gross: string;
  initial_payment: string;
  instalments: string;
  marketing_consent: string;
  next_bill_date: string;
  order_id: string;
  passthrough?: string;
  payment_method: string;
  payment_tax: string;
  product_id: string;
  product_name: string;
  quantity: string;
  receipt_url: string;
  sale_gross: string;
  status: string;
  subscription_id?: string;
  subscription_plan_id?: string;
  unit_price: string;
  user_id: string;
  p_signature: string;
}

interface PaddleApiResponse {
  success: boolean;
  response?: {
    url?: string;
    [key: string]: any;
  };
  error?: {
    code: number;
    message: string;
  };
}

@Injectable()
export class PaddleService {
  private readonly logger = new Logger(PaddleService.name);
  private readonly paddleApiUrl: string;
  private readonly vendorId: string;
  private readonly apiKey: string;
  private readonly publicKey: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.vendorId = this.configService.get<string>('PADDLE_VENDOR_ID') || '';
    this.apiKey = this.configService.get<string>('PADDLE_API_KEY') || '';
    this.publicKey = this.configService.get<string>('PADDLE_PUBLIC_KEY') || '';

    const environment =
      this.configService.get<string>('PADDLE_ENVIRONMENT') || 'sandbox';
    this.paddleApiUrl =
      environment === 'production'
        ? 'https://vendors.paddle.com/api'
        : 'https://sandbox-vendors.paddle.com/api';
  }

  /**
   * Create a Paddle checkout link for subscription plans
   */
  async createSubscriptionCheckout(
    userId: string,
    planId: string,
    userEmail: string,
  ): Promise<{ checkout_url: string }> {
    try {
      // Get plan details
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan || !plan.paddlePlanId) {
        throw new BadRequestException(
          'Plan not found or not configured for Paddle',
        );
      }

      const checkoutData = {
        vendor_id: parseInt(this.vendorId),
        product_id: parseInt(plan.paddlePlanId || '0'),
        customer_email: userEmail,
        passthrough: JSON.stringify({
          userId,
          planId,
          type: 'subscription',
        }),
        success_url: `${this.configService.get('FRONTEND_URL')}/subscription/success`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/subscription/cancel`,
      };

      const response = await axios.post<PaddleApiResponse>(
        `${this.paddleApiUrl}/2.0/product/generate_pay_link`,
        {
          ...checkoutData,
          vendor_auth_code: this.apiKey,
        },
      );

      if (!response.data.success || !response.data.response?.url) {
        throw new BadRequestException('Failed to create Paddle checkout');
      }

      return {
        checkout_url: response.data.response.url,
      };
    } catch (error) {
      this.logger.error('Failed to create Paddle subscription checkout', error);
      throw new BadRequestException('Failed to create checkout session');
    }
  }

  /**
   * Create a Paddle checkout link for credit purchases
   */
  async createCreditCheckout(
    userId: string,
    credits: number,
    userEmail: string,
  ): Promise<{ checkout_url: string; transaction_id: string }> {
    try {
      // Create pending transaction
      const transaction = await this.prisma.creditTransaction.create({
        data: {
          userId,
          type: TransactionType.PURCHASE,
          amount: credits,
          status: TransactionStatus.PENDING,
          description: `Purchase ${credits} credits`,
        },
      });

      // Calculate price (e.g., $0.01 per credit)
      const priceInCents = credits * 1; // $0.01 per credit

      const checkoutData = {
        vendor_id: parseInt(this.vendorId),
        title: `xIdeaFlow Credits - ${credits} credits`,
        webhook_url: `${this.configService.get('BACKEND_URL')}/paddle/webhook`,
        prices: [`USD:${(priceInCents / 100).toFixed(2)}`],
        customer_email: userEmail,
        passthrough: JSON.stringify({
          userId,
          credits,
          transactionId: transaction.id,
          type: 'credits',
        }),
        success_url: `${this.configService.get('FRONTEND_URL')}/credits/success`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/credits/cancel`,
      };

      const response = await axios.post<PaddleApiResponse>(
        `${this.paddleApiUrl}/2.0/product/generate_pay_link`,
        {
          ...checkoutData,
          vendor_auth_code: this.apiKey,
        },
      );

      if (!response.data.success || !response.data.response?.url) {
        throw new BadRequestException('Failed to create Paddle checkout');
      }

      // Update transaction with checkout ID
      await this.prisma.creditTransaction.update({
        where: { id: transaction.id },
        data: { paddleCheckoutId: response.data.response.url },
      });

      return {
        checkout_url: response.data.response.url,
        transaction_id: transaction.id,
      };
    } catch (error) {
      this.logger.error('Failed to create Paddle credit checkout', error);
      throw new BadRequestException('Failed to create checkout session');
    }
  }

  /**
   * Verify Paddle webhook signature
   */
  verifyWebhookSignature(body: Record<string, any>): boolean {
    try {
      // Extract signature from body
      const { p_signature, ...dataToVerify } = body;

      // Sort keys alphabetically and create query string
      const sortedKeys = Object.keys(dataToVerify).sort();
      const queryString = sortedKeys
        .map((key) => `${key}=${dataToVerify[key] as string}`)
        .join('&');

      // Verify signature using Paddle's public key
      const verifier = crypto.createVerify('sha1');
      verifier.update(queryString);

      // Convert base64 signature to buffer
      const signatureBuffer = Buffer.from(p_signature as string, 'base64');

      return verifier.verify(this.publicKey, signatureBuffer);
    } catch (error) {
      this.logger.error('Failed to verify webhook signature', error);
      return false;
    }
  }

  /**
   * Handle Paddle webhook events
   */
  async handleWebhook(webhookData: PaddleWebhookEvent): Promise<void> {
    this.logger.log(`Processing Paddle webhook: ${webhookData.alert_name}`);

    try {
      switch (webhookData.alert_name) {
        case 'payment_succeeded':
          await this.handlePaymentSucceeded(webhookData);
          break;
        case 'subscription_created':
          await this.handleSubscriptionCreated(webhookData);
          break;
        case 'subscription_updated':
          await this.handleSubscriptionUpdated(webhookData);
          break;
        case 'subscription_cancelled':
          await this.handleSubscriptionCancelled(webhookData);
          break;
        case 'subscription_payment_succeeded':
          await this.handleSubscriptionPaymentSucceeded(webhookData);
          break;
        default:
          this.logger.warn(
            `Unhandled webhook event: ${webhookData.alert_name}`,
          );
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle webhook ${webhookData.alert_name}`,
        error,
      );
      throw error;
    }
  }

  private async handlePaymentSucceeded(
    data: PaddleWebhookEvent,
  ): Promise<void> {
    if (!data.passthrough) return;

    const passthrough = JSON.parse(data.passthrough);

    if (passthrough.type === 'credits') {
      // Handle credit purchase
      const transaction = await this.prisma.creditTransaction.findUnique({
        where: { id: passthrough.transactionId },
      });

      if (transaction && transaction.status === TransactionStatus.PENDING) {
        // Update transaction status
        await this.prisma.creditTransaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.COMPLETED,
            paddlePaymentId: data.order_id,
          },
        });

        // Add credits to user
        await this.prisma.userCredit.update({
          where: { userId: passthrough.userId },
          data: {
            totalCredits: { increment: passthrough.credits },
          },
        });

        this.logger.log(
          `Added ${passthrough.credits} credits to user ${passthrough.userId}`,
        );
      }
    }
  }

  private async handleSubscriptionCreated(
    data: PaddleWebhookEvent,
  ): Promise<void> {
    if (!data.passthrough) return;

    const passthrough = JSON.parse(data.passthrough);

    if (passthrough.type === 'subscription') {
      // Deactivate existing subscriptions
      await this.prisma.userSubscription.updateMany({
        where: { userId: passthrough.userId, isActive: true },
        data: { isActive: false },
      });

      // Create new subscription
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: passthrough.planId },
      });

      if (plan) {
        const endDate = plan.isRecurring
          ? null
          : new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

        await this.prisma.userSubscription.create({
          data: {
            userId: passthrough.userId,
            planId: passthrough.planId,
            endDate,
            paddleSubscriptionId: data.subscription_id,
            paddleCustomerId: data.user_id,
            isActive: true,
          },
        });

        // Update user credit plan type
        await this.prisma.userCredit.update({
          where: { userId: passthrough.userId },
          data: { planType: 'SUBSCRIPTION' },
        });

        // Add monthly credits if plan includes them
        if (plan.creditsIncluded > 0) {
          await this.prisma.userCredit.update({
            where: { userId: passthrough.userId },
            data: {
              totalCredits: { increment: plan.creditsIncluded },
            },
          });
        }

        this.logger.log(`Created subscription for user ${passthrough.userId}`);
      }
    }
  }

  private async handleSubscriptionUpdated(
    data: PaddleWebhookEvent,
  ): Promise<void> {
    if (data.subscription_id) {
      await this.prisma.userSubscription.updateMany({
        where: { paddleSubscriptionId: data.subscription_id },
        data: {
          isActive: data.status === 'active',
          endDate: data.next_bill_date ? new Date(data.next_bill_date) : null,
        },
      });

      this.logger.log(`Updated subscription ${data.subscription_id}`);
    }
  }

  private async handleSubscriptionCancelled(
    data: PaddleWebhookEvent,
  ): Promise<void> {
    if (data.subscription_id) {
      // Deactivate subscription
      await this.prisma.userSubscription.updateMany({
        where: { paddleSubscriptionId: data.subscription_id },
        data: {
          isActive: false,
          autoRenew: false,
        },
      });

      // Find user and downgrade to free plan
      const subscription = await this.prisma.userSubscription.findFirst({
        where: { paddleSubscriptionId: data.subscription_id },
        include: { user: true },
      });

      if (subscription) {
        await this.prisma.userCredit.update({
          where: { userId: subscription.userId },
          data: { planType: 'FREE' },
        });

        this.logger.log(
          `Cancelled subscription for user ${subscription.userId}`,
        );
      }
    }
  }

  private async handleSubscriptionPaymentSucceeded(
    data: PaddleWebhookEvent,
  ): Promise<void> {
    if (data.subscription_id) {
      // Find subscription and add monthly credits if applicable
      const subscription = await this.prisma.userSubscription.findFirst({
        where: { paddleSubscriptionId: data.subscription_id },
        include: { plan: true },
      });

      if (subscription && subscription.plan.creditsIncluded > 0) {
        await this.prisma.userCredit.update({
          where: { userId: subscription.userId },
          data: {
            totalCredits: { increment: subscription.plan.creditsIncluded },
          },
        });

        this.logger.log(`Added monthly credits to user ${subscription.userId}`);
      }
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const response = await axios.post<PaddleApiResponse>(
        `${this.paddleApiUrl}/2.0/subscription/users_cancel`,
        {
          vendor_id: this.vendorId,
          vendor_auth_code: this.apiKey,
          subscription_id: subscriptionId,
        },
      );

      if (!response.data.success) {
        throw new BadRequestException('Failed to cancel subscription');
      }

      this.logger.log(`Cancelled Paddle subscription: ${subscriptionId}`);
    } catch (error) {
      this.logger.error('Failed to cancel Paddle subscription', error);
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  /**
   * Get subscription details from Paddle
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await axios.post<PaddleApiResponse>(
        `${this.paddleApiUrl}/2.0/subscription/users`,
        {
          vendor_id: this.vendorId,
          vendor_auth_code: this.apiKey,
          subscription_id: subscriptionId,
        },
      );

      if (!response.data.success) {
        throw new BadRequestException('Failed to get subscription details');
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to get Paddle subscription', error);
      throw new BadRequestException('Failed to get subscription details');
    }
  }
}
