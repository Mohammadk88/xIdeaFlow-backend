import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsagePeriod } from '@prisma/client';

@Injectable()
export class SeederService {
  constructor(private prisma: PrismaService) {}

  async seedDatabase() {
    console.log('🌱 Starting database seeding...');

    // Create services
    await this.createServices();

    // Create subscription plans
    await this.createSubscriptionPlans();

    console.log('✅ Database seeding completed!');
  }

  private async createServices() {
    console.log('Creating services...');

    const services = [
      // Existing services
      {
        name: 'content_generation',
        title: 'Content Generation',
        description: 'Generate engaging social media posts and content',
        icon: 'content-icon.svg',
        creditCost: 1,
      },
      {
        name: 'email_writer',
        title: 'Email Writer',
        description: 'Create professional emails for any purpose',
        icon: 'email-icon.svg',
        creditCost: 1,
      },
      {
        name: 'hook_generator',
        title: 'Hook Generator',
        description: 'Generate compelling hooks for your content',
        icon: 'hook-icon.svg',
        creditCost: 1,
      },
      {
        name: 'image_generator',
        title: 'Image Generator',
        description: 'Generate AI-powered images and graphics',
        icon: 'image-icon.svg',
        creditCost: 3,
      },
      {
        name: 'post_scheduler',
        title: 'Post Scheduler',
        description: 'Schedule your posts across social media platforms',
        icon: 'schedule-icon.svg',
        creditCost: 1,
      },
      // New AI services
      {
        name: 'post_generator_ai',
        title: 'Post Generator AI',
        description: 'Generate high-quality social media posts with AI',
        icon: 'post-generator-icon.svg',
        creditCost: 3,
      },
      {
        name: 'email_generator_ai',
        title: 'Email Generator AI',
        description: 'Create professional email content using AI',
        icon: 'email-ai-icon.svg',
        creditCost: 4,
      },
      {
        name: 'hook_generator_ai',
        title: 'Hook Generator AI',
        description: 'Generate attention-grabbing hooks with AI',
        icon: 'hook-ai-icon.svg',
        creditCost: 2,
      },
      {
        name: 'ai_prompt_marketplace',
        title: 'AI Prompt Marketplace',
        description: 'Access and purchase pre-made AI prompts',
        icon: 'marketplace-icon.svg',
        creditCost: 1,
      },
      {
        name: 'content_scheduler',
        title: 'Content Scheduler',
        description: 'Schedule and manage your content across platforms',
        icon: 'scheduler-icon.svg',
        creditCost: 0,
      },
      {
        name: 'prompt_template_generator',
        title: 'Prompt Template Generator',
        description: 'Create custom AI prompt templates',
        icon: 'template-icon.svg',
        creditCost: 2,
      },
      {
        name: 'ai_ad_copy_generator',
        title: 'AI Ad Copy Generator',
        description: 'Generate compelling ad copy with AI',
        icon: 'ad-copy-icon.svg',
        creditCost: 3,
      },
      {
        name: 'ai_headline_generator',
        title: 'AI Headline Generator',
        description: 'Create catchy headlines using AI',
        icon: 'headline-icon.svg',
        creditCost: 2,
      },
      {
        name: 'ai_voice_script_writer',
        title: 'AI Voice Script Writer',
        description: 'Generate voice scripts for videos and podcasts',
        icon: 'voice-script-icon.svg',
        creditCost: 5,
      },
    ];

    for (const service of services) {
      await this.prisma.service.upsert({
        where: { name: service.name },
        update: service,
        create: service,
      });
    }

    console.log(`✅ Created ${services.length} services`);
  }

