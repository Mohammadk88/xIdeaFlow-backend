import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PaddleService } from '../paddle/paddle.service';
import {
  CreditActionType,
  TransactionType,
  TransactionStatus,
  CreditCheckResult,
} from '../common/types';

@Injectable()
export class CreditsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private paddleService: PaddleService,
  ) {}

  async getUserCredits(userId: string) {
    let userCredit = await this.prisma.userCredit.findUnique({
      where: { userId },
    });

    if (!userCredit) {
      // Create initial credit record if doesn't exist
      userCredit = await this.prisma.userCredit.create({
        data: {
          userId,
          totalCredits: 10, // Welcome bonus
          usedCredits: 0,
          planType: 'FREE',
        },
      });

      // Record bonus credit event
      await this.prisma.bonusCreditEvent.create({
        data: {
          userId,
          event: 'signup',
          credits: 10,
          description: 'Welcome bonus credits',
        },
      });
    }

    return {
      ...userCredit,
      availableCredits: userCredit.totalCredits - userCredit.usedCredits,
    };
  }

  async checkCreditAvailability(
    userId: string,
    requiredCredits: number,
  ): Promise<CreditCheckResult> {
    const userCredit = await this.getUserCredits(userId);
    const hasEnoughCredits = userCredit.availableCredits >= requiredCredits;

    return {
      hasEnoughCredits,
      requiredCredits,
      availableCredits: userCredit.availableCredits,
      message: hasEnoughCredits
        ? undefined
        : `Insufficient credits. Required: ${requiredCredits}, Available: ${userCredit.availableCredits}`,
    };
  }

  async deductCredits(
    userId: string,
    serviceId: string,
    action: CreditActionType,
    cost: number,
    result?: any,
  ) {
    const creditCheck = await this.checkCreditAvailability(userId, cost);
    if (!creditCheck.hasEnoughCredits) {
      throw new BadRequestException(creditCheck.message);
    }

    // Update user credits
    await this.prisma.userCredit.update({
      where: { userId },
      data: {
        usedCredits: {
          increment: cost,
        },
      },
    });

    // Log the usage
    await this.prisma.creditUsageLog.create({
      data: {
        userId,
        serviceId,
        action,
        cost,
        result: result ? JSON.stringify(result) : null,
        success: true,
      },
    });

    return this.getUserCredits(userId);
  }

  async addCredits(
    userId: string,
    amount: number,
    type: TransactionType = TransactionType.PURCHASE,
    description?: string,
  ) {
    // Update user credits
    await this.prisma.userCredit.update({
      where: { userId },
      data: {
        totalCredits: {
          increment: amount,
        },
      },
    });

    // Record transaction
    await this.prisma.creditTransaction.create({
      data: {
        userId,
        type,
        amount,
        status: TransactionStatus.COMPLETED,
        description,
      },
    });

    return this.getUserCredits(userId);
  }

  async purchaseCredits(
    userId: string,
    credits: number,
    userEmail: string,
  ): Promise<{ checkout_url: string; transaction_id: string }> {
    if (credits <= 0) {
      throw new BadRequestException('Credits must be greater than 0');
    }

    if (credits > 10000) {
      throw new BadRequestException(
        'Cannot purchase more than 10,000 credits at once',
      );
    }

    return this.paddleService.createCreditCheckout(userId, credits, userEmail);
  }

  async getCreditHistory(userId: string) {
    const [transactions, usageLogs] = await Promise.all([
      this.prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.creditUsageLog.findMany({
        where: { userId },
        include: { service: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { transactions, usageLogs };
  }
}
