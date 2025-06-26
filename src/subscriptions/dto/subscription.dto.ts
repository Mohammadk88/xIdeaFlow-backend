import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UsagePeriod } from '@prisma/client';

export class PlanServiceDto {
  @ApiProperty({ description: 'Service ID' })
  @IsString()
  serviceId: string;

  @ApiProperty({
    description: 'Usage limit (-1 for unlimited)',
    example: 100,
    default: -1,
  })
  @IsNumber()
  usageLimit: number;

  @ApiProperty({
    description: 'Usage period',
    enum: UsagePeriod,
    example: UsagePeriod.MONTHLY,
  })
  usagePeriod: UsagePeriod;
}

export class CreatePlanDto {
  @ApiProperty({ description: 'Plan name', example: 'Pro Plan' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Plan display title', example: 'Professional' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Plan description',
    example: 'Perfect for professionals',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price in cents',
    example: 2999,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'Duration in days',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number;

  @ApiProperty({
    description: 'Is recurring subscription',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({
    description: 'Stripe price ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @ApiProperty({
    description: 'Credits included with plan',
    example: 1000,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditsIncluded?: number;

  @ApiProperty({
    description: 'Services included in the plan',
    type: [PlanServiceDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanServiceDto)
  services?: PlanServiceDto[];
}

export class SubscribeToPlanDto {
  @ApiProperty({ description: 'Plan ID to subscribe to' })
  @IsString()
  planId: string;
}