  private async createSubscriptionPlans() {
    console.log('Creating subscription plans...');

    // Get all services for plan creation
    const services = await this.prisma.service.findMany();
    const serviceIds = services.map((s) => s.id);

    // Free Plan
    const freePlan = await this.prisma.subscriptionPlan.upsert({
      where: { name: 'Free' },
      update: {},
      create: {
        name: 'Free',
        title: 'Free Plan',
        description: 'Perfect for getting started with basic features',
        price: 0,
        durationDays: 30,
        isRecurring: true,
        creditsIncluded: 10,
        isActive: true,
      },
    });

    // Add limited services to free plan
    const freePlanServices = [
      {
        serviceId: services.find((s) => s.name === 'content_generation')!.id,
        usageLimit: 5,
        usagePeriod: UsagePeriod.MONTHLY,
      },
      {
        serviceId: services.find((s) => s.name === 'email_writer')!.id,
        usageLimit: 3,
        usagePeriod: UsagePeriod.MONTHLY,
      },
      {
        serviceId: services.find((s) => s.name === 'hook_generator')!.id,
        usageLimit: 3,
        usagePeriod: UsagePeriod.MONTHLY,
      },
    ];

    for (const planService of freePlanServices) {
      await this.prisma.planService.upsert({
        where: {
          planId_serviceId: {
            planId: freePlan.id,
            serviceId: planService.serviceId,
          },
        },
        update: planService,
        create: {
          planId: freePlan.id,
          ...planService,
        },
      });
    }

    // Pro Plan
    const proPlan = await this.prisma.subscriptionPlan.upsert({
      where: { name: 'Pro' },
      update: {},
      create: {
        name: 'Pro',
        title: 'Professional Plan',
        description: 'Perfect for professionals and small businesses',
        price: 2999, // $29.99
        durationDays: 30,
        isRecurring: true,
        creditsIncluded: 100,
        paddlePlanId: '12345', // Replace with actual Paddle plan ID
        isActive: true,
      },
    });

    // Add generous limits to pro plan
    const proPlanServices = [
      {
        serviceId: services.find((s) => s.name === 'content_generation')!.id,
        usageLimit: 100,
        usagePeriod: UsagePeriod.MONTHLY,
      },
      {
        serviceId: services.find((s) => s.name === 'email_writer')!.id,
        usageLimit: 50,
        usagePeriod: UsagePeriod.MONTHLY,
      },
      {
        serviceId: services.find((s) => s.name === 'hook_generator')!.id,
        usageLimit: 50,
        usagePeriod: UsagePeriod.MONTHLY,
      },
      {
        serviceId: services.find((s) => s.name === 'image_generator')!.id,
        usageLimit: 20,
        usagePeriod: UsagePeriod.MONTHLY,
      },
      {
        serviceId: services.find((s) => s.name === 'post_scheduler')!.id,
        usageLimit: -1,
        usagePeriod: UsagePeriod.MONTHLY,
      }, // Unlimited
    ];

    for (const planService of proPlanServices) {
      await this.prisma.planService.upsert({
        where: {
          planId_serviceId: {
            planId: proPlan.id,
            serviceId: planService.serviceId,
          },
        },
        update: planService,
        create: {
          planId: proPlan.id,
          ...planService,
        },
      });
    }

    // Business Plan
    const businessPlan = await this.prisma.subscriptionPlan.upsert({
      where: { name: 'Business' },
      update: {},
      create: {
        name: 'Business',
        title: 'Business Plan',
        description: 'Perfect for teams and growing businesses',
        price: 9999, // $99.99
        durationDays: 30,
        isRecurring: true,
        creditsIncluded: 500,
        paddlePlanId: '67890', // Replace with actual Paddle plan ID
        isActive: true,
      },
    });

    // Add unlimited access to business plan
    const businessPlanServices = serviceIds.map((serviceId) => ({
      serviceId,
      usageLimit: -1, // Unlimited
      usagePeriod: UsagePeriod.MONTHLY,
    }));

    for (const planService of businessPlanServices) {
      await this.prisma.planService.upsert({
        where: {
          planId_serviceId: {
            planId: businessPlan.id,
            serviceId: planService.serviceId,
          },
        },
        update: planService,
        create: {
          planId: businessPlan.id,
          ...planService,
        },
      });
    }

    console.log('✅ Created subscription plans: Free, Pro, Business');
  }
}
