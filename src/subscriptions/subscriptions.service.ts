import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/subscription.dto';
import { UsagePeriod } from '../common/types';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async createPlan(createPlanDto: CreatePlanDto) {
    const { services, ...planData } = createPlanDto;

    const plan = await this.prisma.subscriptionPlan.create({
      data: planData,
    });

    // Add services to the plan if provided
    if (services && services.length > 0) {
      await this.prisma.planService.createMany({
        data: services.map((service) => ({
          planId: plan.id,
          serviceId: service.serviceId,
          usageLimit: service.usageLimit,
          usagePeriod: service.usagePeriod,
        })),
      });
    }

    return this.findPlanById(plan.id);
  }

  async getAllPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      include: {
        planServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { price: 'asc' },
    });
  }

  async findPlanById(id: string) {
    return this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        planServices: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async findPlanByName(name: string) {
    return this.prisma.subscriptionPlan.findUnique({
      where: { name },
      include: {
        planServices: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async getUserActiveSubscription(userId: string) {
    return this.prisma.userSubscription.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
      include: {
        plan: {
          include: {
            planServices: {
              include: {
                service: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkServiceAccess(userId: string, serviceId: string) {
    const subscription = await this.getUserActiveSubscription(userId);

    if (!subscription) {
      return { hasAccess: false, isUnlimited: false, limit: 0 };
    }

    const planService = subscription.plan.planServices.find(
      (ps) => ps.serviceId === serviceId,
    );

    if (!planService) {
      return { hasAccess: false, isUnlimited: false, limit: 0 };
    }

    return {
      hasAccess: true,
      isUnlimited: planService.usageLimit === -1,
      limit: planService.usageLimit,
      usagePeriod: planService.usagePeriod,
    };
  }

  async getCurrentUsage(
    userId: string,
    serviceId: string,
    period: UsagePeriod,
  ) {
    const now = new Date();
    let periodString: string;

    switch (period) {
      case UsagePeriod.DAILY:
        periodString = now.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case UsagePeriod.WEEKLY:
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        periodString = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;
        break;
      case UsagePeriod.MONTHLY:
        periodString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        periodString = now.toISOString().split('T')[0];
    }

    const usage = await this.prisma.userServiceUsage.findUnique({
      where: {
        userId_serviceId_period_usagePeriod: {
          userId,
          serviceId,
          period: periodString,
          usagePeriod: period,
        },
      },
    });

    return usage?.usageCount || 0;
  }

  async incrementUsage(userId: string, serviceId: string, period: UsagePeriod) {
    const now = new Date();
    let periodString: string;

    switch (period) {
      case UsagePeriod.DAILY:
        periodString = now.toISOString().split('T')[0];
        break;
      case UsagePeriod.WEEKLY:
        periodString = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;
        break;
      case UsagePeriod.MONTHLY:
        periodString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        periodString = now.toISOString().split('T')[0];
    }

    await this.prisma.userServiceUsage.upsert({
      where: {
        userId_serviceId_period_usagePeriod: {
          userId,
          serviceId,
          period: periodString,
          usagePeriod: period,
        },
      },
      update: {
        usageCount: { increment: 1 },
      },
      create: {
        userId,
        serviceId,
        period: periodString,
        usagePeriod: period,
        usageCount: 1,
      },
    });
  }

  async createUserSubscription(
    userId: string,
    planId: string,
    paddleSubscriptionId?: string,
    paddleCustomerId?: string,
  ) {
    // Deactivate existing subscriptions
    await this.prisma.userSubscription.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    const plan = await this.findPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const endDate = plan.isRecurring
      ? null
      : new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

    const subscription = await this.prisma.userSubscription.create({
      data: {
        userId,
        planId,
        endDate,
        paddleSubscriptionId,
        paddleCustomerId,
        isActive: true,
      },
      include: {
        plan: {
          include: {
            planServices: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    // Update user credit plan type
    await this.prisma.userCredit.update({
      where: { userId },
      data: { planType: 'SUBSCRIPTION' },
    });

    // Add monthly credits if plan includes them
    if (plan.creditsIncluded > 0) {
      await this.prisma.userCredit.update({
        where: { userId },
        data: {
          totalCredits: { increment: plan.creditsIncluded },
        },
      });
    }

    return subscription;
  }

  async cancelSubscription(userId: string) {
    return this.prisma.userSubscription.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, autoRenew: false },
    });
  }
}
