import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min, Max } from 'class-validator';

export class PurchaseCreditsDto {
  @ApiProperty({
    description: 'Number of credits to purchase',
    example: 100,
    minimum: 10,
    maximum: 10000,
  })
  @IsNumber()
  @IsPositive()
  @Min(10)
  @Max(10000)
  credits: number;
}

export class CreditBalanceResponseDto {
  @ApiProperty()
  totalCredits: number;

  @ApiProperty()
  usedCredits: number;

  @ApiProperty()
  availableCredits: number;

  @ApiProperty()
  planType: string;
}

export class PaymentIntentResponseDto {
  @ApiProperty()
  clientSecret: string;

  @ApiProperty()
  paymentIntentId: string;
}
