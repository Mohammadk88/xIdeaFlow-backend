// Re-export Prisma enums for type safety
import {
  PlanType,
  UsagePeriod,
  CreditActionType,
  TransactionType,
  TransactionStatus,
} from '@prisma/client';

export {
  PlanType,
  UsagePeriod,
  CreditActionType,
  TransactionType,
  TransactionStatus,
};

export interface ServiceUsageInfo {
  serviceId: string;
  serviceName: string;
  currentUsage: number;
  limit: number;
  period: UsagePeriod;
  hasAccess: boolean;
  isUnlimited: boolean;
}

export interface CreditCheckResult {
  hasEnoughCredits: boolean;
  requiredCredits: number;
  availableCredits: number;
  message?: string;
}

export interface UsageLimitCheckResult {
  withinLimit: boolean;
  currentUsage: number;
  limit: number;
  period: UsagePeriod;
  message?: string;
}

export interface AIGenerationRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  [key: string]: any;
}

export interface AIGenerationResult {
  content: string;
  model: string;
  tokensUsed: number;
  success: boolean;
  metadata?: any;
}
